
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
			const elements: HTMLElement[] = []
			
			if (options.hasIndexList)
			{
				elements.push(Hot.link({
					rel: ConstS.yessIndexListKey,
					type: "text/plain",
					href: relative + ConstS.yessIndexListDefaultValue,
				}));
			}
			
			if (options.hasIndepth)
			{
				elements.push(Hot.link({
					rel: ConstS.yessIndepthKey,
					type: "text/html",
					href: ConstS.yessIndepthDefaultValue,
				}));
			}
			
			elements.push(
				Hot.link({
					rel: "stylesheet",
					href: "https://fonts.bunny.net/css?family=inter:100,200,300,400,500,600,700,800,900:400"
				}),
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
