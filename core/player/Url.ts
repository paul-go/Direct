
namespace Player
{
	/** */
	export namespace Url
	{
		/** */
		export function baseOf(url: string)
		{
			const lo = new URL(url);
			const path = lo.pathname.slice(0, Math.max(0, lo.pathname.lastIndexOf("/")));
			return join(lo.protocol + "//" + lo.host, path);
		}
		
		/** */
		export function join(...components: (string | undefined)[])
		{
			const parts = components.filter((s): s is string => !!s);
			
			for (let i = -1; ++i < parts.length - 1;)
				parts[i] = parts[i].replace(/\/$/, "");
			
			for (let i = 0; ++i < parts.length;)
				parts[i] = parts[i].replace(/^\//, "");
			
			return parts.join("/");
		}
		
		/** */
		export function toAbsolute(relativePathOrUrl: string, base: string)
		{
			if (!base.endsWith("/"))
				base += "/";
			
			return new URL(relativePathOrUrl, base).toString();
		}
	}
}
