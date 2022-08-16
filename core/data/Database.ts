
namespace App
{
	export type RecordConstructor<R extends Record = Record> = new(id?: string) => R;
	export type GetBehavior = "get" | "peek";
	type ID = number;
	
	/** */
	export interface IConfig
	{
		ctor: RecordConstructor;
		stable: number;
		root?: boolean;
	}
	
	/** */
	export interface IDatabaseAbout
	{
		name?: string;
		id?: string;
		objects?: RecordJson<any>[];
		blobs?: Map<string, Blob>;
	}
	
	/** */
	export class Database
	{
		/** */
		private static get databases()
		{
			return this._databases || (this._databases = new IterableWeakMap<string, Database>());
		 }
		private static _databases: IterableWeakMap<string, Database> | undefined = undefined;
		
		/** */
		static tryRename(currentName: string, newName: string)
		{
			if (!currentName || !newName)
				return false;
			
			const id = this.getId(currentName);
			if (!id)
				return false;
			
			localStorage.setItem(dbIdPrefix + id, newName);
			return true;
		}
		
		/** */
		static getNames()
		{
			return this.getAll().map(a => a[1]).sort();
		}
		
		/** */
		static getIds()
		{
			return this.getAll().map(a => a[0]);
		}
		
		/** */
		private static getAll()
		{
			const entries: [string, string][] = [];
			
			for (let i = -1; ++ i < localStorage.length;)
			{
				const key = localStorage.key(i);
				if (key?.startsWith(dbIdPrefix))
				{
					const name = localStorage.getItem(key);
					if (name)
						entries.push([key.slice(dbIdPrefix.length), name]);
				}
			}
			
			return entries;
		}
		
		/**
		 * Returns a reference to the Database with the specified name,
		 * if that is currently open. If the database with the specified
		 * name exists but is not open, null is returned.
		 */
		static get(name: string)
		{
			const id = this.getId(name);
			return id ? this.databases.get(id) || null : null;
		}
		
		/** */
		static getName(id: string)
		{
			return localStorage.getItem(dbIdPrefix + id) || "";
		}
		
		/** */
		static getId(name: string)
		{
			for (let i = -1; ++i < localStorage.length;)
			{
				const key = localStorage.key(i);
				if (key?.startsWith(dbIdPrefix))
					if (localStorage.getItem(key) === name)
						return key.slice(dbIdPrefix.length);
			}
			
			return null;
		}
		
		/**
		 * Generates a globally unique ID for the database.
		 */
		static generateId()
		{
			return Date.now().toString() + "-" + Util.randomChars(16);
		}
		
		/**
		 * Returns a new Database instance, which is connected to the database
		 * in IndexedDB with the specified name. Creates a new database if one
		 * does not already exist.
		 */
		static async new(about: IDatabaseAbout, ...configurations: IConfig[])
		{
			let name = about.name || "";
			let id = about.id || "";
			
			if (about.name && !about.id)
				id = this.getId(about.name) || "";
			
			if (!about.name && about.id)
				name = this.getName(about.id) || "";
			
			name ||= "untitled-" + Math.random().toString().slice(4);
			id ||= this.generateId();
			localStorage.setItem(dbIdPrefix + id, name);
			
			return new Promise<Database>(r =>
			{
				const openRequest = indexedDB.open(id, 1);
				openRequest.onupgradeneeded = () =>
				{
					const db = openRequest.result;
					
					if (!db.objectStoreNames.contains(objectTableName))
					{
						const store = db.createObjectStore(objectTableName);
						store.createIndex(stableIndexName, stableProperty);
					}
				};
				
				openRequest.onerror = () =>
				{
					console.error("Could not open the database: " + name);
				};
				
				openRequest.onsuccess = async () =>
				{
					const idb = openRequest.result;
					const database = new Database(id, idb, configurations);
					
					if (about.objects?.length)
					{
						const blobs = about.blobs || new Map<string, Blob>();
						const tx = idb.transaction(objectTableName, "readwrite");
						const store = tx.objectStore(objectTableName);
						const promises: Promise<any>[] = [];
						
						for (const object of about.objects)
						{
							for (const [k, v] of Object.entries(object))
							{
								if (v && v.constructor === Object && exportedBlobKey in v)
								{
									const blobFileName = v[exportedBlobKey] as string;
									const blob = blobs.get(blobFileName) || null;
									(object as any)[k] = blob;
								}
							}
							
							const req = store.put(object, object.id);
							promises.push(new Promise<void>(r => req.onsuccess = () => r()));
						}
						
						await Promise.allSettled(promises);
					}
					
					r(database);
				};
			});
		}
		
