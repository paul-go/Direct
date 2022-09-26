
namespace App
{
	/** */
	export class HtmlEmitter
	{
		/** */
		title = "";
		
		/** */
		language = "";
		
		/** */
		minify = false;
		
		/** */
		formatAsXml = false;
		
		/** */
		addInlineCss(cssText: string)
		{
			if (cssText !== "")
				this.inlineCssParts.push(cssText);
		}
		private inlineCssParts: string[] = [];
		
		/** */
		emit(elements: HTMLElement | HTMLElement[])
		{
			elements = Array.isArray(elements) ? elements : [elements];
			const em = new Emitter(this.minify, this.formatAsXml);
			
			em.line("<!DOCTYPE html>");
			
			if (this.language)
				em.tag("html", { lang: this.language });
			
			if (this.title)
				em.tag("title", {}, this.title);
			
			if (this.inlineCssParts.length > 0)
			{
				em.open("style");
				em.lines(...this.inlineCssParts);
				em.close("style");
			}
			
			const recurse = (e: HTMLElement) =>
			{
				const attributesTable: Literal<string, string | number> = {};
				const name = e.tagName.toLowerCase();
				
				for (const attribute of Array.from(e.attributes))
				{
					if (attribute.name === "class")
					{
						const classes = Array.from(e.classList).join(" ");
						attributesTable["class"] = classes;
					}
					else
					{
						attributesTable[attribute.name] = attribute.value;
					}
				}
				
				if (e.childElementCount === 0)
				{
					em.tag(name, attributesTable, e.textContent || "");
				}
				else
				{
					em.open(name, attributesTable);
					em.indent();
					
					for (const child of Array.from(e.childNodes))
					{
						if (child instanceof Text && child.nodeValue)
						{
							em.line(child.nodeValue);
						}
						else if (child instanceof HTMLElement)
						{
							// Avoid emitting custom elements
							if (!child.tagName.includes("-"))
								recurse(child);
						}
					}
					
					em.outdent();
					em.close(name);
				}
			}
			
			for (const e of elements)
				recurse(e);
			
			return em.toString();
		}
	}
}
