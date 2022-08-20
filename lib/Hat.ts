
/**
 * 
 */
namespace Hat
{
	/** */
	export interface IHat
	{
		readonly root: Element;
	}
	
	/** */
	type Constructor<T = any> = 
		(abstract new (...args: any) => T) | 
		(new (...args: any) => T);
	
	/**
	 * Marks the specified class as a Hat.
	 */
	export function wear(hat: IHat)
	{
		const array = hats.get(hat.root) || [];
		array.push(hat);
		hats.set(hat.root, array);
		(hat.root as any)._hat = hat;
		
		const ctorClassName = getConstructorClassName(hat);
		hat.root.classList.add(ctorClassName);
	}
	
	/**
	 * @returns The Hat of the specified Element with the specified Hat type,
	 * or null in the case when the Element is not wearing a Hat of the specified type.
	 */
	export function get<T extends IHat>(
		e: Element,
		type: Constructor<T>): T | null
	{
		let current: Element | null = e;
		
		for (;;)
		{
			const array = hats.get(current);
			
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
	 * Scans upward through the DOM, starting at the specified Node, 
	 * looking for the first element wearing a Hat of the specified type.
	 * 
	 * @returns A reference to the Hat that exists above the specified Node
	 * in the DOM, or null if no such Hat was found.
	 */
	export function up<T extends IHat>(
		via: Node | IHat,
		type: Constructor<T>)
	{
		let current: Node | null = via instanceof Node ? via : via.root;
		
		while (current instanceof Node)
		{
			if (current instanceof Element)
			{
				const hat = Hat.get(current, type);
				if (hat)
					return hat;
			}
				
			current = current.parentElement;
		}
		
		return null;
	}
	
	/**
	 * Scans upward through the DOM, starting at the specified Node, 
	 * looking for the first element wearing a Hat of the specified type.
	 * 
	 * @throws An exception if no Hat of the specified type is found.
	 */
	export function over<T extends IHat>(
		via: Node | IHat,
		type: Constructor<T>)
	{
		const hat = up(via, type);
		if (!hat)
			throw new Error("Hat not found.");
		
		return hat;
	}
	
	/**
	 * Finds the first descendent element that has an attached Hat of the
	 * specified type, that exists underneath the specified Node or Hat.
	 * 
	 * @returns The Hat associated with the descendent element, or
	 * null if no such Hat is found.
	 */
	export function down<T extends IHat>(via: Node | IHat, type: Constructor<T>)
	{
		const hats = within(via, type, true);
		return hats.length > 0 ? hats[0] : null;
	}
	
	/**
	 * Finds all descendent elements that have an attached Hat of the
	 * specified type, that exist underneath the specified Node or Hat.
	 * 
	 * @returns An array of Hats whose type matches the type specified.
	 */
	export function under<T extends IHat>(via: Node | IHat, type: Constructor<T>)
	{
		return within(via, type, false);
	}
	
	/** */
	function within<T extends IHat>(via: Node | IHat, type: Constructor<T>, one: boolean)
	{
		const e = 
			via instanceof Element ? via : 
			via instanceof Node ? via.parentElement :
			via.root;
		
		if (!e)
			throw "Cannot perform this method using the specified node.";
		
		const className = hatClassNames.get(type);
		
		// If there is no class name found for the specified hat type,
		// this could possibly be an error (meaning that the hat type
		// wasn't registered). But it could also be a legitimate case of the
		// hat simply not having been registered at the time of this
		// function being called.
		if (!className)
			return [];
		
		const descendents = e.getElementsByClassName(className);
		const hats: T[] = [];
		const len = one ? 1 : descendents.length;
		
		for (let i = -1; ++i < len;)
		{
			const descendent = descendents[i];
			const hat = Hat.get(descendent, type);
			if (hat)
				hats.push(hat);
		}
		
		return hats;
	}
	
	/**
	 * Returns an array of Hats of the specified type,
	 * which are extracted from the specified array of elements.
	 */
	export function map<T extends IHat>(elements: Element[], type: Constructor<T>): T[];
	export function map<T extends IHat>(elementContainer: Element | IHat, type: Constructor<T>): T[];
	export function map<T extends IHat>(e: IHat | Element | Element[], type: Constructor<T>): T[]
	{
		e = (!(e instanceof Element) && !window.Array.isArray(e)) ? e.root : e;
		const elements = e instanceof Element ? window.Array.from(e.children) : e;
		return elements
			.map(e => get(e, type))
			.filter((o): o is T => o instanceof type);
	}
	
	/**
	 * Returns the element succeeding the specified element in the DOM
	 * that is connected to a hat of the specified type.
	 */
	export function next<T extends IHat>(via: Element | IHat, type: Constructor<T>): T | null
	{
		via = via instanceof Element ? via : via.root;
		
		for (;;)
		{
			via = via.nextElementSibling as Element;
			if (!(via instanceof Element))
				return null;
			
			const hat = get(via, type);
			if (hat)
				return hat;
		}
	}
	
	/**
	 * Returns the element preceeding the specified element in the DOM
	 * that is connected to a hat of the specified type.
	 */
	export function previous<T extends IHat>(via: Element | IHat, type: Constructor<T>): T | null
	{
		via = via instanceof Element ? via : via.root;
		
		for (;;)
		{
			via = via.previousElementSibling as Element;
			if (!(via instanceof Element))
				return null;
			
			const hat = get(via, type);
			if (hat)
				return hat;
		}
	}
	
	/** */
	function childrenOf<T extends IHat>(e: Element, hatType?: Constructor<T>)
	{
		let children = globalThis.Array.from(e.children);
		
		if (hatType)
			children = children.filter(e => Hat.get(e, hatType));
		
		return children;
	}
	
	/**
	 * Returns a unique CSS class name that corresponds to the type
	 * of the hat. This is used for querying via the .under() function.
	 */
	function getConstructorClassName(hat: IHat)
	{
		const ctor = hat.constructor;
		let className = hatClassNames.get(ctor);
		if (!className)
		{
			className = ctor.name.length < 3 ? 
				"_hat_" + ctor.name:
				ctor.name;
			
			hatClassNames.set(ctor, className);
		}
		
		return className;
	}
	
	const hatClassNames = new WeakMap<Function, string>();
	const hats = new WeakMap<Element, object[]>();
	
	/**
	 * 
	 */
	export class Array<THat extends IHat = IHat>
	{
		/** */
		constructor(
			private readonly parentElement: Element,
			private readonly hatType: Constructor<THat>)
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
					const hat = Hat.get(child, this.hatType);
					if (hat)
						yield hat;
				}
			}
		}
		