		/** */
		static delete(databaseName: string)
		{
			const id = this.getId(databaseName);
			if (!id)
				return;
			
			const openDatabase = Database.get(databaseName);
			if (openDatabase)
				openDatabase.close();
			
			return new Promise<boolean>(async resolve =>
			{
				const request = indexedDB.deleteDatabase(id);
				const then = () =>
				{
					localStorage.removeItem(dbIdPrefix + id);
					console.log("Deleted database '" + databaseName + "' with ID '" + id + "'");
					resolve(true);
				}
				
				request.onsuccess = then;
				request.onblocked = then;
				request.onerror = () => resolve(false);
			});
		}
		
		/**
		 * Deletes all databases in the system.
		 * Only used during debug.
		 */
		static async clear()
		{
			for (const name of this.getNames())
				await this.delete(name);
		}
		
		/** */
		static array<T extends RecordType>(type: T): InstanceType<T>[]
		{
			return isInspecting ? new ArrayMarker(type) as any : [];
		}
		
		/** */
		static reference<T extends RecordType>(type: T): InstanceType<T> | null
		{
			return isInspecting ? new ReferenceMarker(type) as any: null;
		}
		
		/** */
		private constructor(
			private readonly id: string,
			readonly idb: IDBDatabase,
			private readonly configurations: IConfig[])
		{
			Database.databases.set(id, this);
		}
		
		/** */
		get name()
		{
			return Database.getName(this.id) || "";
		}
		
		/** */
		get<R extends Record>(id: ID)
		{
			if (!id)
				throw "ID required";
			
			return new Promise<R | null>(resolve =>
			{
				const existing = this.heap.get(id);
				if (existing)
					return resolve(existing as R);
				
				const tx = this.idb.transaction(objectTableName, "readonly");
				const store = tx.objectStore(objectTableName);
				const request = store.get(id);
				
				request.onsuccess = async () =>
				{
					const record = await this.constructRecord(request.result);
					resolve(record as R);
				};
				
				request.onerror = () =>
				{
					console.error("Could not read object with ID: " + id);
					resolve(null);
				};
			});
		}
		
		/** */
		async first<R extends Record>(type: RecordConstructor<R>)
		{
			for await (const record of this.each(type, "get"))
				return record as R;
			
			return null;
		}
		
		/** */
		async pick<R extends Record>(ids: ID[]): Promise<R[]>
		{
			if (ids.length === 0)
				return [];
			
			ids = ids.slice();
			const length = ids.length;
			let completed = 0;
			const records: (R | null)[] = new Array(length);
			
			for (let i = -1; ++i < ids.length;)
			{
				const id = ids[i];
				const existing = this.heap.get(id);
				if (existing)
				{
					records[i] = existing as R;
					completed++;
				}
			}
			
			if (length === completed)
				return records as R[];
			
			return new Promise<R[]>(resolve =>
			{
				const tx = this.idb.transaction(objectTableName, "readonly");
				const store = tx.objectStore(objectTableName);
				
				const maybeResolve = (record: R | null, index: number) =>
				{
					records[index] = record;
					
					if (++completed >= length)
						resolve(records as R[]);
				}
				
				for (let i = -1; ++i < ids.length;)
				{
					const id = ids[i];
					
					if (!id)
						throw "Empty ID";
					
					const request = store.get(id);
					request.onsuccess = async () =>
					{
						if (!request.result)
						{
							maybeResolve(null, i);
						}
						else
						{
							const record = await this.constructRecord(request.result);
							maybeResolve(record as R, i);
						}
					};
					request.onerror = () => maybeResolve(null, i);
				}
				
				return records.filter(r => !!r);
			});
		}
		
