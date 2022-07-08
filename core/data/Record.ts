
namespace Turf
{
	//# Database Class
	
	export type RecordConstructor<R extends Record = Record> = new(id?: string) => R;
	
	/** */
	export interface IConfig
	{
		ctor: RecordConstructor;
		stable: number;
	}
	
	/** */
	export class Back
	{
		/**
		 * Returns a new Database instance, which is connected to the database
		 * in IndexedDB with the specified name. Creates a new database if one
		 * does not already exist.
		 */
		static async new(backName: string, ...configurations: IConfig[])
		{
			return new Promise<Back>(r =>
			{
				const openRequest = indexedDB.open(backName, 1);
				
				openRequest.onupgradeneeded = () =>
				{
					const db = openRequest.result;
					
					if (!db.objectStoreNames.contains(objectTableName))
						db.createObjectStore(objectTableName);
				};
				
				openRequest.onerror = () =>
				{
					console.error("Could not open the database: " + backName);
				};
				
				openRequest.onsuccess = async () =>
				{
					const back = new Back(new Database(openRequest.result, configurations));
					r(back);
				};
			});
		}
		
		/** */
		static delete(backName: string)
		{
			return new Promise<void>(resolve =>
			{
				const request = indexedDB.deleteDatabase(backName);
				request.onsuccess = () => resolve();
				request.onerror = () => resolve();
			});
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
		private constructor(private readonly inner: Database) { }
		
		/** */
		get<R extends Record>(id: string)
		{
			if (!id)
				throw "ID required";
			
			return this.inner.get<R>(id);
		}
		
		/** */
		save(...records: Record[])
		{
			return this.inner.save(records);
		}
	}
	
	/** */
	class Database
	{
		/** */
		constructor(
			private readonly idb: IDBDatabase,
			private readonly configurations: IConfig[])
		{ }
		