		/** */
		map(): THat[];
		map<T>(mapFn: (value: THat, index: number, array: THat[]) => T): T[];
		map(mapFn?: (value: THat, index: number, array: THat[]) => any)
		{
			const elements = childrenOf(this.parentElement, this.hatType);
			const hats = Hat.map(elements, this.hatType);
			return mapFn ? hats.map(mapFn) : hats;
		}
		
		/** */
		at(index: number)
		{
			return this.map().at(index) || null;
		}
		
		/** */
		insert(...hats: THat[]): number;
		insert(index: number, ...hats: THat[]): number;
		insert(a: number | THat, ...newHats: THat[])
		{
			const index = typeof a === "number" ? (a || 0) : -1;
			const existingHats = this.map();
			
			if (typeof a === "object")
				newHats.unshift(a);
			
			if (newHats.length === 0)
				return;
			
			if (existingHats.length === 0)
			{
				this.parentElement.prepend(...newHats.map(c => c.root));
			}
			else
			{
				const target = index >= existingHats.length ? 
					(existingHats.at(index) as IHat).root :
					this.marker;
				
				for (const hat of newHats)
					this.parentElement.insertBefore(hat.root, target);
			}
			
			return index < 0 ? existingHats.length + newHats.length : index;
		}
		
		/** */
		move(fromIndex: number, toIndex: number)
		{
			const children = childrenOf(this.parentElement, this.hatType);
			const target = children.at(toIndex);
			const source = children.at(fromIndex);
			
			if (source && target)
				target.insertAdjacentElement("beforebegin", source);
		}
		
		/** */
		indexOf(hat: THat)
		{
			const children = childrenOf(this.parentElement, this.hatType);
			for (let i = -1; ++i < children.length;)
				if (children[i] === hat.root)
					return i;
			
			return -1;
		}
		
		/** */
		get length()
		{
			return childrenOf(this.parentElement, this.hatType).length;
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
	
	declare var module: any;
	if (typeof module === "object")
		Object.assign(module.exports, { Hat });
}