		/** */
		async * each<R extends Record>(type: RecordConstructor<R>, behavior: GetBehavior)
		{
			const tx = this.idb.transaction(objectTableName, "readonly");
			const store = tx.objectStore(objectTableName);
			const index = store.index(stableIndexName);
			const config = this.resolveConfig(type);
			const cursor = index.openCursor(IDBKeyRange.only(config.stable));
			
			for (;;)
			{
				await new Promise<void>(r =>
				{
					if (cursor.readyState === "done")
						cursor.result!.continue();
					
					cursor.onsuccess = () => r();
				});
				
				if (!cursor.result)
					break;
				
				const value = (cursor.result.value as RecordJson<R>);
				const record = await this.constructRecord(value, behavior);
				yield record as R;
			}
		}
		
		/** */
		private async constructRecord<R extends Record>(
			recordJson: RecordJson<R>,
			behavior: GetBehavior = "get"): Promise<R>
		{
			// Don't create another Record instance if we already have one in
			// the heap. This will allow the system to maintain referential significance.
			const existing = this.heap.get(recordJson.id);
			if (existing)
				return existing as R;
			
			const id = recordJson.id;
			const raw = recordJson as any;
			const config = this.resolveConfig(recordJson);
			const record = Object.assign(new config.ctor(), { id }) as Record;
			const recordAny = record as any;
			const memberLayout = getMemberLayout(record);
			
			for (const [key, value] of Object.entries(memberLayout))
			{
				// Safety check
				if (!(key in raw))
					continue;
				
				const rawValue = raw[key];
				
				if (value.type instanceof ArrayMarker)
				{
					const ids = rawValue as ID[];
					
					if (behavior === "get" && Array.isArray(ids))
					{
						const records = await this.pick(ids);
						recordAny[key] = records;
					}
					else recordAny[key] = [];
				}
				else if (value.type instanceof ReferenceMarker)
				{
					if (behavior === "peek" || rawValue === null || !(rawValue > 0))
						recordAny[key] = null;
					else
						recordAny[key] = await this.get(rawValue);
				}
				else
				{
					recordAny[key] = rawValue;
				}
			}
			
			if (behavior === "get")
				this.maybeImport(record);
			
			return record as R;
		}
		
		/** */
		private resolveConfig(object: object)
		{
			if (object instanceof Record || object instanceof Function)
			{
				const ctor = object instanceof Record ? 
					constructorOf(object) :
					object;
				
				const config = this.configurations.find(cfg => cfg.ctor === ctor);
				if (config)
					return config;
			}
			else if (object && typeof object === "object")
			{
				const stable = (object as any)[stableProperty];
				if (stable)
				{
					const config = this.configurations.find(cfg => cfg.stable === stable);
					if (config)
						return config;
				}
			}
			
			throw "Record type not defined.";
		}
		
		/**
		 * Closes the connection to the database.
		 */
		close()
		{
			this.idb.close();
		}
		