		/** */
		get<R extends Record>(id: string)
		{
			return new Promise<R | null>(resolve =>
			{
				const existing = this.getFromHeap(id);
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
		async pick<R extends Record>(ids: string[]): Promise<R[]>
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
				const existing = this.getFromHeap(id);
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
		private async constructRecord<R extends Record>(
			recordJson: RecordJson<R>): Promise<R>
		{
			const id = recordJson.id;
			const raw = recordJson as any;
			const config = this.resolveConfig(recordJson);
			const record = Object.assign(new config.ctor(), { id }) as Record;
			const recordAny = record as any;
			const memberLayout = getMemberLayout(record);
			
			for (const [key, value] of Object.entries(memberLayout))
			{
				const rawValue = raw[key];
				
				if (value.type instanceof ArrayMarker)
				{
					const ids = rawValue as string[];
					
					if (Array.isArray(ids))
					{
						const records = await this.pick(ids);
						recordAny[key] = records;
					}
					else recordAny[key] = [];
				}
				else if (value.type instanceof ReferenceMarker)
				{
					if (rawValue === null)
						recordAny[key] = null;
					else
						recordAny[key] = await this.get(rawValue);
				}
				else
				{
					recordAny[key] = rawValue;
				}
			}
			
			this.maybeAssociate(record);
			this.putOnHeap(record);
			return record as R;
		}
		
		/** */
		private resolveConfig(object: object)
		{
			if (object instanceof Record)
			{
				const ctor = constructorOf(object);
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
		
		/** */
		async save(records: Record[])
		{
			if (records.length === 0)
				return;
			
			return new Promise<void>(resolve =>
			{
				const transaction = this.idb.transaction(objectTableName, "readwrite");
				const store = transaction.objectStore(objectTableName);
				let completed = 0;
				
				const maybeResolve = () =>
				{
					if (++completed >= records.length)
						resolve();
				};
				
				for (const record of recurseRecords(records))
				{
					this.maybeAssociate(record);
					
					const entries = Object.entries(record).map(([key, recordValue]) =>
					{
						let serializedValue: any = null;
						
						if (recordValue instanceof Record)
							serializedValue = recordValue.id;
						
						else if (Array.isArray(recordValue))
						{
							if (recordValue.length > 0 && recordValue[0] instanceof Record)
							{
								const records = recordValue as Record[];
								
								for (const record of records)
									this.maybeAssociate(record);
								
								serializedValue = records.map(r => r.id);
							}
							else
								serializedValue = [];
						}
						else if (
							recordValue === null ||
							typeof recordValue === "string" || 
							typeof recordValue === "number" ||
							typeof recordValue === "boolean" ||
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
						console.log("Wrote: " + record.id);
						maybeResolve();
					}
				}
			});
		}
		
		//# Memory Management
		
		/** */
		getFromHeap(id: string)
		{
			const ref = this.heap.get(id);
			if (!ref)
				return null;
			
			this.heap.queueCleanup();
			
			const record = ref.deref();
			if (record)
				return record;
			
			this.heap.delete(id);
			return null;
		}
		
		/** */
		putOnHeap(record: Record)
		{
			const existing = this.heap.get(record.id);
			if (!existing)
				this.heap.set(record.id, new WeakRef(record));
			
			this.heap.queueCleanup();
		}
		
		/** Stores a reference to all Record objects in memory. */
		readonly heap = new WeakRecordCollection();
		
		//# Garbage Collection
		
		/** */
		ref(record: Record)
		{
			if (record.id)
				this.setReferenceCount(record, this.getReferenceCount(record) + 1);
		}
		
		/** */
		deref(record: Record)
		{
			if (!record.id)
				return;
			
			const count = this.setReferenceCount(record, this.getReferenceCount(record) - 1);
			if (count === 0)
			{
				this.sweepables.add(record);
				this.queueSweep();
			}
		}
		
		/** */
		getReferenceCount(record: Record)
		{
			return Number(localStorage.getItem(record.id)) || 0;
		}
		
		/** */
		setReferenceCount(record: Record, count: number)
		{
			if (count < 1)
				localStorage.removeItem(record.id);
			else
				localStorage.setItem(record.id, String(count));
			
			return count;
		}
		
		/** */
		queueSweep()
		{
			clearTimeout(this.sweepTimeout);
			this.sweepTimeout = setTimeout(() =>
			{
				const sweepablesCopy = Array.from(this.sweepables);
				this.sweepables.clear();
				
				for (const record of sweepablesCopy)
				{
					// If the record was re-referenced, then avoid sweeping it.
					if (this.getReferenceCount(record) > 0)
						continue;
					
					//debugger;
					//! Hit the database somehow and nuke the object
				}
			},
			100);
		}
		
		private sweepTimeout: any = 0;
		private readonly sweepables = new Set<Record>();
		
		//# Dirty Records Management
		
		/** */
		*eachDirty()
		{
			for (const [id, ref] of this.dirtyRecords)
			{
				const record = ref.deref();
				
				if (record)
					yield record;
				else
					this.dirtyRecords.delete(id);
			}
		}
		
		/** */
		setDirty(record: Record)
		{
			this.dirtyRecords.set(record.id, new WeakRef(record));
			this.dirtyRecords.queueCleanup();
		}
		
		/** */
		setClean(record: Record)
		{
			this.dirtyRecords.delete(record.id);
			this.dirtyRecords.queueCleanup();
		}
		
		/** Stores a reference to the dirty Record objects in memory. */
		private readonly dirtyRecords = new WeakRecordCollection();
		
		//# Record Preparation
		
		/**
		 * 
		 */
		private maybeAssociate(record: Record)
		{
			if (this.associations.has(record))
				return;
			
			this.maybeSetId(record);
			this.associations.set(record, this);
			this.putOnHeap(record);
			
			const memberLayout = getMemberLayout(record);
			
			for (const [memberName, memberInfo] of Object.entries(memberLayout))
			{
				if (memberName === "id")
					continue;
				
				if (memberInfo.type instanceof ArrayMarker)
				{
					this.defineArrayProperty(this, record, memberName);
				}
				else if (memberInfo.type instanceof ReferenceMarker)
				{
					this.defineRecordProperty(this, record, memberName);
				}
				else if (memberInfo.type === "array")
				{
					this.defineArrayProperty(this, record, memberName);
				}
				else
				{
					this.definePrimitiveProperty(this, record, memberName as keyof Record);
				}
			}
		}
		
		/**
		 * 
		 */
		private maybeSetId(record: Record)
		{
			if (record.id)
				return;
			
			const config = this.resolveConfig(record);
			const id = config.stable + (() =>
			{
				let now = Date.now() - 1648215698766;
				if (now <= this.lastNow)
					return (++this.lastNow).toString(36);
				
				this.lastNow = now;
				return now.toString(36);
			})();
			
			Object.assign(record, { id });
		}
		private lastNow = 0;
		
		private readonly associations = new WeakMap<Record, Database>();
		
		/** */
		private definePrimitiveProperty(database: Database, record: any, memberName: string)
		{
			let backingValue = record[memberName];
			
			Object.defineProperty(record, memberName, {
				get()
				{
					return backingValue;
				},
				set(value: Record | null)
				{
					if (value === backingValue)
						return;
					
					if (backingValue)
						database.deref(backingValue);
					
					if (value)
						database.ref(value);
					
					database.setDirty(record);
					return backingValue = value;
				}
			});
		}
		
		/** */
		private defineRecordProperty(database: Database, record: any, memberName: string)
		{
			let backingValue: Record | null = record[memberName];
			
			Object.defineProperty(record, memberName, {
				get()
				{
					return backingValue;
				},
				set(value: Record | null)
				{
					if (value === backingValue)
						return;
					
					if (backingValue)
						database.deref(backingValue);
					
					if (value)
						database.ref(value);
					
					database.setDirty(record);
					return backingValue = value;
				}
			});
		}
		
		/** */
		private defineArrayProperty(database: Database, owner: any, memberName: string)
		{
			const target = owner[memberName];
			let observableArray = new ObservableArray(database, owner, target);
			
			Object.defineProperty(owner, memberName, {
				get()
				{
					return observableArray.proxy;
				},
				set(records: Record[])
				{
					for (const record of observableArray.proxy)
						if (record instanceof Record)
							database.deref(record);
					
					for (const record of records)
						if (record instanceof Record)
							database.ref(record)
					
					database.setDirty(owner);
					observableArray = new ObservableArray(database, owner, records);
					return observableArray.proxy;
				}
			});
		}
		
	}
	
	const objectTableName = "objects";
	const stableProperty = "@";
	
	//# Record Class
	
	/** */
	export type RecordType = abstract new(id?: string) => Record;
	
	/**
	 * A type that describes a Record object as it comes directly from the database.
	 */
	type RecordJson<T> = { [P in keyof T]: T[P] extends any[] ? number[] : T[P]; } & { id: string };
	
	/** */
	export class Record
	{
		readonly id: string = "";
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
	
	/**
	 * 
	 */
	class ObservableArray
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
								database.deref(result);
							
							database.setDirty(owner);
							return target.pop();
						};
						case target.push.name: return (...args: Record[]) =>
						{
							if (args.length === 0)
								return target.length;
							
							for (const arg of args)
								if (arg instanceof Record)
									database.ref(arg);
							
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
							
							database.setDirty(owner);
							const result = target.shift();
							
							if (result instanceof Record)
								database.deref(result);
							
							return result;
						};
						case target.unshift.name: return (...args: any[]) =>
						{
							if (args.length === 0 || target.length === 0)
								return target.length;
							
							for (const arg of args)
								if (arg instanceof Record)
									database.ref(arg);
							
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
								database.deref(del);
							
							for (const ins of insertables)
								database.ref(ins);
							
							if (deleteCount > 0 || insertables.length > 0)
								database.setDirty(owner);
							
							return deleted;
						}
						case "length": return target.length;
						
						default: return (target as any)[name];
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
	
	/** */
	class WeakRecordCollection extends Map<string, WeakRef<Record>>
	{
		/** */
		queueCleanup()
		{
			clearTimeout(this.timeoutId);
			this.timeoutId = setTimeout(() =>
			{
				for (const [key, ref] of this)
					if (ref.deref() === undefined)
						this.delete(key);
			},
			5000);
		}
		
		private timeoutId: any = 0;
	}
	
	//# Member Layouts
	
	/** */
	function getMemberLayout(record: Record)
	{
		const recordCtor = constructorOf(record);
		
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
	
	let isInspecting = false;
	type MemberType = "string" | "number" | "boolean" | "array" | ArrayMarker | ReferenceMarker;
	type MemberLayout = { [member: string]: { type: MemberType, array: boolean; } };
	const memberLayouts = new Map<Ctor, MemberLayout>();
	
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
	
	/** */
	type Ctor = new(id?: string) => Record;
	
	/** */
	function constructorOf(record: Record): Ctor
	{
		return (record as any).constructor;
	}
}
