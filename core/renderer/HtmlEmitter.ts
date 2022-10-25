
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
		themeColor = "";
		
		/** */
		faviconRoot = "";
		
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
				em.open("html", { lang: this.language });
			
			em.tag("meta", { charset: "utf-8" });
			em.tag("meta", { name: "apple-mobile-web-app-capable", content: "yes" });
			em.tag("meta", {
				name: "viewport",
				content: "width=device-width, initial-scale=1, user-scalable=no",
			});
			
			if (this.themeColor)
			{
				em.tag("meta", { name: "theme-color", content: this.themeColor });
				em.tag("meta", { name: "msapplication-TileColor", content: this.themeColor });
			}
			
			if (this.faviconRoot)
			{
				em.tag("meta", {
					name: "msapplication-TileImage",
					content: RenderUtil.getFaviconUrl(this.faviconRoot, 144),
				});
				
				for (const size of [57, 60, 72, 76, 114, 120, 144, 152, 180])
					this.createIconLink(em, "apple-touch-icon", size);
				
				for (const size of [16, 32, 96, 192])
					this.createIconLink(em, "icon", size);
			}
			
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
			
			if (this.language)
				em.close("html");
			
			return em.toString();
		}
		
		/** */
		private createIconLink(em: Emitter, rel: string, size: number)
		{
			em.tag("link", {
				rel,
				sizes: size + "x" + size,
				type: "image/png",
				href: RenderUtil.getFaviconUrl(this.faviconRoot, size),
			});
		}
	}
}