		/** */
		save(...records: Record[])
		{
			if (records.length === 0)
				return Promise.resolve();
			
			// Note: this operation is actually recursive.
			// No need to make it recursive here again.
			for (const record of records)
				this.unmarkForDeletion(record);
			
			return new Promise<void>(resolve =>
			{
				const tx = this.idb.transaction(objectTableName, "readwrite");
				const store = tx.objectStore(objectTableName);
				let completed = 0;
				
				const maybeResolve = () =>
				{
					if (++completed >= records.length)
						resolve();
				};
				
				for (const record of recurseRecords(records))
				{
					this.maybeImport(record);
					
					const entries = Object.entries(record).map(([key, recordValue]) =>
					{
						if (recordValue === undefined)
							throw "Cannot serialize undefined.";
						
						if (recordValue !== recordValue)
							throw "Cannot serialize NaN.";
						
						let serializedValue: any = null;
						
						if (recordValue instanceof Record)
							serializedValue = this.maybeImport(recordValue).id;
						
						else if (Array.isArray(recordValue))
						{
							if (recordValue.length === 0)
							{
								serializedValue = [];
							}
							else if (recordValue[0] instanceof Record)
							{
								const records = recordValue as Record[];
								serializedValue = records.map(r => this.maybeImport(r).id);
							}
							else
							{
								// Clone the array. Necessary if the record value is a proxy.
								serializedValue = JSON.parse(JSON.stringify(recordValue));
							}
						}
						else if (
							recordValue === null ||
							typeof recordValue === "string" || 
							typeof recordValue === "number" ||
							typeof recordValue === "boolean" ||
							recordValue.constructor === Object ||
							recordValue instanceof Blob)
						{
							serializedValue = recordValue;
						}
						else
						{
							throw "Value not supported on member: "  + key;
						}
						
						return [key, serializedValue];
					});
					
					const cfg = this.resolveConfig(record);
					entries.unshift([stableProperty, cfg.stable]);
					
					const serialized = Object.fromEntries(entries);
					const putResult = store.put(serialized, record.id);
					
					putResult.onerror = () =>
					{
						console.error("An error occured while trying to write to IndexedDB:");
						maybeResolve();
					};
					
					putResult.onsuccess = () =>
					{
						maybeResolve();
					}
				}
			});
		}
		
		//# Exporting
		
		/**
		 * Exports the entire database into an IDatabaseAbout object.
		 */
		async export()
		{
			const name = Database.getName(this.id) || "untitled";
			const about: Required<IDatabaseAbout> = {
				name,
				id: this.id,
				objects: [],
				blobs: new Map(),
			};
			
			for await (const databaseObject of this.iterate())
			{
				for (const [k, v] of Object.entries(databaseObject))
				{
					if (v instanceof Blob)
					{
						const ext = MimeType.getExtension(v.type) || "txt";
						const blobFileName = about.blobs.size + "." + ext;
						about.blobs.set(blobFileName, v);
						(databaseObject as any)[k] = { [exportedBlobKey]: blobFileName };
					}
				}
				
				about.objects.push(databaseObject);
			}
			
			return about;
		}
		
		/**
		 * Iterates through all entries in the database, yielding each raw JSON value. 
		 * This method is intended for handling database exportation.
		 */
		private async * iterate()
		{
			const tx = this.idb.transaction(objectTableName, "readonly");
			const store = tx.objectStore(objectTableName);
			const cursor = store.openCursor();
			
			let resolver: (() => void) | null = null;
			let object: any = null;
			
			cursor.onsuccess = () =>
			{
				if (cursor.result)
				{
					object = cursor.result!.value;
					cursor.result!.continue();
				}
				else object = null;
				
				if (resolver)
					resolver();
			};
			
			for (;;)
			{
				await new Promise<void>(r => resolver = r);
				if (!object)
					break;
				
				yield object as RecordJson<any>;
			}
		}
		
		//# Dirty Management
		
		/** */
		private setDirty(record: Record)
		{
			this.dirtyRecords.add(record);
			this.queueAutosave();
		}
		
		/** */
		private queueAutosave()
		{
			clearTimeout(this.autosaveTimeoutId);
			this.autosaveTimeoutId = setTimeout(() =>
			{
				const dirtyRecords = Array.from(this.dirtyRecords);
				this.dirtyRecords.clear();
				this.save(...dirtyRecords);
			},
			1);
		}
		private autosaveTimeoutId: any = 0;
		
		private readonly dirtyRecords = new Set<Record>();
		
