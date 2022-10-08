
namespace Player
{
	/**
	 * A library which operates over the browser-supplied history.pushState()
	 * methods. This library allows the usage of the browser's back and forward
	 * buttons to be independently tracked. All history manipulation in the app
	 * should pass through this layer rather than using the history.* methods
	 * directly.
	 */
	export namespace History
	{
		/** */
		export function back()
		{
			if (stackPosition < 0)
				return;
			
			disableEvents(() =>
			{
				history.back();
				stackPosition--;
			});
		}
		
		/** */
		export function forward()
		{
			if (stackPosition >= stack.length)
				return;
			
			disableEvents(() =>
			{
				history.forward();
				stackPosition++;
			});
		}
		
		/** */
		export function push(slug: string)
		{
			stack.length = stackPosition + 1;
			stackPosition = stack.length;
			const entry: THistoryEntry = { slug, stackPosition };
			stack.push(entry);
			history.pushState(entry, "", slug);
		}
		
		/** */
		function disableEvents(callback: () => void)
		{
			if (triggerProgrammaticEvents)
				disconnectHandler();
			
			try
			{
				callback();
			}
			catch (e) { }
			finally
			{
				maybeConnectHandler();
			}
		}
		
		/**
		 * Indicates whether programmatic calls to history.back and history.forward()
		 * should result in the back and forward events being triggered.
		 */
		export let triggerProgrammaticEvents = false;
		
		/**
		 * Installs an event handler that invokes when the
		 * user presses either the back or forward button.
		 */
		export function on(event: "back" | "forward", fn: () => void)
		{
			maybeConnectHandler();
			
			event === "back" ?
				backHandlers.push(fn) :
				forwardHandlers.push(fn);
		}
		
		/** */
		function maybeConnectHandler()
		{
			if (!hasConnectedHandler)
			{
				window.addEventListener("popstate", handler);
				hasConnectedHandler = true;
			}
		}
		
		/** */
		function disconnectHandler()
		{
			window.removeEventListener("popstate", handler);
			hasConnectedHandler = false;
		}
		
		let hasConnectedHandler = false;
		
		/** */
		function handler(ev: PopStateEvent)
		{
			setTimeout(() =>
			{
				const state = (history.state as THistoryEntry | null);
				const newStackPosition = state?.stackPosition || -1;
				const handlers = newStackPosition > stackPosition ?
					forwardHandlers :
					backHandlers;
				
				for (const handler of handlers)
					handler(ev);
			});
		}
		
		type THistoryEntry = { slug: string, stackPosition: number };
		const backHandlers: ((ev: PopStateEvent) => void)[] = [];
		const forwardHandlers: ((ev: PopStateEvent) => void)[] = [];
		const stack: THistoryEntry[] = [];
		let stackPosition = -1;
	}
}
