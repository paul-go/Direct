
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
		 * Loads the specified JavaScript code file into the browser,
		 * if it has not already done so.
		 */
		export async function include(src: string)
		{
			if (includedScripts.has(src))
				return;
			
			includedScripts.add(src);
			
			if (DEBUG && ELECTRON)
			{
				const path = require("path") as typeof import("path");
				src = "file://" + path.join(__dirname, src);
			}
			
			return new Promise<void>(resolve =>
			{
				if (src.endsWith(".js"))
				{
					const script = document.createElement("script");
					script.src = src;
					script.onload = () =>
					{
						script.remove();
						resolve();
					};
					document.head.append(script);
				}
				else if (src.endsWith(".css"))
				{
					const link = document.createElement("link");
					link.rel = "stylesheet";
					link.type = "text/css";
					link.href = src;
					link.onload = () => resolve();
					document.head.append(link);
				}
			});
		}
		const includedScripts = new Set<string>();
		
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
