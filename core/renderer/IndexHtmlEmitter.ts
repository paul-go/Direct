
namespace App
{
	/** */
	export class IndexHtmlEmitter extends HtmlEmitter
	{
		/** */
		emit(sceneElement: HTMLElement, folderDepth = 0)
		{
			const nocache = this.minify ? "" : "?" + Date.now();
			const relative = "../".repeat(folderDepth);
			const metaCharset = Hot.meta();
			metaCharset.setAttribute("charset", "utf-8");
			
			return super.emit([
				metaCharset,
				Hot.meta({ name: "theme-color", content: "#000000" }),
				Hot.meta({
					name: "viewport",
					content: "width=device-width, initial-scale=1, user-scalable=no" }),
				Hot.meta({
					name: "apple-mobile-web-app-capable",
					content: "yes"
				}),
				Hot.link("link", {
					rel: "stylesheet",
					type: "text/css",
					href: relative + ConstS.cssFileNameGeneral + nocache,
				}),
				sceneElement,
				Hot.script({
					src: relative + ConstS.jsFileNamePlayer + nocache
				}),
			]);
		}
	}
}
