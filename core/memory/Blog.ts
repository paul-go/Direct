
namespace App
{
	/** */
	export interface IBlogName
	{
		friendlyName: string;
		fixedName: string;
	}
	
	/** */
	export interface IBlogProperties extends IBlogName
	{
		homePost: string | null;
		publishMethod?: string;
		publishParams?: Literal<string, Literal<string, string | number | boolean>>;
	}
	
	/** */
	export interface IBlogAbout extends IBlogProperties
	{
		objects: [Key, object][];
	}
	
	/** */
	export interface IBlogExport extends IBlogAbout
	{
		blobs: [Key, Blob][];
	}
	
	/** */
	export class PartialPost
	{
		constructor(
			readonly key: Key,
			readonly dateCreated: number,
			readonly datePublished: number)
		{ }
		
		/** */
		equals(post: PostRecord)
		{
			return Key.of(post) === this.key;
		}
	}
	
	/** */
	export class Blog
	{
		/**
		 * Called at startup. Loads all Blog objects from the database into memory.
		 */
		static async init()
		{
			Key.declare(
				{ ctor: App.PostRecord, stable: 1 },
				{ ctor: App.CanvasSceneRecord, stable: 2 },
				{ ctor: App.ProseSceneRecord, stable: 3 },
				{ ctor: App.GallerySceneRecord, stable: 4 },
				{ ctor: App.FrameRecord, stable: 5 },
				{ ctor: App.MediaRecord, stable: 6 },
				{ ctor: App.BackgroundRecord, stable: 7 },
				{ ctor: App.ActionRecord, stable: 8 },
			);
			
			const blogResults = await Store.current().get(
				Keyva.unbound,
				Store.indexes.fixedName);
			
			for (const [key, object] of blogResults)
			{
				const segment = Key.segmentOf(key as string);
				await Blog.create(object, segment);
			}
		}
		
		/** */
		static async new(blogObject: Partial<IBlogExport>)
		{
			const blog = await this.create(blogObject, Key.next());
			await blog.save();
			return blog;
		}
		
		/** */
		private static async create(blogObject: Partial<IBlogExport>, segment: string)
		{
			const store = Store.current();
			const blog = new Blog(segment);
			
			blog._fixedName = blogObject.fixedName || Util.unique();
			blog._friendlyName = blogObject.friendlyName || "Untitled";
			blog._publishMethod = blogObject.publishMethod || "";
			blog._postStream = await PostStream.new(segment);
			
			if (blogObject.objects?.length)
			{
				await store.set([
					...Object.entries(blogObject.objects),
					...(blogObject.blobs?.entries() || []),
				]);
			}
			
			if (blogObject.homePost)
			{
				blog._homePost = await store.get(blogObject.homePost);
			}
			else
			{
				blog._homePost = new PostRecord();
				blog._homePost.slug = "";
				await blog.retainPost(blog._homePost);
			}
			
			this.blogs.push(blog);
			return blog;
		}
		
		/** */
		static getAll(): readonly Blog[]
		{
			return this.blogs;
		}
		
		/** */
		static get(name: Partial<IBlogName>): Blog | null
		{
			if (name.friendlyName)
				return this.blogs.find(b => name.friendlyName === b.friendlyName) || null;
			
			if (name.fixedName)
				return this.blogs.find(b => name.fixedName === b.fixedName) || null;
			
			return null;
		}
		
		/** */
		static async delete(name: Partial<IBlogName>)
		{
			const blog = this.get(name);
			if (!blog)
				return;
			
			const store = Store.current();
			const range = Key.startsWith(blog.keySegment);
			
			await Promise.allSettled([
				store.delete(range),
			]);
		}
		
		private static blogs: Blog[] = [];
		
		/** */
		static isValidFriendlyName(name: string)
		{
			if (name.trim().length === 0)
				return false;
			
			return /^[a-z0-9\s]+$/gi.test(name);
		}
		
		/** */
		private constructor(
			private readonly keySegment: string
		) { }
		
		/** */
		get friendlyName()
		{
			return this._friendlyName;
		}
		set friendlyName(friendlyName: string)
		{
			this._friendlyName = friendlyName;
			this.save();
		}
		private _friendlyName = "Untitled";
		
		/** */
		get fixedName()
		{
			return this._fixedName;
		}
		set fixedName(fixedName: string)
		{
			this._fixedName = fixedName;
			this.save();
		}
		private _fixedName = "";
		
		/** */
		get postStream()
		{
			return Not.nullable(this._postStream);
		}
		private _postStream: PostStream | null = null;
		
		/** */
		get homePost()
		{
			return Not.nullable(this._homePost);
		}
		set homePost(post: PostRecord)
		{
			this._homePost = post;
			this.save();
		}
		private _homePost: PostRecord | null = null;
		
		/** */
		get publishMethod()
		{
			return this._publishMethod;
		}
		set publishMethod(value: string)
		{
			this._publishMethod = value;
			this.save();
		}
		private _publishMethod = "";
		
		/**
		 * Stores an object where the keys line up with a particular label
		 * refering to a publish method, and the values refer to objects whose
		 * structure differs depending on the publish method.
		 * 
		 * There should be a separate entry in the top-level publishData object
		 * for each publish method that has been configured.
		 */
		publishParams: Literal<string, Literal<string, string | number | boolean>> = {};
		
		/** */
		getPublishParam<T extends string | number | boolean>(
			publishKey: string,
			paramKey: string,
			fallback: T): T
		{
			let out = this.publishParams[publishKey]?.[paramKey];
			if (out !== undefined)
				return out as T;
			
			this.setPublishParam(publishKey, paramKey, fallback);
			return fallback;
		}
		
		/**
		 * Sets a value in a publish parameter table.
		 * Returns a boolean value indicating whether the value was changed;
		 */
		setPublishParam(
			publisherKey: string,
			paramKey: string,
			value: string | number | boolean): boolean
		{
			const p = this.publishParams;
			const current = p[publisherKey]?.[paramKey];
			const changed = current !== value;
			(p[publisherKey] ||= {})[paramKey] = value;
			
			if (changed)
				this.save();
			
			return changed;
		}
		
		/** */
		hasPublishParams(publisherKey: string)
		{
			return publisherKey in this.publishParams;
		}
		
		/** */
		private toJSON(): IBlogProperties
		{
			return {
				friendlyName: this.friendlyName,
				fixedName: this.fixedName,
				homePost: this._homePost ? Key.of(this._homePost) : null,
				publishMethod: this._publishMethod,
			};
		}
		
		/** */
		private save()
		{
			const blogObject = this.toJSON();
			return Store.current().set(this.keySegment, blogObject);
		}
		
		/** */
		async retainPost(post: PostRecord)
		{
			await Model.retain(post, this.keySegment);
			
			if (!post.isHomePost && !this.postStream.has(post))
				this.postStream.insert(post);
		}
		
		/** */
		async export()
		{
			const blogObject: IBlogExport = {
				...this.toJSON(),
				objects: [],
				blobs: [],
			};
			
			const range = Key.startsWith(this.keySegment);
			
			for (const [key, object] of await Store.current().get(range))
			{
				if (object instanceof Blob)
				{
					const ext = Mime.extensionOf(object.type) || "txt";
					const blobFileName = key + "." + ext;
					blogObject.blobs.push([blobFileName, object]);
				}
				else blogObject.objects.push([key as Key, object]);
			}
			
			return blogObject;
		}
	}
}
