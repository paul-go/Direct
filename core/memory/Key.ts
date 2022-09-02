
namespace App
{
	/** */
	export type Key = string;
	
	/** */
	export interface IKeyableDeclarations
	{
		ctor: new() => object;
		stable: number;
	}
	
	/** */
	export namespace Key
	{
		/** */
		export function declare(...decls: IKeyableDeclarations[])
		{
			if (keyables.length > 0)
				return;
			
			keyables.push(...decls);
		}
		const keyables: IKeyableDeclarations[] = [];
		
		/**
		 * Returns an instance of the class that is referred to within
		 * the specified key.
		 */
		export function instantiate(key: Key)
		{
			const stable = stableOf(key);
			const keyable = Not.nullable(keyables.find(k => k.stable === stable));
			const object = new keyable.ctor();
			keyMap.set(object, key);
			return object;
		}
		
		/**
		 * Gets the key that has been assigned to the specified object.
		 */
		export function of(object: object)
		{
			return keyMap.get(object) || "";
		}
		
		/**
		 * Sets an internal key on the specified object. The key may be
		 * optionally derived from the key of the specified owner.
		 * 
		 * @returns A boolean value that indicates whether a new
		 * key was set on the object. If a key already exists, the return
		 * value will be false.
		 */
		export function set(object: object, segment: string | object = "")
		{
			if (Key.of(object))
				return false;
			
			if (typeof segment === "object")
			{
				const ownerKey = Key.of(segment);
				const parsed = parse(ownerKey);
				segment = parsed.segment;
			}
			
			const keyInfo = getKeyInfo(object);
			const key = Key.create(segment, keyInfo.stable);
			keyMap.set(object, key);
			return true;
		}
		
		const keyMap = new WeakMap<object, Key>();
		
		/** */
		export function startsWith(segment: string, stable?: number)
		{
			return Keyva.prefix(compose(segment, stable));
		}
		
		/** */
		export function create(segment: string, stable: number)
		{
			return compose(segment, stable, next());
		}
		
		/** */
		function compose(segment: string, stable?: number, unique?: string)
		{
			return [segment, stable, unique].filter(s => s !== undefined).join();
		}
		
		/** */
		export function segmentOf(via: string | object)
		{
			const key = typeof via === "string" ? via : Key.of(via);
			return parse(key).segment;
		}
		
		/** */
		export function stableOf(target: string | object)
		{
			if (typeof target === "string")
				return parse(target).stable;
			
			const keyable = keyables.find(k => k.ctor === target.constructor || k.ctor === target);
			return Not.nullable(keyable).stable;
		}
		
		/** */
		function getKeyInfo(object: object)
		{
			const ctor = object.constructor;
			for (const keyable of keyables)
				if (keyable.ctor === ctor)
					return keyable;
			
			Not.reachable();
		}
		
		/** */
		function parse(key: string)
		{
			Not.falsey(key);
			
			const parts = key.split();
			const unique = parseInt(parts.pop() || "", 36);
			const stable = Number(parts.pop()) || 0;
			const segment = parts.pop() || "";
			return { segment, stable, unique };
		}
		
		/** */
		export function next()
		{
			const val = ((Number(localStorage.getItem(incKey)) || 0) + 1).toString();
			localStorage.setItem(incKey, val);
			return val;
		}
		
		/** */
		export function reset()
		{
			localStorage.removeItem(incKey);
		}
		
		const incKey = "__inc__";
	}
}

/** */
declare interface String
{
	/**
	 * Splits this string on the comma character.
	 * (This is a missing definition from lib.d.ts)
	 */
	split(): string[];
}
