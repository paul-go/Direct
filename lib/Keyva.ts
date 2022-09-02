
class Keyva
{
	/**
	 * An IDBKeyRange that has no upper or lower boundary.
	 */
	static readonly unbound = IDBKeyRange.lowerBound(Number.MIN_SAFE_INTEGER);
	
	/**
	 * Returns an IDBKeyRange that matches all keys that start
	 * with the specified string prefix.
	 */
	static prefix(prefix: string)
	{
		return IDBKeyRange.bound(prefix, prefix + "\uFFFF");
	}
	
	/**
	 * @returns An array of strings that contain the names of all 
	 * Keyva-created IndexedDB databases.
	 */
	static async each()
	{
		const databases = await indexedDB.databases();
		return databases
			.map(db => db.name)
			.filter((s): s is string => !!s && s.startsWith(this.kvPrefix));
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
			names.map(n => n.startsWith(this.kvPrefix) ? n : this.kvPrefix + n) : 
			await this.each();
		
		Promise.all(names.map(n => this.asPromise(indexedDB.deleteDatabase(n))));
	}
	
	/** */
	private static readonly kvPrefix = "-keyva-";
	
	/**
	 * 
	 */
	constructor(options: Keyva.IConstructorOptions = {})
	{
		const idx = options.indexes || [];
		this.indexes = (Array.isArray(idx) ? idx : [idx]).sort();
		this.name = Keyva.kvPrefix + (options.name || "");
	}
	
	private readonly indexes: string[];
	private readonly name: string;
	
	/**
	 * Gets all keys and values from the Keyva database.
	 * @param key The key of the value to get.
	 */
	get<T = any>(): Promise<[Keyva.Key, T][]>;
	/**
	 * Get a value by its key.
	 * @param key The key of the value to get.
	 */
	get<T = any>(key: Keyva.Key): Promise<T>;
	/**
	 * Get a series of values from the keys specified.
	 * @param keys The key of the value to get.
	 */
	get<T = any>(keys: Keyva.Key[]): Promise<T[]>;
	/**
	 * Gets an object that contains the specified indexed value.
	 * 
	 * @returns The first object in the Keyva database within the index,
	 * or null in the case when no matching object could be found.
	 */
	get<T = any>(value: Keyva.Key, index: string): Promise<T>;
	/**
	 * Gets an array of keys and objects, where the keys are within
	 * the specified range, optionally from the specified index.
	 * 
	 * @returns An array of key/value tuples containing the results.
	 */
	get(range: IDBKeyRange, index?: string): Promise<[Keyva.Key, any][]>;
	/**
	 * Gets an array of keys, where the keys are within
	 * the specified range, optionally from the specified index.
	 * 
	 * @returns An array of keys containing the results.
	 */
	get(range: IDBKeyRange, index: string, keys?: typeof Keyva["keys"]): Promise<Keyva.Key[]>;
	/**
	 * Gets an array of values, where the corresponding keys are within
	 * the specified range, optionally from the specified index.
	 * 
	 * @returns An array of values containing the results.
	 */
	get<T = any>(range: IDBKeyRange, index: string, values?: typeof Keyva["values"]): Promise<T[]>;
	/**
	 * Gets an array of keys, where the keys are within
	 * the specified range.
	 * 
	 * @returns An array of keys containing the results.
	 */
	get(range: IDBKeyRange, keys?: typeof Keyva["keys"]): Promise<Keyva.Key[]>;
	/**
	 * Gets an array of values, where the corresponding keys are within
	 * the specified range.
	 * 
	 * @returns An array of values containing the results.
	 */
	get<T = any>(range: IDBKeyRange, values?: typeof Keyva["values"]): Promise<T>;
	/** */
	async get(k?: Keyva.Key | Keyva.Key[] | IDBKeyRange, ...options: any[])
	{
		const store = await this.getStore("readonly");
		const index = options.find((op): op is string => typeof op === "string") || "";
		k ??= Keyva.unbound;
		
		if (k instanceof IDBKeyRange)
		{
			const target = index ? store.index(index) : store;
			
			if (options.includes(Keyva.keys))
				return Keyva.asPromise(target.getAllKeys(k));
			
			if (options.includes(Keyva.values))
				return Keyva.asPromise(target.getAll(k));
			
			let keys: Keyva.Key[] = [];
			let values: any[] = [];
			
			await Promise.allSettled([
				new Promise<void>(async r =>
				{
					const results = await Keyva.asPromise(target.getAllKeys(k));
					keys.push(...results as Keyva.Key[]);
					r();
				}),
				new Promise<void>(async r =>
				{
					const results = await Keyva.asPromise(target.getAll(k));
					values.push(...results);
					r();
				}),
			]);
			
			const tuples: [Keyva.Key, any][] = [];
			
			for (let i = -1; ++i < keys.length;)
				tuples.push([keys[i], values[i]]);
			
			return tuples;
		}
		else
		{
			if (index)
				return Keyva.asPromise(store.index(index).get(k));
			
			return Array.isArray(k) ?
				Promise.all(k.map(key => Keyva.asPromise(store.get(key)))) :
				Keyva.asPromise(store.get(k));
		}
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
		arg ??= Keyva.unbound;
		
		if (Array.isArray(arg))
		{
			for (const key of arg)
				store.delete(key);
		}
		else store.delete(arg);
			
		return Keyva.asPromise(store.transaction);
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
	
	if (typeof Symbol === "undefined")
		(window as any).Symbol = () => Object.freeze({});
	
	export const keys = Symbol("keys");
	export const values = Symbol("values");
	
	declare var module: any;
	if (typeof module === "object")
		Object.assign(module.exports, { Keyva });
}
