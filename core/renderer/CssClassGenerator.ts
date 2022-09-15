
namespace App
{
	/**
	 * An object that generates small, sequential CSS class names
	 * for specific elements. Only one CSS class is created for each
	 * unique HTML element.
	 */
	export class CssClassGenerator
	{
		/**
		 * Returns the CSS class name that is uniquely assigned to the specified HTMLElement.
		 */
		classOf(e: HTMLElement)
		{
			let cls = this.elementClasses.get(e);
			if (cls)
				return cls;
			
			cls = "_" + (++this.nextClassIdx);
			this.elementClasses.set(e, cls);
			e.classList.add(cls);
			return cls;
		}
		
		private readonly elementClasses = new WeakMap<HTMLElement, string>();
		private nextClassIdx = 0;
	}
}
