
namespace Player
{
	/**
	 * A class that reads a raw HTML document, and provides
	 * the ability to scan the document with registered "traps",
	 * which allow the document's content to be modified.
	 */
	export class ForeignDocumentReader
	{
		/** */
		constructor(private readonly rawDocument: string) { }
		
		/** */
		trapElement(elementFn: (element: Element) => Element | null)
		{
			this.elementFn = elementFn;
		}
		private elementFn = (element: Element): Element | null => element;
		
		/** */
		trapAttribute(attributeFn: (name: string, value: string, element: Element) => string | null)
		{
			this.attributeFn = attributeFn;
		}
		private attributeFn = (name: string, value: string, element: Element): string | null => value;
		
		/** */
		trapProperty(propertyFn: (name: string, value: string) => string)
		{
			this.propertyFn = propertyFn;
		}
		private propertyFn = (name: string, value: string) => name;
		
		/** */
		read()
		{
			const doc = new DOMParser().parseFromString(this.rawDocument, "text/html");
			
			for (const walker = doc.createTreeWalker(doc);;)
			{
				let node = walker.nextNode();
				
				if (!node)
					break;
				
				if (!(node instanceof Element))
					continue;
				
				let element = node as Element;
				
				const result = this.elementFn(element);
				if (result === null)
				{
					element.remove();
					continue;
				}
				else if (result instanceof Node && result !== element)
				{
					element.replaceWith(result);
					element = result;
				}
				
				if (element instanceof HTMLStyleElement)
				{
					if (element.sheet)
					{
						this.readSheet(element.sheet);
						
						const cssText: string[] = [];
						for (let i = -1, len = element.sheet.cssRules.length; ++i < len;)
							cssText.push(element.sheet.cssRules[i].cssText);
						
						if (element instanceof HTMLStyleElement)
							element.textContent = cssText.join("\n");
					}
				}
				
				for (const attr of Array.from(element.attributes))
				{
					const newValue = this.attributeFn(attr.name, attr.value, element);
					if (newValue === null)
						element.removeAttributeNode(attr);
					else
						element.setAttribute(attr.name, newValue);
				}
				
				if (element instanceof HTMLElement && element.hasAttribute("style"))
					this.readStyle(element.style);
			}
			
			return doc;
		}
		
		/** */
		private readSheet(sheet: CSSStyleSheet)
		{
			const recurse = (group: CSSGroupingRule | CSSStyleSheet) =>
			{
				const len = group.cssRules.length;
				for (let i = -1; ++i < len;)
				{
					const rule = group.cssRules.item(i);
					
					if (rule instanceof CSSGroupingRule)
						recurse(rule);
					
					else if (rule instanceof CSSStyleRule)
						this.readStyle(rule.style);
				}
			};
			
			recurse(sheet);
		}
		
		/** */
		private readStyle(style: CSSStyleDeclaration)
		{
			const names: string[] = [];
			
			for (let n = -1; ++n < style.length;)
				names.push(style[n]);
			
			for (const name of names)
			{
				const value = style.getPropertyValue(name);
				const priority = style.getPropertyPriority(name);
				const resultValue = this.propertyFn(name, value);
				
				if (resultValue !== value)
				{
					// The property has to be removed either way,
					// because if we're setting a new property with
					// a different URL, it won't get properly replaced.
					style.removeProperty(name);
					
					if (resultValue)
						style.setProperty(name, resultValue, priority);
				}
			}
		}
	}
}