		//# Deletion Watcher
		
		/** */
		private markForDeletion(record: Record)
		{
			for (const rec of recurseRecords([record]))
				if (rec.id && !this.resolveConfig(record).root)
					this.markedRecordIds.add(rec.id);
			
			this.queueDeletion();
		}
		
		/** */
		private unmarkForDeletion(record: Record)
		{
			for (const rec of recurseRecords([record]))
				if (rec.id)
					this.markedRecordIds.delete(rec.id);
		}
		
		/** */
		private queueDeletion()
		{
			clearTimeout(this.deletionTimeoutId);
			this.deletionTimeoutId = setTimeout(async () =>
			{
				const idsOriginal = this.markedRecordIds.toSet();
				const ids = this.markedRecordIds.toSet();
				
				for await (const [ownerId, refId] of this.eachEdge())
					if (!ids.has(ownerId) && ids.has(refId))
						ids.delete(refId);
				
				const tx = this.idb.transaction(objectTableName, "readwrite");
				const store = tx.objectStore(objectTableName);
				
				for (const id of ids)
				{
					store.delete(Number(id));
					this.heap.delete(id);
				}
				
				for (const id of idsOriginal)
					this.markedRecordIds.delete(id);
			},
			100);
		}
		private deletionTimeoutId: any = 0;
		
		/**
		 * Performs a complete scan of the database records, returning a pair
		 * of IDs that define an edge relationship from the first ID to the second ID.
		 * This edge can be established through a record reference (single record
		 * property), or as an array of records.
		 */
		private async * eachEdge(): AsyncIterableIterator<[ID, ID]>
		{
			const tx = this.idb.transaction(objectTableName, "readonly");
			const store = tx.objectStore(objectTableName);
			const index = store.index(stableIndexName);
			const cursor = index.openCursor();
			
			for (;;)
			{
				await new Promise<void>(r =>
				{
					if (cursor.readyState === "done")
						cursor.result!.continue();
					
					cursor.onsuccess = () => r();
				});
				
				if (!cursor.result)
					break;
				
				const raw = cursor.result.value;
				const ownerId = (raw as Record).id;
				const config = Not.nullable(this.resolveConfig(raw));
				const memberLayout = getMemberLayout(config.ctor);
				
				for (const [key, value] of Object.entries(memberLayout))
				{
					const rawValue = raw[key];
					
					if (value.type instanceof ArrayMarker)
						for (const id of rawValue as ID[])
							yield [ownerId, id];
					
					else if (value.type instanceof ReferenceMarker)
						yield [ownerId, rawValue];
				}
			}
		}
		
		/** */
		private get markedRecordIds()
		{
			if (!this._markedRecordIds)
				this._markedRecordIds = new LocalStorageSet(this.idb.name);
			
			return this._markedRecordIds;
		}
		private _markedRecordIds: LocalStorageSet | null = null;
		
		//# Property Creators
		
		/**
		 * Adds an ID and getters / setters to the specified record,
		 * and adds the record to the heap, if these things have not 
		 * been done already.
		 */
		private maybeImport(record: Record)
		{
			if (!record.id)
				Object.assign(record, { id: generateId() });
			
			if (!importedRecords.has(record))
			{
				const memberLayout = getMemberLayout(record);
				for (const [memberName, memberInfo] of Object.entries(memberLayout))
				{
					const name = memberName as keyof Record;
					if (name === "id")
						continue;
					
					if (memberInfo.type instanceof ArrayMarker)
						this.defineArrayProperty(record, name);
					
					else if (memberInfo.type instanceof ReferenceMarker)
						this.defineRecordProperty(record, name);
					
					else if (memberInfo.type === "array")
						this.defineArrayProperty(record, name);
					
					else
						this.definePrimitiveProperty(record, name);
				}
				
				importedRecords.set(record, this);
			}
			
			this.heap.set(record.id, record);
			return record;
		}
		
		private readonly heap = new IterableWeakMap<ID, Record>();
		
