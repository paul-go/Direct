
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
