
namespace Turf
{
	/**
	 * A WeakMap that allows for primitives to be used as keys.
	 * Performs it's own internal garbage collection periodically.
	 */
	export class PrimitiveWeakMap<K extends string | number | boolean, V extends Object>
	{
		/** */
		get(key: K): V | undefined
		{
			this.queueGarbageCollection();
			const ref = this.map.get(key);
			if (!ref)
				return undefined;
			
			const value = ref.deref();
			if (value === undefined)
				this.map.delete(key);
			
			return value;
		}
		
		/** */
		set(key: K, value: V)
		{
			this.queueGarbageCollection();
			this.map.set(key, new WeakRef(value));
			return this;
		}
		
		/** */
		has(key: K): boolean
		{
			this.queueGarbageCollection();
			return !!this.get(key);
		}
		
		/** */
		delete(key: K)
		{
			this.queueGarbageCollection();
			return this.map.delete(key);
		}
		
		/** */
		private queueGarbageCollection()
		{
			clearTimeout(this.gcTimeout);
			
			this.gcTimeout = setTimeout(() =>
			{
				for (const [key, ref] of this.map)
					if (ref.deref() === undefined)
						this.map.delete(key);
			},
			5000);
		}
		
		private gcTimeout: any = 0;
		private readonly map = new Map<K, WeakRef<V>>();
	}
}
