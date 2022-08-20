
namespace App
{
	/** */
	export type FlipFunctions<T> =
		{
			readonly [K in keyof T]: () => string;
		}
		& 
		{
			install(): Hot.Param;
			readonly value: () => string;
			readonly element: HTMLElement;
		};
	
	/** */
	export function createFlipper<T extends Literal<string, Hot.Style>>(states: T): FlipFunctions<T>
	{
		const flipper: Literal<string, () => void> = {};
		let element: HTMLElement;
		let currentValue: (() => void) | undefined = undefined;
		
		flipper.install = () => (e: HTMLElement) =>
		{
			element = e;
			currentValue?.();
		};
		
		const cssClasses: string[] = [];
		
		for (const [name, style] of Object.entries(states))
		{
			const cssClassName = Hot.css(style);
			cssClasses.push(cssClassName);
			
			const fn = () =>
			{
				if (!element)
					throw "Flipper not installed.";
				
				currentValue = fn;
				element.classList.remove(...cssClasses);
				element.classList.add(cssClassName);
			};
			
			if (currentValue === undefined)
				currentValue = fn;
			
			flipper[name] = fn;
		}
		
		Object.defineProperty(flipper, "value", {
			get: () => currentValue
		})
		
		Object.defineProperty(flipper, "element", {
			get: () => element
		});
		
		return flipper as FlipFunctions<T>;
	}
}
