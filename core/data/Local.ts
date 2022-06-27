
namespace Turf
{
	/** */
	export namespace Local
	{
		/** */
		export function get(key: string | number)
		{
			return localStorage.getItem(addPrefix(key));
		}
		
		/** */
		export function set(key: string | number, value: string)
		{
			localStorage.setItem(addPrefix(key), value);
		}
		
		/** */
		export function remove(key: string | number)
		{
			localStorage.removeItem(addPrefix(key));
		}
		
		/** */
		export function *each(prefix: string = "")
		{
			prefix = addPrefix(prefix);
			
			for (let i = -1; ++i < localStorage.length;)
			{
				const key = localStorage.key(i);
				if (!key)
					break;
				
				if (key.slice(0, prefix.length) !== prefix)
					continue;
				
				yield key.slice(ConstS.appPrefix.length);
			}
		}
		
		/** */
		function addPrefix(key: string | number)
		{
			const k = String(key);
			return k.startsWith(ConstS.appPrefix) ? k : ConstS.appPrefix + k;
		}
	}
}
