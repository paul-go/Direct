
/**
 * 
 */
namespace Cage
{
	/** */
	export interface ICage
	{
		readonly root: Element;
	}
	
	/** */
	type Constructor<T = any> = 
		(abstract new (...args: any) => T) | 
		(new (...args: any) => T);
	
	/**
	 * Returns the Cage of the specified Element,
	 * with the specified type.
	 * Returns null in the case when the cage is of a type other
	 * than the one specified.
	 * Note that elements can have multiple cages, provided
	 * that they are of different types.
	 */
	export function get<T extends ICage>(
		e: Element,
		type: Constructor<T>): T | null
	{
		let current: Element | null = e;
		
		for (;;)
		{
			const array = cages.get(current);
			
			if (array)
				for (const obj of array)
					if (obj instanceof type)
						return obj;
			
			if (!(current.parentElement instanceof Element))
				break;
			
			current = current.parentElement;
		}
		
		return null;
	}
	
	/**
	 * Connects the specified object to the specified cage.
	 */
	export function set(cage: ICage)
	{
		const array = cages.get(cage.root) || [];
		array.push(cage);
		cages.set(cage.root, array);
		(cage.root as any)._cage = cage;
		
		const ctorClassName = getConstructorClassName(cage);
		cage.root.classList.add(ctorClassName);
	}
	
	/**
	 * Scans upward through the DOM, starting at the specified Node, 
	 * looking for the first element whose cage matches the specified type.
	 */
	export function over<T extends ICage>(
		via: Node | ICage,
		type: Constructor<T>)
	{
		let current: Node | null = via instanceof Node ? via : via.root;
		
		while (current instanceof Node)
		{
			if (current instanceof Element)
			{
				const cage = Cage.get(current, type);
				if (cage)
					return cage;
			}
				
			current = current.parentElement;
		}
		
		throw new Error("Cage not found.");
	}
	
	/**
	 * Finds all descendent elements that have an attached cage of the
	 * specified type, that exist underneath the specified Node or cage,
	 * The specified function is executed against each cage, if it is provided.
	 * 
	 * @returns The first matching cage, or null if no matching cage
	 * was found.
	 */
	export function under<T extends ICage>(
		via: Node | ICage,
		type: Constructor<T>,
		execFn?: (cage: T) => void)
	{
		const e = 
			via instanceof Element ? via : 
			via instanceof Node ? via.parentElement :
			via.root;
		
		if (!e)
			throw "Cannot perform this method using the specified node.";
		
		const className = cageClassNames.get(type);
		
		// If there is no class name found for the specified cage type,
		// this could possibly be an error (meaning that the cage type
		// wasn't registered). But it could also be a legitimate case of the
		// cage simply not having been registered at the time of this
		// function being called.
		if (!className)
			return;
		
		const descendents = e.getElementsByClassName(className);
		const cages: T[] = [];
		
		for (let i = -1; ++i < descendents.length;)
		{
			const descendent = descendents[i];
			const cage = Cage.get(descendent, type);
			if (cage)
				cages.push(cage);
		}
		
		if (execFn)
			for (const c of cages)
				execFn(c);
		
		return cages.length > 0 ? cages[0] : null;
	}
	
	/**
	 * Returns an array of Cages of the specified type,
	 * which are extracted from the specified array of elements.
	 */
	export function map<T extends ICage>(elements: Element[], type: Constructor<T>): T[];
	export function map<T extends ICage>(elementContainer: Element, type: Constructor<T>): T[];
	export function map<T extends ICage>(e: Element | Element[], type: Constructor<T>): T[]
	{
		const elements = e instanceof Element ? window.Array.from(e.children) : e;
		return elements
			.map(e => get(e, type))
			.filter((o): o is T => o instanceof type);
	}
	
	/**
	 * Returns the element succeeding the specified element in the DOM
	 * that is connected to a cage of the specified type.
	 */
	export function next<T extends ICage>(via: Element, type: Constructor<T>): T | null
	{
		for (;;)
		{
			via = via.nextElementSibling as Element;
			if (!(via instanceof Element))
				return null;
			
			const cage = get(via, type);
			if (cage)
				return cage;
		}
	}
	
