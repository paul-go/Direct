
namespace Turf
{
	/** */
	export class IterableWeakMap<K, V extends object> extends Map<K, V>
	{
		/** */
		* [Symbol.iterator](): IterableIterator<[K, V]>
		{
			for (const [key, value] of this.map)
			{
				const innerValue = value.deref();
				if (innerValue)
					yield [key, innerValue];
			}
		}
		
		/** */
		get(key: K)
		{
			this.queueCleanup();
			return this.map.get(key)?.deref();
		}
		
		/** */
		set(key: K, value: V): this
		{
			this.queueCleanup();
			this.map.set(key, new WeakRef(value));
			return this;
		}
		
		/** */
		has(key: K): boolean
		{
			return !!this.get(key);
		}
		
		/** */
		clear()
		{
			this.map.clear();
		}
		
		/**
		 * Iterates through the entire heap and deletes any records
		 * that are have no references.
		 */
		private queueCleanup()
		{
			clearTimeout(this.timeoutId);
			this.timeoutId = setTimeout(() =>
			{
				for (const [key, ref] of this.map)
					if (ref.deref() === undefined)
						this.delete(key);
			},
			5000);
		}
		
		private timeoutId: any = 0;
		private readonly map = new Map<K, WeakRef<V>>();
	}
}
