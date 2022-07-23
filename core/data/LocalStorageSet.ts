
namespace Turf
{
	/**
	 * 
	 */
	export class LocalStorageSet
	{
		/** */
		constructor(instancePrefix: string)
		{
			this.prefix = "set-" + instancePrefix + "-";
		}
		
		private readonly prefix: string;
		
		/** */
		* [Symbol.iterator]()
		{
			for (let i = -1; ++i < localStorage.length;)
			{
				const key = localStorage.key(i);
				if (key?.startsWith(this.prefix))
					yield Number(key.slice(this.prefix.length));
			}
		}
		
		/** */
		add(value: number)
		{
			localStorage.setItem(this.prefix + value, "");
			return this;
		}
		
		/** */
		clear()
		{
			for (let i = -1; ++i < localStorage.length;)
			{
				const key = localStorage.key(i);
				if (key?.startsWith(this.prefix))
					localStorage.removeItem(key);
			}
		}
		
		/** */
		delete(value: number)
		{
			localStorage.removeItem(this.prefix + value);
		}
		
		/** */
		has(value: number)
		{
			value ||= 0;
			const item = Number(localStorage.getItem(String(value))) || 0;
			return item > 0;
		}
		
		/** */
		toSet()
		{
			return new Set(Array.from(this));
		}
	}
}