	/**
	 * Returns the element preceeding the specified element in the DOM
	 * that is connected to a cage of the specified type.
	 */
	export function previous<T extends ICage>(via: Element, type: Constructor<T>): T | null
	{
		for (;;)
		{
			via = via.previousElementSibling as Element;
			if (!(via instanceof Element))
				return null;
			
			const cage = get(via, type);
			if (cage)
				return cage;
		}
	}
	
	/** */
	function childrenOf<T extends ICage>(e: Element, cageType?: Constructor<T>)
	{
		let children = globalThis.Array.from(e.children);
		
		if (cageType)
			children = children.filter(e => Cage.get(e, cageType));
		
		return children;
	}
	
	/**
	 * Returns a unique CSS class name that corresponds to the type
	 * of the cage. This is used for querying via the .under() function.
	 */
	function getConstructorClassName(cage: ICage)
	{
		const ctor = cage.constructor;
		let className = cageClassNames.get(ctor);
		if (!className)
		{
			className = "__cage_" + (++nameIdx) + "__";
			cageClassNames.set(ctor, className);
		}
		
		return className;
	}
	
	let nameIdx = 0;
	const cageClassNames = new WeakMap<Function, string>();
	const cages = new WeakMap<Element, object[]>();
	
	/**
	 * 
	 */
	export class Array<TCage extends ICage = ICage>
	{
		/** */
		constructor(
			private readonly parentElement: Element,
			private readonly cageType: Constructor<TCage>)
		{
			this.marker = document.createComment("");
			parentElement.append(this.marker);
		}
		
		private readonly marker: Comment;
		
		/** */
		* [Symbol.iterator]()
		{
			for (let i = -1; ++i < this.parentElement.children.length;)
			{
				const child = this.parentElement.children.item(i);
				if (child)
				{
					const cage = Cage.get(child, this.cageType);
					if (cage)
						yield cage;
				}
			}
		}
		
		/** */
		map(): TCage[];
		map<T>(mapFn: (value: TCage, index: number, array: TCage[]) => T): T[];
		map(mapFn?: (value: TCage, index: number, array: TCage[]) => any)
		{
			const elements = childrenOf(this.parentElement, this.cageType);
			const cages = Cage.map(elements, this.cageType);
			return mapFn ? cages.map(mapFn) : cages;
		}
		
		/** */
		at(index: number)
		{
			return this.map().at(index) || null;
		}
		
		/** */
		insert(...cages: TCage[]): number;
		insert(index: number, ...cages: TCage[]): number;
		insert(a: number | TCage, ...newCages: TCage[])
		{
			const index = typeof a === "number" ? (a || 0) : -1;
			const existingCages = this.map();
			
			if (typeof a === "object")
				newCages.unshift(a);
			
			if (newCages.length === 0)
				return;
			
			if (existingCages.length === 0)
			{
				this.parentElement.prepend(...newCages.map(c => c.root));
			}
			else
			{
				const target = index >= existingCages.length ? 
					(existingCages.at(index) as ICage).root :
					this.marker;
				
				for (const cage of newCages)
					this.parentElement.insertBefore(cage.root, target);
			}
			
			return index < 0 ? existingCages.length + newCages.length : index;
		}
		
		/** */
		move(fromIndex: number, toIndex: number)
		{
			const children = childrenOf(this.parentElement, this.cageType);
			const target = children.at(toIndex);
			const source = children.at(fromIndex);
			
			if (source && target)
				target.insertAdjacentElement("beforebegin", source);
		}
		
		/** */
		indexOf(cage: TCage)
		{
			const children = childrenOf(this.parentElement, this.cageType);
			for (let i = -1; ++i < children.length;)
				if (children[i] === cage.root)
					return i;
			
			return -1;
		}
		
		/** */
		get length()
		{
			return childrenOf(this.parentElement, this.cageType).length;
		}
		
		/** */
		observe(callback: (mut: MutationRecord) => void)
		{
			if (this.observers.length === 0)
			{
				const mo = new MutationObserver(mutations =>
				{
					for (const mut of mutations)
						for (const fn of this.observers)
							fn(mut);
				});
				
				mo.observe(this.parentElement, { childList: true });
			}
			
			this.observers.push(callback);
		}
		
		private readonly observers: ((mut: MutationRecord) => void)[] = [];
		
		/** */
		private toJSON()
		{
			return this.map();
		}
	}
}
