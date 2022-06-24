
namespace Back
{
	if (typeof module === "object")
	{
		Object.assign(module.exports, { Back });
		global["Back"] = Back;
	}
	
	/** */
	export class Instance
	{
		/** */
		constructor()
		{
			
			for (const [name, value] of Object.entries(this))
			{
				if (["string", "number", "boolean"].includes(value))
				{
					defineProperty(this, name, value);
				}
				else if (globalThis.Array.isArray(value))
				{
					// Standard Array
					if (value.length === 0)
					{
						
					}
					// Tuple Array
					else
					{
						
					}
				}
			}
			
		}
		
		/** */
		save()
		{
			
		}
	}
	
	type P = string | number;
	
	/** */
	export function tuple<T1 extends P>(a: T1): [T1];
	export function tuple<T1 extends P, T2 extends P>(a: T1, b: T2): [T1, T2];
	export function tuple<T1 extends P, T2 extends P, T3 extends P>(a: T1, b: T2, c: T3): [T1, T2, T3];
	export function tuple<T1 extends P, T2 extends P, T3 extends P, T4 extends P>(
		a: T1, b: T2, c: T3, d: T4): [T1, T2, T3, T4];
	export function tuple(...values: any[])
	{
		const s: [string, string] = ["", ""];
		
		return values;
	}
	
	/** */
	export class Array<T extends Object>
	{
		/** */
		at(index: number)
		{
			
		}
		
		/** */
		add(item: T, index = -1)
		{
			
		}
		
		/** */
		remove()
		{
			
		}
		
		/** */
		get length()
		{
			return this.array.length;
		}
		
		private array: T[] = [];
	}
	
	/** */
	function defineProperty(
		target: Instance,
		name: string,
		value: string | number | boolean)
	{
		Object.defineProperty(target, name, {
			get()
			{
				return value;
			},
			set(newValue: string | number | boolean)
			{
				value = newValue;
			}
		});
	}
	
	/*
	
	const ud = new UserData();
	
	There's a concept of the graph being reachable.
	
	I think until the objects are reachable, it doesn't actually save.
	
	Define an object as a standalone.
	
	Define a type as a standalone.
	
	
	Object
	Obj
	
	Root
	Stored
	Base
	Thing
	Instance
	Storable
	Saved
	
	
	extends Back.Base
	
	*/
	
	
}
