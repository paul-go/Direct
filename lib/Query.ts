
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
	 * Returns all elements with the specified class name, 
	 * optionally as children of the specified element.
	 */
	export function find(cssClass: string, container?: Element)
	{
		const parent = container || document;
		const array = Array.from(parent.getElementsByClassName(cssClass));
		return array as HTMLElement[];
	}
	
	/**
	 * Iterates over the element children of the specified element,
	 * optionally with the specified type filter.
	 */
	export function children<T extends Element = HTMLElement>(
		element: Element,
		type?: Constructor<T>)
	{
		const ctor: any = type || HTMLElement;
		const children: T[] = [];
		
		for (let i = -1; ++i < element.children.length;)
		{
			const child = element.children[i];
			if (child instanceof ctor)
				children.push(child as T);
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
	export function ancestors(node: Node | EventTarget | null)
	{
		const ancestors: Node[] = [];
		let current = node;
		
		while (current instanceof Node)
		{
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
}
