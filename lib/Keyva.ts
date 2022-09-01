
class Keyva
{
	/**
	 * @returns An array of strings that contain the names of all 
	 * Keyva-created IndexedDB databases.
	 */
	static async each()
	{
		const databases = await indexedDB.databases();
		return databases
			.map(db => db.name)
			.filter((s): s is string => !!s && s.startsWith(this.prefix));
	}
	
	/**
	 * Deletes Keyva-created IndexedDB databases with the 
	 * specified names.
	 * 
	 * @param names The names of the databases to delete. 
	 * If no names are provided, all Keyva IndexedDB databases 
	 * are deleted.
	 */
	static async delete(...names: string[])
	{
		names = names.length ? 
			names.map(n => n.startsWith(this.prefix) ? n : this.prefix + n) : 
			await this.each();
		
		Promise.all(names.map(n => this.asPromise(indexedDB.deleteDatabase(n))));
	}
	
	/** */
	private static readonly prefix = "-keyva-";
	
	/**
	 * 
	 */
	constructor(options: Keyva.IConstructorOptions = {})
	{
		const idx = options.indexes || [];
		this.indexes = (Array.isArray(idx) ? idx : [idx]).sort();
		this.name = Keyva.prefix + (options.name || "");
	}
	
	private readonly indexes: string[];
	private readonly name: string;
	
	/**
	 * Get a value by its key.
	 * @param key The key of the value to get.
	 */
	async get<T = any>(key: Keyva.Key): Promise<T>;
	/**
	 * Get a series of values from the keys specified.
	 * @param keys The key of the value to get.
	 */
	async get<T = any>(keys: Keyva.Key[]): Promise<T[]>;
	/**
	 * Gets an object that contains the specified indexed value.
	 * 
	 * @returns The first object in the Keyva database within the index,
	 * or null in the case when no matching object could be found.
	 */
	async get<T = any>(value: Keyva.Key, index: string): Promise<T>;
	async get<T>(k: Keyva.Key | Keyva.Key[], index?: string)
	{
		const store = await this.getStore("readonly");
		
		if (!index)
			return Array.isArray(k) ?
				Promise.all(k.map(key => Keyva.asPromise(store.get(key)))) :
				Keyva.asPromise(store.get(k));
		
		for await (const result of this.each({ index, range: IDBKeyRange.only(k) }))
			return result as any as T;
		
		return null;
	}
	
	/**
	 * Set a value with a key.
	 */
	async set(key: Keyva.Key, value: any): Promise<void>;
	/**
	 * Set multiple values at once. This is faster than calling set() multiple times.
	 * It's also atomic – if one of the pairs can't be added, none will be added.
	 * @param entries Array of entries, where each entry is an array of `[key, value]`.
	 */
	async set(entries: [Keyva.Key, any][]): Promise<void>;
	async set(a: any, b?: any)
	{
		const store = await this.getStore("readwrite");
		if (Array.isArray(a))
		{
			for (const entry of (a as [Keyva.Key, any][]))
				store.put(entry[1], entry[0]);
			
			return Keyva.asPromise(store.transaction);
		}
		
		store.put(b, a);
		return Keyva.asPromise(store.transaction);
	}
	
	/**
	 * Deletes all objects from this Keyva database 
	 * (but keeps the Keyva database itself is kept).
	 */
	async delete(): Promise<void>;
	/**
	 * Delete a single object from the store with the specified key.
	 */
	async delete(range: IDBKeyRange): Promise<void>;
	/**
	 * Delete a single object from the store with the specified key.
	 */
	async delete(key: Keyva.Key): Promise<void>;
	/**
	 * Delete a series of objects from the store at once, with the specified keys.
	 */
	async delete(keys: Keyva.Key[]): Promise<void>;
	async delete(arg?: Keyva.Key | Keyva.Key[] | IDBKeyRange)
	{
		const store = await this.getStore("readwrite");
		arg ??= IDBKeyRange.lowerBound(Number.MIN_SAFE_INTEGER);
		
		if (Array.isArray(arg))
		{
			for (const key of arg)
				store.delete(key);
		}
		else store.delete(arg);
			
		return Keyva.asPromise(store.transaction);
	}
	