		/** */
		private definePrimitiveProperty(record: Record, memberName: keyof Record)
		{
			let backingValue = record[memberName] as unknown;
			
			Object.defineProperty(record, memberName, {
				get: () => backingValue,
				set: (value: Record | null) =>
				{
					if (value === backingValue)
						return value;
					
					this.setDirty(record);
					return backingValue = value;
				}
			});
		}
		
		/** */
		private defineRecordProperty(owner: Record, memberName: string)
		{
			let backingValue: Record | null = (owner as any)[memberName];
			
			Object.defineProperty(owner, memberName, {
				get: () => backingValue,
				set: (assignee: Record | null) =>
				{
					if (assignee === backingValue)
						return;
					
					if (backingValue)
						this.markForDeletion(backingValue);
					
					if (assignee)
						this.save(assignee);
					
					this.setDirty(owner);
					return backingValue = assignee;
				}
			});
		}
		
		/** */
		private defineArrayProperty(owner: Record, memberName: keyof Record)
		{
			const target = owner[memberName] as any as Record[];
			let observableArray = new this.ObservableArray(this, owner, target);
			
			Object.defineProperty(owner, memberName, {
				get: () => observableArray.proxy,
				set: (records: Record[]) =>
				{
					for (const record of observableArray.proxy)
						if (record instanceof Record)
							this.markForDeletion(record);
					
					for (const record of records)
						if (record instanceof Record)
							this.save(record);
					
					this.setDirty(owner);
					observableArray = new this.ObservableArray(this, owner, records);
					return observableArray.proxy;
				}
			});
		}
		
		/**
		 * 
		 */
		private readonly ObservableArray = class ObservableArray
		{
			constructor(
				readonly database: Database,
				readonly owner: Record,
				target: Record[] = [])
			{
				this.proxy = new Proxy(target, {
					get(target, name: string)
					{
						switch (name)
						{
							case target.copyWithin.name: throw "Not implemented";
							case target.pop.name: return () =>
							{
								if (target.length === 0)
									return undefined;
								
								const result = target.pop();
								if (result instanceof Record)
									database.markForDeletion(result);
								
								database.setDirty(owner);
								return target.pop();
							};
							case target.push.name: return (...args: Record[]) =>
							{
								if (args.length === 0)
									return target.length;
								
								for (const arg of args)
									if (arg instanceof Record)
										database.save(arg);
								
								database.setDirty(owner);
								return target.push(...args);
							};
							case target.reverse.name: return () =>
							{
								if (target.length > 1)
									database.setDirty(owner);
								
								return target.reverse();
							};
							case target.shift.name: return () =>
							{
								if (target.length === 0)
									return undefined;
								
								const result = target.shift();
								if (result instanceof Record)
									database.markForDeletion(result);
								
								database.setDirty(owner);
								return result;
							};
							case target.unshift.name: return (...args: any[]) =>
							{
								if (args.length === 0 || target.length === 0)
									return target.length;
								
								for (const arg of args)
									if (arg instanceof Record)
										database.save(arg);
								
								database.setDirty(owner);
								return target.unshift(...args);
							};
							case target.sort.name: return (compareFn: any) =>
							{
								if (target.length < 2)
									return target;
								
								database.setDirty(owner);
								return target.sort(compareFn);
							};
							case target.splice.name: return (
								start: number,
								deleteCount?: number,
								...insertables: Record[]) =>
							{
								deleteCount ||= 0;
								const deleted = target.splice(start, deleteCount, ...insertables);
								
								for (const del of deleted)
									database.markForDeletion(del);
								
								for (const ins of insertables)
									database.save(ins);
								
								if (deleteCount > 0 || insertables.length > 0)
									database.setDirty(owner);
								
								return deleted;
							}
							case "length": return target.length;
							
							default: return (target as any)[name];
						}
					},
					set(target, p, value, receiver)
					{
						throw "The .length property is not writable.";
					},
				});
			}
			
			readonly proxy: Record[] = [];
		}
	
	}
	
