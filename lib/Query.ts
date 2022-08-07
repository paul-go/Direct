
/**
 * Namespace of functions containing generic DOM querying functions
 */
namespace Query
{
	/** */
	type Constructor<T = any> = 
		(abstract new (...args: any) => T) | 
		(new (...args: any) => T);
	
	/**
	 * Returns the first element with the specified class name, 
	 * optionally as children of the specified element.
	 */
	export function find(cssClass: string, container?: Element)
	{
		const parent = container || document;
		return parent.getElementsByClassName(cssClass).item(0) as HTMLElement | null;
	}
	
	/**
	 * Iterates over the element children of the specified element,
	 * optionally with the specified type filter.
	 */
	export function children<T extends Element = HTMLElement>(
		target: Node,
		type?: Constructor<T>)
	{
		const children: T[] = [];
		if (target instanceof Element)
		{		
			const ctor: any = type || HTMLElement;
			for (let i = -1; ++i < target.children.length;)
			{
				const child = target.children[i];
				if (child instanceof ctor)
					children.push(child as T);
			}
		}
		return children;
	}
	
	/**
	 * Iterates over the element siblings of the specified element,
	 * optionally with the specified type filter.
	 */
	export function siblings<T extends Element = HTMLElement>(
		element: Element,
		type?: Constructor<T>)
	{
		return element.parentElement ? 
			Query.children(element.parentElement, type) :
			[];
	}
	
	/**
	 * Returns the element ancestors of the specified node.
	 */
	export function ancestors(node: Node | EventTarget | null, until?: Element)
	{
		const ancestors: Node[] = [];
		let current = node;
		
		while (current instanceof Node)
		{
			if (until && current === until)
				break;
			
			ancestors.push(current);
			current = current.parentElement;
		}
		
		return ancestors;
	}
	
	/**
	 * Return the ancestor of the specified target node that is an instance 
	 * of the specified type.
	 */
	export function ancestor<T extends Element = HTMLElement>(
		targetNode: Node | EventTarget | null,
		targetType: Constructor<T>): T | null
	{
		const elements = ancestors(targetNode);
		return elements.find(e => e instanceof targetType) as T;
	}
	
	/**
	 * Returns the position of the specified node in it's container.
	 */
	export function indexOf(node: Node)
	{
		const parent = node.parentElement;
		if (!parent)
			return 0;
		
		const length = parent.childNodes.length;
		for (let i = -1; ++i < length;)
			if (parent.childNodes.item(i) === node)
				return i;
		
		return -1;
	}
	
	/** */
	export function * recurse(parent: Node)
	{
		function * recurse(node: Node): IterableIterator<Node>
		{
			yield node;
			
			for (const child of Array.from(node.childNodes))
				yield * recurse(child);
		}
		
		yield * recurse(parent);
	}
}
