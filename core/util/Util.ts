
namespace App
{
	/** */
	export type Constructor<T = any> = 
		(abstract new (...args: any) => T) | 
		(new (...args: any) => T);
	
	/** */
	export namespace Util
	{
		/**
		 * Returns the constructor function of the specified object.
		 */
		export function constructorOf<T extends Object>(object: T): Constructor<T>
		{
			return (object as any).constructor;
		}
		
		/**
		 * Generates a globally unique string value containing the base 36 character set.
		 */
		export function unique()
		{
			return Date.now().toString(36) + "-" + Util.randomChars(16);
		}
		
		/**
		 * Generates a string of the specified length containing 
		 * cryptographically random alpha-numeric characters,
		 * in both upper and lower case.
		 */
		export function randomChars(length: number)
		{
			const bytes = new Uint8Array(length);
			crypto.getRandomValues(bytes);
			let id = "";
			
			for (let i = -1; ++i < bytes.length;)
			{
				let b = (bytes[i] % 62) + 48;
				
				if (b > 57)
					b += 7;
				
				if (b > 90)
					b += 6;
				
				id += String.fromCharCode(b);
			}
			
			return id;
		}
		
		/**
		 * Loads the specified JavaScript code file into the browser,
		 * if it has not already done so.
		 */
		export async function include(src: string)
		{
			if (includedScripts.has(src))
				return Promise.resolve(true);
			
			includedScripts.add(src);
			
			if (DEBUG && ELECTRON)
			{
				const fs = require("fs") as typeof import("fs");
				const path = require("path") as typeof import("path");
				
				// Attempt to load from the build directory first
				let tryPath = path.join(__dirname, src);
				
				if (!fs.existsSync(tryPath))
				{
					// If the file doesn't exist in the build directory, attempt the /lib directory
					tryPath = path.join(__dirname, "../lib", src);
					if (!fs.existsSync(tryPath))
						throw "Could not locate file: " + src;
				}
				
				src = "file://" + tryPath;
			}
			
			return new Promise<boolean>(resolve =>
			{
				if (src.endsWith(".js"))
				{
					const script = document.createElement("script");
					script.src = src;
					script.onload = () =>
					{
						script.remove();
						resolve(true);
					};
					script.onerror = () =>
					{
						console.error("Failed to load: " + src);
						resolve(false);
					}
					document.head.append(script);
				}
				else if (src.endsWith(".css"))
				{
					const link = document.createElement("link");
					link.rel = "stylesheet";
					link.type = "text/css";
					link.href = src;
					link.onload = () => resolve(true);
					link.onerror = () => resolve(false);
					document.head.append(link);
				}
			});
		}
		const includedScripts = new Set<string>();
		
		/**
		 * Returns the two specified Node instances in DOM order.
		 */
		export function orderElements<T extends Node>(nodeA: T, nodeB: T): [T, T]
		{
			const cmp = nodeA.compareDocumentPosition(nodeB);
			const following = window.Node.DOCUMENT_POSITION_FOLLOWING;
			const forward = cmp === 0 || (cmp & following) === following;
			
			return [
				forward ? nodeA : nodeB,
				forward ? nodeB : nodeA
			];
		}
		
		/** */
		export function deepObjectClone(object: object)
		{
			return JSON.parse(JSON.stringify(object));
		}
		
		/** */
		export function deepObjectEquals(a: any, b: any)
		{
			if (a === b)
				return true;
			
			if (typeof a !== typeof b || !a  || !b)
				return false;
			
			const entriesA = Object.entries(a).sort().toString();
			const entriesB = Object.entries(b).sort().toString();
			return entriesA === entriesB;
		}
		
		/**
		 * Parses the specified string as JSON text in a try/catch block
		 * to avoid unhandled exceptions being generated.
		 */
		export function tryParseJson<T = any>(jsonText: string): T | null
		{
			try
			{
				return JSON.parse(jsonText);
			}
			catch (e)
			{
				return null;
			}
		}
		
		//# Dialogs
		
		/** */
		export async function confirm(message: string): Promise<boolean>
		{
			let result = false;
			
			if (TAURI)
				result = await (Tauri.dialog.confirm(message) as any as Promise<boolean>);
			else
				result = window.confirm(message) as any as boolean;
			
			return result;
		}
		
		/** */
		export async function alert(message: string): Promise<void>
		{
			if (TAURI)
				await (window.alert(message) as any);
			else
				window.alert(message);
		}
		
		//# Record Related
		
		/** */
		export function createMediaRecords(
			files: FileLike[],
			guardedMimes?: MimeClass[])
		{
			const records: MediaRecord[] = [];
			
			for (const file of files)
			{
				const mimeType = MimeType.from(file.type);
				if (!mimeType)
					continue;
				
				if (guardedMimes && !guardedMimes.includes(MimeType.getClass(file.type)))
					continue;
				
				const record = new MediaRecord();
				record.blob = new Blob([file.data], { type: file.type });
				record.name = file.name;
				record.type = mimeType;
				records.push(record);
			}
		
			return records;
		}
		
		/**
		 * 
		 */
		export function getMimeClass(record: BackgroundRecord)
		{
			const media = record.media;
			return media ?
				MimeType.getClass(media.type) :
				null;
		}
		
		/**
		 * 
		 */
		export function generatePostSlug()
		{
			const date = new Date();
			return (
				date.getFullYear() + 
				"-" + 
				("0" + (date.getMonth() + 1)).slice(-2) + 
				"-" +
				("0" + (date.getDate() + 1)).slice(-2));
		}
		
		/** */
		export function isSlugValid(slug: string)
		{
			return !!slug && /^[a-z0-9]+(-[a-z0-9]+)*$/i.test(slug);
		}
		
		/**
		 * Performs a deep traversal on all Records that are descendents
		 * of the record specified.
		 */
		export function * eachDeepRecord(via: Record)
		{
			function * recurse(record: Record): IterableIterator<Record>
			{
				yield record;
				
				for (const child of Object.values(record))
				{
					if (child instanceof Record)
						yield * recurse(child);
					
					if (Array.isArray(child) && Array.length > 0 && child[0] instanceof Record)
						for (const recordInArray of child)
							yield * recurse(recordInArray);
				}
			}
			
			yield * recurse(via);
		}
		
		//# Unsorted
		
		/**
		 * 
		 */
		export function getFileName(path: string)
		{
			return path.split(/(\/|\\)/g).filter(s => !!s).slice(-1)[0] || "";
		}
	}
}
