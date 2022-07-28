
namespace Turf
{
	/** */
	export type PublisherCtor = new(patch: PatchRecord, meta: MetaRecord) => Publisher;
	
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
		static getPublishers(patch: PatchRecord, meta: MetaRecord)
		{
			const publishers: Publisher[] = [];
			
			for (const ctor of this.registrations)
			{
				const pub = new ctor(patch, meta);
				publishers.push(pub);
			}
			
			return publishers;
		}
		
		/**
		 * Returns the Publisher that is currently set for use.
		 */
		static getCurrentPublisher(patch: PatchRecord, meta: MetaRecord)
		{
			const key = meta.publishMethod;
			if (!key)
				return null;
			
			for (const ctor of this.registrations)
			{
				const pub = new ctor(patch, meta);
				if (pub.key === key)
					return pub;
			}
			
			return null;
		}
		
		/** */
		constructor(
			readonly patch: PatchRecord,
			protected readonly meta: MetaRecord) { }
		
		/** */
		abstract readonly root: HTMLElement;
		
		/** */
		abstract readonly key: string;
		
		/** */
		abstract readonly label: string;
		
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
			return Htx.div(
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
			return Htx.div(
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
		 * Gets a string description of the location where the publish
		 * action is going to write the files. If an empty string is returned,
		 * this indicates that this Publisher is currently incapable of publishing.
		 */
		getPublishDestinationText()
		{
			return "";
		}
		
		/** */
		canPublish()
		{
			return !!this.getPublishDestinationText();
		}
		
		/** */
		protected setPublishParam(paramKey: string, value: string | number | boolean)
		{
			this.meta.setPublishParam(this.key, paramKey, value);
			Htx.defer(this.root, () => Controller.over(this, PatchView).updatePublishInfo());
		}
		
		/** */
		protected close()
		{
			Controller.over(this, PublishSetupView)?.close();
		}
		
		/** */
		async publish()
		{
			const files = [
				...(await Render.getPatchFiles(this.patch, this.meta)),
				...(await Render.getSupportFiles()),
			];
			
			const removeFn = PublishStatusView.show(this.label);
			const maybeError = await this.executePublish(files);
			
			if (maybeError)
				alert(maybeError);
			
			removeFn();
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
