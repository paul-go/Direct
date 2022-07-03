/// <reference path="PrimitiveWeakMap.ts" />

namespace Turf
{
	/**
	 * 
	 */
	type RawRecord<T> = {
		[P in keyof T]: T[P] extends any[] ? number[] : T[P];
	} & { id: string };
	
	/** */
	export type RecordCtor<R extends Record = Record> = typeof Record & Constructor<R>;
	
	let inspecting = false;
	const fakeId = "?".repeat(10);
	const referenceInfos = new Map<typeof Record, Map<string, typeof Record>>();
	
	/** */
	function getReferenceType(
		containingRecordType: typeof Record,
		propertyName: string): typeof Record | null
	{
		return referenceInfos
			.get(containingRecordType)
			?.get(propertyName) || null;
	}
	
	/** */
	export class Record
	{
		static readonly table: string = "";
		static readonly type: number = 0;
		
		/** */
		constructor(id?: string)
		{
			this.id = id || Util.unique();
			
			if (id !== fakeId)
			{
				heap.set(this.id, this);
				const instantiatedType = new.target;
				
				let refInfo = referenceInfos.get(instantiatedType);
				if (!refInfo)
				{
					let template: Record | null = null;
					
					try
					{
						inspecting = true;
						template = new instantiatedType(fakeId);
					}
					finally
					{
						inspecting = false;
					}
					
					const entries = Object.entries(template).filter(([, v]) => v instanceof RecordReference);
					refInfo = new Map(entries);
					referenceInfos.set(instantiatedType, refInfo);
				}
			}
		}
		
		readonly id: string;
		
		/** */
		protected arrayOf<T extends abstract new (...args: any[]) => Record>(type: T): InstanceType<T>[]
		{
			const array: any[] = new RecordArray(type);
			return array;
		}
		
		/** */
		protected referenceOf<T extends abstract new (...args: any[]) => Record>(type: T): InstanceType<T> | null
		{
			return inspecting ? new RecordReference(type) as any: null;
		}
	}
	
	/** */
	class RecordArray<R extends Record> extends Array<R>
	{
		constructor(readonly type: Constructor<R>)
		{
			super();
		}
	}
	
	/**
	 * A class for a temporary object used to inspect the data type of a property in a Record.
	 */
	class RecordReference<R extends Record>
	{
		constructor(readonly type: Constructor<R>) { }
	}
	
	/** */
	export class Database
	{
		/**
		 * Returns a new Database instance, which is connected to the database
		 * in IndexedDB with the specified name. Creates a new database if one
		 * does not already exist.
		 */
		static async new(databaseName: string, ...ctors: RecordCtor[])
		{
			const existing = databases.get(databaseName);
			if (existing)
				return existing;
			
			return new Promise<Database>(r =>
			{
				const openRequest = indexedDB.open(databaseName, 1);
				
				openRequest.onupgradeneeded = () =>
				{
					const db = openRequest.result;
					
					for (const ctor of ctors)
					{
						if (!db.objectStoreNames.contains(ctor.table))
							db.createObjectStore(ctor.table);
						
						if (!registrations.has(ctor.type))
							registrations.set(ctor.type, ctor);
					}
				};
				
				openRequest.onerror = () =>
				{
					console.error("Could not open the database: " + databaseName);
				};
				
				openRequest.onsuccess = async () =>
				{
					const db = new Database(openRequest.result);
					databases.set(databaseName, db);
					r(db);
				};
			});
		}
		
		/** */
		static delete(databaseName: string)
		{
			return new Promise<void>(resolve =>
			{
				const request = indexedDB.deleteDatabase(databaseName);
				request.onsuccess = () => resolve();
				request.onerror = () => resolve();
			});
		}
		
		/** */
		private constructor(
			private readonly idb: IDBDatabase)
		{ }
		
