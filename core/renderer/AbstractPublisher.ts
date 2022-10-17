
namespace App
{
	export type PublisherConstructor = new(within: Element | Hat.IHat | Blog) => AbstractPublisher;
	
	/** */
	export namespace Publishers
	{
		/** */
		export function register(publisherCtor: PublisherConstructor, position = 0)
		{
			publisherCtors.splice(position, 0, publisherCtor);
		}
		
		/**
		 * Creates instances of each available publisher, from an HTMLElement
		 * that is within an AppContainer that contains the Blog being published.
		 */
		export function create(within: HTMLElement)
		{
			const publishers: AbstractPublisher[] = [];
			for (const ctor of publisherCtors)
			{
				const publisher = new ctor(within);
				publishers.push(publisher);
			}
			
			return publishers;
		}
	}
	
	const publisherCtors: PublisherConstructor[] = [];
	
	/** */
	export abstract class AbstractPublisher
	{
		/** */
		constructor(within: Element | Hat.IHat | Blog)
		{
			if (within instanceof Blog)
				this._blog = within;
			
			else if (within instanceof AppContainer)
				this._blog = within.blog;
			
			else this.blogResolver = within;
		}
		
		/** An object which is later used to resolve the Blog.  */
		private blogResolver: Element | Hat.IHat | null = null;
		
		/** */
		abstract readonly name: string;
		
		/**
		 * Attempts a publish operation if this publisher is properly
		 * configured. If an HTMLElement is returned, it is assumed
		 * to be a configuration screen that should be displayed
		 * in the user interface.
		 * 
		 * If null is returned, this indicates that the publish operation
		 * was successful, and the UI should adapt accordingly.
		 * 
		 * If undefined is returned, this indicates that the operation
		 * was canceled, and the current UI state should remain as-is.
		 */
		abstract tryPublish(showConfig?: boolean): Promise<HTMLElement | null | undefined>;
		
		/** */
		protected abstract transferFiles(files: IRenderedFile[], hat: PublishStatusHat): Promise<string>;
		
		/** */
		protected get blog()
		{
			if (!this._blog)
			{
				const resolver = Not.nullable(this.blogResolver);
				this._blog = AppContainer.of(resolver).blog;
			}
			return this._blog;
		}
		private _blog: Blog | null = null;
		
		/** */
		protected getPublishParam<T extends string | number | boolean>(paramKey: string, fallback: T): T
		{
			return this.blog.getPublishParam(this.name, paramKey, fallback);
		}
		
		/** */
		protected setPublishParam(paramKey: string, value: string | number | boolean)
		{
			this.blog.setPublishParam(this.name, paramKey, value);
		}
		
		/** */
		protected async publish()
		{
			Hat.nearest(this.blogResolver || document.body, MainMenuHat)?.hide();
			
			const statusHat = PublishStatusHat.get(this.name);
			const postsChanged: PostRecord[] = [];
			const slugs: string[] = [];
			const home = this.blog.homePost;
			
			if (home.dateModified > home.getPublishDate(this.name))
				postsChanged.push(home);
			
			for (const future of this.blog.postStream.query())
			{
				const partial = await future.getPartialPost();
				const published = partial.getPublishDate(this.name);
				
				if (partial.dateModified > published)
				{
					const post = await future.getPost();
					postsChanged.push(post);
				}
				
				slugs.push(partial.slug);
			}
			
			if (postsChanged.length === 0)
				return void statusHat.remove();
			
			const blogFiles: IRenderedFile[] = [
				{
					data: slugs.join("\n"),
					fileName: ConstS.essIndexListDefaultValue,
					mime: Mime.Type.txt,
				},
				{
					data: ["User-agent: *", "Allow: /"].join("\n"),
					fileName: "robots.txt",
					mime: Mime.Type.txt,
				},
				// TODO: Add sitemap.xml (requires domain), as well as favicons
			];
			
			let error = "";
			
			block:
			{
				const postFiles = await this.getPostFiles(postsChanged);
				if (typeof postFiles === "string")
				{
					error = postFiles;
					break block;
				}
				
				const files = [...blogFiles, ...postFiles];
				if (files.length === 0)
					break block;
				
				const maybeError = await this.transferFiles(files, statusHat);
				if (maybeError)
				{
					error = maybeError;
					break block;
				}
				
				postsChanged.map(p => p.setPublishDate(this.name));
			}
			
			if (error)
				alert(error);
			
			statusHat.remove();
		}
		
		/** */
		protected async getPostFiles(postsChanged: PostRecord[]): Promise<IRenderedFile[] | string>
		{
			const postFiles: IRenderedFile[] = [];
			for (const post of postsChanged)
				postFiles.push(...await Render.getPostFiles(post, this.blog));
			
			return postFiles;
		}
	}
}
