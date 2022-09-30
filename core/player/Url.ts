
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
		export function join(a: string, b: string)
		{
			return a.replace(/\/$/, "") + "/" + b.replace(/^\//, "");
		}
		
		/** */
		export function toAbsolute(url: string, base: string)
		{
			if (!base.endsWith("/"))
				base += "/";
			
			return new URL(url, base).toString();
		}
	}
}
