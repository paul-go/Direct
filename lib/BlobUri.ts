
/**
 * A class that wraps the URL.createObjectURL and URL.revokeObjectURL
 * methods, in order to allow blobs to be recovered from a specific blob URI.
 */
namespace BlobUri
{
	/**
	 * Creates a blob URI from the specified blob.
	 */
	export function create(blob: Blob)
	{
		for (const [uri, existingBlob] of blobs)
			if (existingBlob === blob)
				return uri;
		
		const uri = URL.createObjectURL(blob);
		blobs.set(uri, blob);
		return uri;
	}
	
	/**
	 * Returns the Blob object that has been associated with the
	 * specified URI.
	 */
	export function recover(blobUri: string)
	{
		for (const [uri, existingBlob] of blobs)
			if (uri === blobUri)
				return existingBlob;
		
		return null;
	}
	
	/**
	 * Revokes the URI associated with a given blob, by providing
	 * the blob URI or the actual blob object.
	 */
	export function revoke(target: string | Blob)
	{
		let revokeUri = "";
		
		for (const [uri, blob] of blobs)
		{
			if (target === uri || target === blob)
			{
				blobs.delete(uri);
				revokeUri = uri;
			}
		}
		
		URL.revokeObjectURL(revokeUri);
	}
	
	const blobs = new Map<string, Blob>();
}
