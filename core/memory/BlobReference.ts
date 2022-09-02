
namespace App
{
	/** */
	export interface BlobReference
	{
		readonly $$$: string;
	}
	
	/** */
	export namespace BlobReference
	{
		/** */
		export function create(segment: string)
		{
			const blobKey = Key.create(segment, -1);
			return [blobKey, { $$$: blobKey }] as [Key, BlobReference];
		}
		
		/** */
		export function parse(maybeRef: any): Key
		{
			if (!maybeRef || typeof maybeRef !== "object")
				return "";
			
			return (maybeRef as BlobReference).$$$ || "";
		}
		
		/** */
		export function find(containingObject: object): Key[]
		{
			const keys: Key[] = [];
			
			for (const v of Object.values(containingObject))
				if (v && typeof v === "object" && typeof (v as BlobReference).$$$ === "string")
					keys.push(v);
			
			return keys;
		}
	}
}
