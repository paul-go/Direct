
namespace App
{
	/** */
	export type PublisherCtor = new(post: PostRecord, blog: Blog) => Publisher;
	
	/** */
	export abstract class Publisher
	{
		/** */
		static register(publisherCtor: PublisherCtor, position = 0)
		{
			this.registrations.splice(position, 0, publisherCtor);
		}
		private static readonly registrations: PublisherCtor[] = [];
		
		/**
		 * 
		 */
		static getPublishers(post: PostRecord, blog: Blog)
		{
			const publishers: Publisher[] = [];
			
			for (const ctor of this.registrations)
			{
				const pub = new ctor(post, blog);
				publishers.push(pub);
			}
			
			return publishers;
		}
		
		/**
		 * Returns the Publisher that is currently set for use.
		 */
		static getCurrentPublisher(post: PostRecord, blog: Blog)
		{
			const key = blog.publishMethod;
			if (!key)
				return null;
			
			for (const ctor of this.registrations)
			{
				const pub = new ctor(post, blog);
				if (pub.key === key)
					return pub;
			}
			
			return null;
		}
		
		/** */
		constructor(
			readonly post: PostRecord,
			protected readonly blog: Blog)
		{
			this.canHaveSlug = post !== blog.homePost;
		}
		
		/** */
		abstract readonly head: HTMLElement;
		
		/** */
		abstract readonly key: string;
		
		/** */
		abstract readonly label: string;
		
		/** */
		readonly canHaveSlug: boolean;
		
		/** */
		shouldInsert()
		{
			return Promise.resolve(true);
		}
		
		/** */
		renderLink()
		{
			return UI.text(this.label, 22, 700);
		}
		
		/** */
		renderTitle(text: string)
		{
			return Hot.div(
				{
					marginBottom: "1em",
				},
				...UI.text(text, 30, 700)
			);
		}
		
		/** */
		renderActionButton(label: string, callback: () => void)
		{
			return UI.actionButton(
				"filled",
				{
					marginTop: "40px",
					maxWidth: "400px",
					backgroundColor: UI.gray(60),
				},
				...UI.click(callback),
				new Text(label),
			);
		}
		
		/** */
		renderPublishButton()
		{
			return Hot.div(
				{
					marginTop: "40px",
				},
				...UI.text("Publish", 25, 800),
				...UI.click(() =>
				{
					this.close();
					this.publish();
				})
			);
		}
		
		/**
		 * Opens the output in the operating system's default handler.
		 */
		async openOutput() { }
		
		/**
		 * Gets a string that describes the location of where the publish
		 * action is going to write the files. If a falsey value is returned,
		 * this indicates that this Publisher is currently incapable of publishing.
		 */
		getPublishDestinationRoot()
		{
			return "";
		}
		
		/** */
		canPublish()
		{
			return !!this.getPublishDestinationRoot();
		}
		
		/** */
		protected setPublishParam(paramKey: string, value: string | number | boolean)
		{
			this.blog.setPublishParam(this.key, paramKey, value);
			//When.connected(this.head, () => Hat.over(this, PostHat).updatePublishInfo());
		}
		
		/** */
		protected close()
		{
			Hat.over(this, PublishSetupHat)?.close();
			
			// Scroll the window to the bottom, in order to make sure
			// that the publishing information is visible.
			window.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior: "smooth" });
		}
		
		/** */
		async publish()
		{
			const files = [
				...(await Render.getPostFiles(this.post, this.blog)),
				...(await Render.getStandardFiles()),
			];
			
			const hat = PublishStatusHat.get(this.label);
			const maybeError = await this.executePublish(files);
			
			if (maybeError)
				alert(maybeError);
			
			hat.remove();
		}
		
		/** */
		protected abstract executePublish(files: IRenderedFile[]): Promise<string>;
		
		/** */
		protected async pathJoin(...parts: string[])
		{
			if (TAURI)
				return await Tauri.path.join(...parts);
			
			if (ELECTRON)
				return Electron.path.join(...parts);
			
			// Cheesy path join function, but should work for our purposes here.
			return parts
				.filter(s => !!s)
				.map(s => s.replace(/\/$/, ""))
				.join("/");
		}
	}
}
