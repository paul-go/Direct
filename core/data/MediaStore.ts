
namespace Turf
{
	/** */
	export interface IStoredMediaObject
	{
		/**
		 * A friendly name for the media object.
		 * Typically the name of the file as it was sent in from the operating system.
		 */
		readonly name: string;
		
		/**
		 * The mime type of the media object.
		 */
		readonly type: MimeType;
		
		/** 
		 * A blob that stores the actual data of the media object.
		 */
		readonly blob: Blob;
	}
	
	/** */
	export interface IMediaObject extends IStoredMediaObject
	{
		/**
		 * An internally generated unique identifier for the MediaObject.
		 */
		readonly key: string;
		
		/**
		 * A session-specific blob URI that can be used to refer to the blob
		 * in a HTML or CSS context.
		 */
		readonly url: string;
	}
	
	/**
	 * 
	 */
	export class MediaStore
	{
		/**
		 * Creates or opens a MediaStore that is connected
		 * to an IndexedDB database with the specified name.
		 */
		constructor(private readonly name: string) { }
		
		private readonly blobUrlTable = new Map<string, string>();
		
		/**
		 * Adds a file to IndexedDB, and returns a reference key.
		 */
		add(file: FileLike): IMediaObject
		{
			const name = file.name || "";
			const key = Util.unique();
			const type = file.type as MimeType;
			const blob = new Blob([file], { type });
			const storedObject: IStoredMediaObject = { name, blob, type };
			const url = URL.createObjectURL(blob);
			
			(async () =>
			{
				const db = await this.open();
				const tx = db.transaction([ConstS.dbStoreName], "readwrite");
				const store = tx.objectStore(ConstS.dbStoreName);
				const putResult = store.put(storedObject, key);
				
				if (DEBUG)
					putResult.onsuccess = () => console.log("Object saved to IndexedDB: " + key);
				
				putResult.onerror = e =>
				{
					console.error("An error occured while trying to write to IndexedDB:");
					console.log(e);
				};
			})();
			
			this.blobUrlTable.set(key, url);
			return { key, url, ...storedObject };
		}
		
		/** */
		async get(key: string)
		{
			return new Promise<IMediaObject | null>(async r =>
			{
				const db = await this.open();
				const tx = db.transaction([ConstS.dbStoreName], "readonly");
				const store = tx.objectStore(ConstS.dbStoreName);
				const request = store.get(key);
				
				request.onsuccess = () =>
				{
					const storedObject: IStoredMediaObject = request.result;
					
					let url = this.blobUrlTable.get(key);
					if (!url)
					{
						url = URL.createObjectURL(storedObject.blob);
						this.blobUrlTable.set(key, url);
					}
					
					r({ key, url, ...storedObject });
				};
				
				request.onerror = error =>
				{
					console.error(error);
					r(null);
				};
			});
		}
		
		/** */
		private async open()
		{
			return new Promise<IDBDatabase>(r =>
			{
				const existing = databases.get(this.name);
				if (existing)
					return r(existing);
				
				const openRequest = indexedDB.open(this.name, 1);
				
				openRequest.onupgradeneeded = () =>
				{
					const db = openRequest.result;
					if (!db.objectStoreNames.contains(ConstS.dbStoreName))
						db.createObjectStore(ConstS.dbStoreName);
				};
				
				openRequest.onsuccess = () =>
				{
					const db = openRequest.result;
					databases.set(this.name, db);
					r(db);
				};
			});
		}
		
		/** */
		clear()
		{
			this.blobUrlTable.clear();
			indexedDB.deleteDatabase(this.name);
		}
	}
	
	const databases = new Map<string, IDBDatabase>();
}
