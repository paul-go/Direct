
namespace App
{
	/** */
	export namespace Publishers
	{
		/** */
		export function register(publisherCtor: new() => AbstractPublisher, position = 0)
		{
			publisherCtors.splice(position, 0, publisherCtor);
		}
		
		/**
		 * Creates instances of each available publisher, from an HTMLElement
		 * that is within an AppContainer that contains the Blog being published.
		 */
		export function create(via: HTMLElement)
		{
			const publishers: AbstractPublisher[] = [];
			for (const ctor of publisherCtors)
			{
				const publisher = new ctor();
				publishers.push(publisher);
				owners.set(publisher, via);
			}
			
			return publishers;
		}
	}
	
	const publisherCtors: (new() => AbstractPublisher)[] = [];
	const owners = new WeakMap<AbstractPublisher, HTMLElement>();
	
	/** */
	export abstract class AbstractPublisher
	{
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
		abstract tryPublish(showConfig: boolean): Promise<HTMLElement | null | undefined>;
		
		/** */
		get storageKey()
		{
			return this.name.toLowerCase().replace(/\s/, "-");
		}
		
		/** */
		protected get blog()
		{
			if (!this._blog)
			{
				const owner = Not.nullable(owners.get(this));
				this._blog = AppContainer.of(owner).blog;
			}
			return this._blog;
		}
		private _blog: Blog | null = null;
		
		/** */
		protected getPublishParam<T extends string | number | boolean>(paramKey: string, fallback: T): T
		{
			return this.blog.getPublishParam(this.storageKey, paramKey, fallback);
		}
		
		/** */
		protected setPublishParam(paramKey: string, value: string | number | boolean)
		{
			this.blog.setPublishParam(this.storageKey, paramKey, value);
		}
	}
}
