
namespace Player
{
	/** */
	export namespace Url
	{
		/**
		 * Returns the URL to the containing folder of the specified URL.
		 * 
		 */
		export function folderOf(url: string)
		{
			{
				const lo = new URL(url);
				const parts = lo.pathname.split("/");
				if (parts[parts.length - 1].includes("."))
					parts.pop();
				
				const path = parts.join("/");
				return join(lo.protocol + "//" + lo.host, path);
			}
			
			const lo = new URL(url);
			const path = lo.pathname.slice(0, Math.max(0, lo.pathname.lastIndexOf("/")));
			return join(lo.protocol + "//" + lo.host, path);
		}
		
		/**
		 * Performs a simplistic path join on the specified components.
		 * The algorithm used is a simple concatenation with multiple
		 * successive / characters between the concatenated result
		 * reduced to a single / character.
		 */
		export function join(...components: (string | undefined)[])
		{
			const parts = components.filter((s): s is string => !!s);
			
			for (let i = -1; ++i < parts.length - 1;)
				parts[i] = parts[i].replace(/\/$/, "");
			
			for (let i = 0; ++i < parts.length;)
				parts[i] = parts[i].replace(/^\//, "");
			
			return parts.join("/");
		}
		
		/**
		 * Returns the URL provided in fully qualified form,
		 * using the specified baseUrl.
		 */
		export function toAbsolute(relativePathOrUrl: string, baseUrl: string)
		{
			if (!baseUrl.endsWith("/"))
				baseUrl += "/";
			
			return new URL(relativePathOrUrl, baseUrl).toString();
		}
	}
}
