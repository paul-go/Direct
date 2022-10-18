
namespace App
{
	/** */
	export class IndexHtmlEmitter extends HtmlEmitter
	{
		/** */
		emit(sceneElement: HTMLElement, options: IndexHtmlEmitterOptions = {})
		{
			const nocache = this.minify ? "" : "?" + Date.now();
			const relative = "../".repeat(options.folderDepth || 0);
			const metaCharset = Hot.meta();
			metaCharset.setAttribute("charset", "utf-8");
			
			const elements: HTMLElement[] = [
				metaCharset,
				Hot.meta({ name: "theme-color", content: "#000000" }),
				Hot.meta({
					name: "viewport",
					content: "width=device-width, initial-scale=1, user-scalable=no"
				}),
				Hot.meta({
					name: "apple-mobile-web-app-capable",
					content: "yes"
				}),
			];
			
			if (options.hasIndexList)
			{
				elements.push(Hot.link({
					rel: ConstS.essIndexListKey,
					type: "text/plain",
					href: relative + ConstS.essIndexListDefaultValue,
				}));
			}
			
			if (options.hasIndepth)
			{
				elements.push(Hot.link({
					rel: ConstS.essIndepthKey,
					type: "text/html",
					href: ConstS.essIndepthDefaultValue,
				}));
			}
			
			elements.push(
				Hot.link({
					rel: "stylesheet",
					type: "text/css",
					href: "/" + ConstS.cssFileNameGeneral + nocache,
				}),
				sceneElement,
				Hot.script({
					src: "/" + ConstS.jsFileNamePlayer + nocache
				}),
			);
			
			return super.emit(elements);
		}
	}
	
	/** */
	export interface IndexHtmlEmitterOptions
	{
		folderDepth?: number;
		hasIndexList?: boolean;
		hasIndepth?: boolean;
	}
}
