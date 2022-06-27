
namespace Turf
{
	/** */
	export interface FileLike extends Blob
	{
		readonly type: string;
		name?: string;
	}
	
	export namespace Util
	{
		/**
		 * Generates a short unique string value containing the base 36 character set.
		 */
		export function unique()
		{
			let now = Date.now() - 1648215698766;
			if (now <= lastNow)
				return (++lastNow).toString(36);
			
			lastNow = now;
			return now.toString(36);
		}
		let lastNow = 0;
	}
}
