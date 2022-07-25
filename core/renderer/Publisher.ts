
namespace Turf
{
	/** */
	export type PublisherCtor = new(meta: MetaRecord) => Publisher;
	
	/** */
	export abstract class Publisher
	{
		/** */
		static register(staticIdentifier: string, ctor: PublisherCtor)
		{
			this.publishers.set(staticIdentifier, ctor);
		}
		
		/** */
		static get identifier()
		{
			for (const [staticIdentifier, pub] of this.publishers)
				if (pub === (this as any) || pub instanceof this)
					return staticIdentifier;
			
			throw "Publisher not found.";
		}
		
		/**
		 * Stores a map where the keys are the staticIdentifiers of a Publisher, and the 
		 * values are either a Publisher or a Publisher constructor, depending on whether
		 * a publisher of each type has been created (the values are converted from Publisher
		 * constructors to Publisher instances when the user configures one).
		 */
		private static readonly publishers = new Map<string, Publisher | PublisherCtor>();
		
		/**
		 * Returns the publisher of the specified type.
		 */
		static get(ctor: typeof Publisher, meta: MetaRecord)
		{
			for (const pub of this.publishers.values())
				if (pub instanceof ctor)
					return pub;
			
			const pub = new (ctor as any as PublisherCtor)(meta);
			const staticIdentifier = (ctor as any as typeof Publisher).identifier;
			this.publishers.set(staticIdentifier, pub);
			return pub;
		}
		
		/**
		 * Returns the Publisher that is currently set for use.
		 */
		static getCurrent(meta: MetaRecord)
		{
			const staticIdentifier = meta.publishMethod;
			if (!staticIdentifier)
				return null;
			
			const pub = this.publishers.get(staticIdentifier);
			if (!pub)
				return null;
			
			if (pub instanceof Publisher)
				return pub;
			
			const publisherInstance = new pub(meta);
			this.publishers.set(staticIdentifier, publisherInstance);
			return publisherInstance;
		}
		
		/** */
		constructor(protected readonly meta: MetaRecord) { }
		
		/** */
		get identifier()
		{
			return (this.constructor as typeof Publisher).identifier;
		}
		
		/** */
		abstract getSettings(): object;
		
		/** */
		abstract hasSettings(): boolean;
		
		/** */
		abstract deleteSettings(): void;
		
		/** */
		canPublish()
		{
			return true;
		}
		
		/** */
		async publish(files: IRenderedFile[])
		{
			const removeFn = PublishStatusView.show(this.identifier);
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
