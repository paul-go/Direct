
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
		homePostKey: string | null;
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
		 * Called once at startup.
		 * Loads all Blog objects from the database into memory.
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
			
			const blogsList = await Store.current().get(
				Keyva.unbound,
				Store.indexes.fixedName);
			
			for (const [key, object] of blogsList)
			{
				const blogInfo = object as Partial<IBlogProperties>;
				const segment = blogInfo.fixedName ?
					this.parseFixedName(blogInfo.fixedName).segment :
					Key.segmentOf(key as string);
				
				await Blog.fromObject(object, segment);
			}
		}
		
		/**
		 * Creates a new Blog instance from the specified IBlogExport object.
		 * 
		 * If there exists a blog in the database with a name that matches the
		 * fixed name specified in the IBlogExport, then the existing blog
		 * is returned.
		 * 
		 * Otherwise, a new blog is created, which is populated with the data
		 * found in the provided IBlogExport object, and stored in the database.
		 */
		static async new(blogObject: Partial<IBlogExport>)
		{
			if (blogObject.fixedName)
			{
				const existing = this.get(blogObject);
				if (existing)
					return existing;
			}
			
			const blog = await this.fromObject(blogObject, Key.next());
			await blog.save();
			return blog;
		}
		
		/**
		 * Creates a volatile Blog instance from the specified IBlogExport object,
		 * which is not immediately saved within the database.
		 */
		private static async fromObject(blogObject: Partial<IBlogExport>, segment: string)
		{
			const store = Store.current();
			const blog = new Blog(segment);
			
			blog._fixedName = blogObject.fixedName || this.createFixedName();
			blog._friendlyName = blogObject.friendlyName || "Untitled";
			blog._publishMethod = blogObject.publishMethod || "";
			blog._postStream = await PostStream.new(segment);
			
			if (blogObject.homePostKey)
			{
				const homePost = await Model.get(blogObject.homePostKey);
				if (homePost instanceof PostRecord)
					blog._homePost = homePost;
			}
			
			if (!blog._homePost)
			{
				blog._homePost = new PostRecord();
				blog._homePost.slug = "";
				await blog.retainPost(blog._homePost);
			}
			
			if (blogObject.objects?.length)
			{
				await store.set([
					...Object.entries(blogObject.objects),
					...(blogObject.blobs?.entries() || []),
				]);
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
			if (name.fixedName)
				return this.blogs.find(b => name.fixedName === b.fixedName) || null;
			
			if (name.friendlyName)
				return this.blogs.find(b => name.friendlyName === b.friendlyName) || null;
			
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
		
		/**
		 * Creates a "fixed" name for the blog, which is an internal name
		 * that doesn't change, is globally unique, and contains information
		 * about the blog.
		 */
		private static createFixedName()
		{
			const segment = Key.next();
			const time = Date.now().toString(36);
			const rnd = Util.randomChars(16);
			return  [segment, time, rnd].join("-");
		}
		
		/**
		 * Parses a fixed name created with the .createFixedName() method
		 * into it's components.
		 */
		private static parseFixedName(fixedName: string)
		{
			const parts = fixedName.split("-");
			return {
				segment: parts[0] || "",
				time: new Date(Number(parts[1]) || 0),
				rnd: parts[2] || ""
			};
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
				homePostKey: this._homePost ? Key.of(this._homePost) : null,
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