	//# Record Class
	
	/** */
	export type RecordType = abstract new(id?: ID) => Record;
	
	/**
	 * A type that describes a Record object as it comes directly from the database.
	 */
	type RecordJson<T> = { [P in keyof T]: T[P] extends any[] ? number[] : T[P]; } & { id: ID };
	
	/** */
	export class Record
	{
		readonly id: ID = 0;
		
		/**
		 * Saves this record to it's associated database.
		 * Throws an exception if no database is associated with this record.
		 */
		async save()
		{
			const containingDatabase = importedRecords.get(this);
			if (!containingDatabase)
				throw "Cannot save this record. It has not been imported into any database.";
			
			return containingDatabase.save(this);
		}
	}
	
	/** */
	class ArrayMarker
	{
		constructor(readonly ctor: any) { }
	}
	
	/** */
	class ReferenceMarker
	{
		constructor(readonly ctor: any) { }
	}
	
	//# Member Layouts
	
	/** */
	function getMemberLayout(record: Record | Ctor)
	{
		const recordCtor = record instanceof Record ? 
			constructorOf(record) :
			record;
		
		let layout = memberLayouts.get(recordCtor);
		if (!layout)
		{
			isInspecting = true;
			const inspectable = new recordCtor();
			isInspecting = false;
			
			layout = {};
			
			for (const [memberName, memberValue] of Object.entries(inspectable))
			{
				if (memberName === "id")
					continue;
				
				if (memberValue instanceof ArrayMarker)
				{
					layout[memberName] = { 
						type: memberValue,
						array: true
					};
				}
				else if (memberValue instanceof ReferenceMarker)
				{
					layout[memberName] = {
						type: memberValue,
						array: false
					};
				}
				else if (Array.isArray(memberValue))
				{
					layout[memberName] = {
						type: "array",
						array: true,
					};
				}
				else
				{
					layout[memberName] = {
						type: typeof memberValue as MemberType,
						array: false,
					};
				}
			}
			
			memberLayouts.set(recordCtor, layout);
		}
		
		return layout;
	}
	
	const exportedBlobKey = "$$blob$$";
	const dbIdPrefix = "database-";
	const objectTableName = "objects";
	const stableIndexName = "stable-index";
	const stableProperty = "_";
	
	let isInspecting = false;
	type MemberType = "string" | "number" | "boolean" | "array" | ArrayMarker | ReferenceMarker;
	type MemberLayout = { [member: string]: { type: MemberType, array: boolean; } };
	const memberLayouts = new Map<Ctor, MemberLayout>();
	
	/**
	 * Stores a WeakMap of records that have been imported into the system,
	 * which means that they have getters and setters installed. The value is
	 * a reference to the Database that contains the record.
	 */
	const importedRecords = new WeakMap<Record, Database>();
	
	//# Utilities
	
	/** */
	function* recurseRecords(records: Record[])
	{
		function* recurse(root: Record): IterableIterator<Record>
		{
			yield root;
			const memberValues = Object.values(root);
			
			for (const memberValue of memberValues)
			{
				if (memberValue instanceof Record)
				{
					yield* recurse(memberValue);
				}
				else if (Array.isArray(memberValue))
				{
					for (const arrayItem of memberValue)
						if (arrayItem instanceof Record)
							yield* recurse(arrayItem);
				}
			}
		}
		
		for (const record of records)
			yield* recurse(record);
	}
	
	/**
	 * Generates an ID which is a timestamp with an incrementation
	 * feature, in order to prevent the case of multiple timestamps
	 * being generated in the same millisecond.
	 */
	function generateId(): ID
	{
		return Date.now() * 1000 + (nextId++);
	}
	let nextId = 0;
	
	/** */
	type Ctor = new(id?: string) => Record;
	
	/** */
	function constructorOf(record: Record): Ctor
	{
		return (record as any).constructor;
	}
}