	/**
	 * Iterates through all entries in the database, yielding each raw JSON value. 
	 */
	async * each<T = any>(options: { index?: string, range?: IDBKeyRange, backward?: boolean } = {})
	{
		const store = await this.getStore("readonly");
		const target = options.index ? store.index(options.index) : store;
		const direction = options.backward ? "prev" : "next";
		const cursor = target.openCursor(options.range, direction);
		
		let resolver: (() => void) | null = null;
		let key: Keyva.Key | null = null;
		let object: any = null;
		let done = false;
		
		cursor.onsuccess = () =>
		{
			const r = cursor.result;
			if (r)
			{
				key = r.key as Keyva.Key;
				object = r.value;
				r.continue();
			}
			else done = true;
			
			if (resolver)
				resolver();
		};
		
		for (;;)
		{
			await new Promise<void>(r => resolver = r);
			if (done)
				break;
			
			yield [object, key] as any as [T, Keyva.Key];
		}
	}
	
	/** */
	private async getStore(mode: IDBTransactionMode)
	{
		const db = await this.getDatabase();
		return db.transaction(this.name, mode).objectStore(this.name);
	}
	
	/** */
	private async getDatabase()
	{
		if (!this.database)
		{
			await this.maybeFixSafari();
			let quit = false;
			let version: number | undefined;
			let indexNamesAdded: string[] = [];
			let indexNamesRemoved: string[] = [];
			
			for (;;)
			{
				const request = indexedDB.open(this.name, version);
				request.onupgradeneeded = () =>
				{
					const db = request.result;
					const tx = request.transaction!;
					
					const store = tx.objectStoreNames.contains(this.name) ? 
						tx.objectStore(this.name) :
						db.createObjectStore(this.name);
					
					for (const index of indexNamesAdded)
						store.createIndex(index, index);
					
					for (const index of indexNamesRemoved)
						store.deleteIndex(index);
				};
				this.database = await Keyva.asPromise(request);
				
				if (quit)
					break;
				
				const tx = this.database.transaction(this.name, "readonly");
				const store = tx.objectStore(this.name);
				const indexNames = Array.from(store.indexNames).sort();
				tx.abort();
				
				indexNamesAdded = this.indexes.filter(n => !indexNames.includes(n));
				indexNamesRemoved = indexNames.filter(n => !this.indexes.includes(n));
				
				if (indexNamesAdded.length + indexNamesRemoved.length === 0)
					break;
				
				quit = true;
				this.database.close();
				version = this.database.version + 1;
			}
		}
		
		return this.database;
	}
	private database: IDBDatabase | null = null;
	
	/**
	 * Works around a Safari 14 bug.
	 * 
	 * Safari has a bug where IDB requests can hang while the browser is 
	 * starting up. https://bugs.webkit.org/show_bug.cgi?id=226547
	 * The only solution is to keep nudging it until it's awake.
	 */
	private async maybeFixSafari()
	{
		if (!/Version\/14\.\d*\s*Safari\//.test(navigator.userAgent))
			return;
		
		let id: any = 0;
		return new Promise<void>(resolve =>
		{
			const hit = () => indexedDB.databases().finally(resolve);
			id = setInterval(hit, 50);
			hit();
  		})
		.finally(() => clearInterval(id));
	}
	
	/** */
	private static asPromise<T = undefined>(request: IDBRequest<T> | IDBTransaction)
	{
		return new Promise<T>((resolve, reject) =>
		{
			// @ts-ignore
			request.oncomplete = request.onsuccess = () => resolve(request.result);
			
			// @ts-ignore
    			request.onabort = request.onerror = () => reject(request.error);
		});
	}
}

namespace Keyva
{
	/** */
	export interface IConstructorOptions
	{
		indexes?: string | string[];
		name?: string | number;
	}
	
	/** */
	export type Key = string | number | Date | BufferSource;
	
	declare var module: any;
	if (typeof module === "object")
		Object.assign(module.exports, { Keyva });
}
