
namespace App
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
					yield key.slice(this.prefix.length);
			}
		}
		
		/** */
		add(...values: string[])
		{
			for (const value of values)
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
		delete(...values: string[])
		{
			for (const value of values)
				localStorage.removeItem(this.prefix + value);
		}
		
		/** */
		toSet()
		{
			return new Set(Array.from(this));
		}
	}
}
