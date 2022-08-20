
namespace When
{
	type Callback = (element: HTMLElement) => void;
	
	/**
	 * Returns a function that can be called, which invokes the specified callback 
	 * function when the specified HTMLElement is connected to the DOM. 
	 * If the element is already connected to the DOM, the callback function is
	 * invoked immediately.
	 * 
	 * (This overload is intended for use as an argument to an element creation
	 * function in the Hot library).
	 */
	export function connected(callback: Callback): Callback;
	/**
	 * Invokes the specified callback function when the specified HTMLElement
	 * is inserted into the DOM. If the element is already connected to the DOM,
	 * the callback function is invoked immediately.
	 */
	export function connected(element: HTMLElement, callback: Callback): void;
	export function connected(a: any, b?: any): Callback | void
	{
		const element = a instanceof HTMLElement ? a : null;
		const callback = (b || a) as Callback;
		
		if (element?.isConnected)
			return void callback(element);
		
		maybeInstallRootObserver();
		
		if (!element)
			return (e: HTMLElement) => void awaiting.push([e, callback, true]);
		
		awaiting.push([element, callback, true]);
	}
	
	/**
	 * Provides similar functionality to When.connected, but the callback
	 * is invoked after a setTimeout call. Code executed in this call can modify
	 * the style of the element in order to trigger transitions immediately
	 * after being inserted.
	 */
	export function rendered(callback: Callback): Callback;
	/**
	 * Provides similar functionality to When.connected, but the callback
	 * is invoked after a setTimeout call. Code executed in this call can modify
	 * the style of the element in order to trigger transitions immediately
	 * after being inserted.
	 * 
	 * (This overload is intended for use as an argument to an element creation
	 * function in the Hot library).
	 */
	export function rendered(element: HTMLElement, callback: Callback): void;
	export function rendered(a: any, b?: any): Callback | void
	{
		const element = a instanceof HTMLElement ? a : null;
		const callback = (b || a) as Callback;
		return element ?
			When.connected(element, () => setTimeout(() => callback(element), 1)) :
			When.connected(element => setTimeout(() => callback(element), 1));
	}
	
	/**
	 * Returns a function that can be called, which invokes the specified callback 
	 * function when the specified HTMLElement is disconnected from the DOM. 
	 * If the element isn't connected to the DOM at the time this function is called,
	 * the callback function will be called after the element has been connected
	 * and then disconnected.
	 * 
	 * (This overload is intended for use as an argument to an element creation
	 * function in the Hot library).
	 */
	export function disconnected(callback: Callback): Callback;
	/**
	 * Invokes the specified callback function when the specified HTMLElement
	 * is connected into the DOM. If the element is already connected to the DOM,
	 * the callback function is invoked immediately.
	 */
	export function disconnected(element: HTMLElement, callback: Callback): void;
	export function disconnected(a: any, b?: any): Callback | void
	{
		const element = a instanceof HTMLElement ? a : null;
		const callback = (b || a) as Callback;
		
		maybeInstallRootObserver();
		
		const execute = (e: HTMLElement) =>
		{
			if (e.isConnected)
				awaiting.push([e, callback, false]);
			else
				When.connected(e, () => awaiting.push([e, callback, false]));
		}
		
		if (!element)
			return (e: HTMLElement) => execute(e);
		
		execute(element);
	}
	
	/** */
	function maybeInstallRootObserver()
	{
		if (hasInstalledRootObserver)
			return;
		
		hasInstalledRootObserver = true;
		
		new MutationObserver(() =>
		{
			const invokations: [HTMLElement, Callback][] = [];
			
			for (let i = awaiting.length; i-- > 0;)
			{
				const [element, callback, awaitingConnected] = awaiting[i];
				if (element.isConnected === awaitingConnected)
				{
					awaiting.splice(i, 1);
					invokations.push([element, callback]);
				}
			}
			
			// Run the callbacks in a separate pass, to deal with the fact that
			// there could be multiple awaiters watching the same element,
			// but also to handle the fact the callback functions could modify
			// the awaiting list.
			for (const [element, callback] of invokations)
				callback(element);
			
		}).observe(document.body, { childList: true, subtree: true });
	}
	let hasInstalledRootObserver = false;
	
	const awaiting: [HTMLElement, Callback, boolean][] = [];
}
