
namespace App
{
	/** */
	export class HtmlFile
	{
		/** */
		title = "";
		
		/** */
		language = "en-us";
		
		/** */
		customHeaderHtml = "";
		
		/** */
		customFooterHtml = "";
		
		/** */
		minify = false;
		
		/** */
		emit(element: HTMLElement, folderDepth = 0)
		{
			const em = new Emitter(this.minify);
			this.emitUpperHtml(em, folderDepth);
			this.emitStoryHtml(em, element);
			this.emitLowerHtml(em);
			return em.toString();
		}
		
		/** */
		private emitUpperHtml(em: Emitter, folderDepth: number)
		{
			const nocache = this.minify ? "" : "?" + Date.now();
			const relative = "../".repeat(folderDepth);
			
			em.line("<!DOCTYPE html>");
			em.tag("html", { lang: this.language });
			
			if (this.title)
				em.tag("title", {}, this.title);
			
			em.tag("meta", { charset: "utf-8" });
			em.tag("meta", { name: "theme-color", content: "#000000" });
			em.tag("meta", {
				name: "viewport",
				content: "width=device-width, initial-scale=1, user-scalable=no"
			});
			em.tag("meta", {
				name: "apple-mobile-web-app-capable",
				content: "yes"
			});
			
			em.tag("link", {
				rel: "stylesheet",
				type: "text/css",
				href: relative + ConstS.cssFileNameGeneral + nocache,
			});
			
			em.tag("script", { src: relative + ConstS.jsFileNamePlayer + nocache }, "");
			
			if (this.customHeaderHtml)
				em.line(this.customHeaderHtml);
		}
		
		/** */
		private emitStoryHtml(em: Emitter, storyElement: HTMLElement)
		{
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
				
				if (e.childElementCount === 0 && (e.textContent || "").trim() === "")
				{
					// Awkward AF
					const noCloseTag = name === "br" || name === "img";
					em.tag(name, attributesTable, noCloseTag ? undefined : "");
				}
				else
				{
					em.tag(name, attributesTable);
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
					em.tagEnd(name);
				}
			}
			
			recurse(storyElement);
			
			if (!"is this necessary?")
			{
				// Pick up the initialization script tag that follows the story element,
				// though this is unnecessary if the HTML being generated is for the
				// draft, because the story will have already been initialized.
				const next = storyElement.nextElementSibling;
				if (next instanceof HTMLScriptElement)
					recurse(next);
			}
		}
		
		/** */
		private emitLowerHtml(em: Emitter)
		{
			if (this.customFooterHtml)
				em.line(this.customFooterHtml);
			
			em.tagEnd("html");
		}
	}
}