		/** */
		async get<R extends Record>(recordCtor: RecordCtor<R>, id: string)
		{
			return new Promise<R | null>(resolve =>
			{
				const existing = heap.get(id);
				if (existing)
					return resolve(existing as R);
				
				const table = recordCtor.table;
				const tx = this.idb.transaction(table, "readonly");
				const store = tx.objectStore(table);
				const request = store.get(id);
				
				request.onsuccess = async () =>
				{
					const specificRecordCtor = this.getCtor(recordCtor.type);
					const record = await this.constructRecord(specificRecordCtor, request.result);
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
		async pick<R extends Record>(
			recordCtor: abstract new (...args: any[]) => Record,
			ids: string[]): Promise<R[]>
		{
			if (ids.length === 0)
				return [];
			
			ids = ids.slice();
			
			const recordType = recordCtor as typeof Record;
			const table = recordType.table;
			
			return new Promise<R[]>(resolve =>
			{
				const tx = this.idb.transaction(table, "readonly");
				const store = tx.objectStore(table);
				const length = ids.length;
				
				let completed = 0;
				const records: R[] = new Array(length);
				
				const maybeResolve = (record: R | null, index: number) =>
				{
					if (record)
						records[index] = record;
					
					if (++completed >= length)
					{
						resolve(records);
					}
				}
				
				for (let i = -1; ++i < ids.length;)
				{
					const id = ids[i];
					const request = store.get(id);
					request.onsuccess = async () =>
					{
						if (!request.result)
						{
							maybeResolve(null, i);
						}
						else
						{
							const type = request.result[typeProperty] || recordType.type;
							const specificRecordCtor = this.getCtor(type);
							const record = await this.constructRecord(specificRecordCtor, request.result);
							maybeResolve(record as R, i);
						}
					};
					request.onerror = () => maybeResolve(null, i);
				}
				
				return records.filter(r => !!r);
			});
		}
		
		/** */
		async peek()
		{
			throw "Not implemented";
		}
		
		/** */
		private async constructRecord<R extends Record>(
			recordCtor: RecordCtor<R>,
			rawRecord: RawRecord<R>): Promise<R>
		{
			const id = rawRecord.id;
			const raw = rawRecord as any;
			
			const sub = raw[typeProperty];
			if (sub)
				this.getCtor(sub);
			
			const typedRecord = heap.get(id) || (() =>
			{
				const rec = new recordCtor(id);
				heap.set(id, rec);
				return rec as R;
			})();
			
			for (const [key, value] of Object.entries(typedRecord))
			{
				if (key == typeProperty)
					continue;
				
				if (value instanceof RecordArray)
				{
					const ids = raw[key] as string[];
					
					if (Array.isArray(ids))
					{
						const records = await this.pick(value.type, ids);
						raw[key] = records;
					}
					else raw[key] = [];
				}
				else
				{
					const type = getReferenceType(recordCtor, key);
					if (type !== null)
					{
						
					}
				}
			}
			
			return Object.assign(typedRecord, rawRecord) as R;
		}
		
		/** */
		async save(...records: Record[])
		{
			class TxInfo
			{
				constructor(
					readonly transaction: IDBTransaction,
					readonly store: IDBObjectStore)
				{ }
				
				readonly records: Record[] = [];
				completed = 0;
			}
			
			const organizer = new Map<string, TxInfo>();
			
			for (const record of records)
			{
				const ctor = Util.constructorOf(record) as typeof Record;
				const table = ctor.table;
				
				if (!table)
					throw "Constructor has no table name: " + ctor.name;
				
				let txInfo = organizer.get(table);
				if (!txInfo)
				{
					const transaction = this.idb.transaction(table, "readwrite");
					const store = transaction.objectStore(table);
					txInfo = new TxInfo(transaction, store);
					organizer.set(table, txInfo);
				}
				
				txInfo.records.push(record);
			}
			
			return new Promise<void>(resolve =>
			{
				const maybeResolve = (txInfo: TxInfo) =>
				{
					txInfo.completed++;
					
					for (const txInfo of organizer.values())
						if (txInfo.completed < txInfo.records.length)
							return;
					
					resolve();
				};
				
				for (const [, txInfo] of organizer)
				{
					// Should never be 0
					if (txInfo.records.length === 0)
						continue;
					
					for (const record of txInfo.records)
					{
						const entries = Object.entries(record).map(([key, value]) => 
						[
							key, 
							value instanceof RecordArray ? 
								value.map(r => r.id) :
								value
						]);
						
						const ctor = Util.constructorOf(record) as typeof Record;
						if (ctor.type)
							entries.unshift([typeProperty, ctor.type]);
						
						const serialized = Object.fromEntries(entries);
						const putResult = txInfo.store.put(serialized, record.id);
						
						putResult.onerror = e =>
						{
							console.error("An error occured while trying to write to IndexedDB:");
							console.log(e);
							maybeResolve(txInfo);
						};
						
						putResult.onsuccess = () =>
						{
							console.log("Wrote: " + record.id);
							maybeResolve(txInfo);
						}
					}
				}
			});
		}
		
		/** */
		delete()
		{
			return new Promise<void>(r =>
			{
				const request = indexedDB.deleteDatabase(this.idb.name);
				request.onsuccess = () => r();
				request.onerror = () => r();
			});
		}
		
		/** */
		private getCtor<R extends Record>(type: number)
		{
			const specific = registrations.get(type);
			
			if (!specific)
				throw "Record type not defined: " + type;
			
			return specific as typeof Record & RecordCtor<R>;
		}
	}
	
	const databases = new Map<string, Database>();
	const registrations = new Map<number, typeof Record>();
	const typeProperty = "@";
	const heap = new PrimitiveWeakMap<string, Record>();
}
