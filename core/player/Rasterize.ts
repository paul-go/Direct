
namespace Player
{
	/**
	 * Rasterizes the specified HTML content to a CanvasRenderingContext2D,
	 * whose dimensions are equal to the specified viewport width and height.
	 */
	export async function rasterize(
		element: HTMLElement,
		options?: {
			viewportWidth?: number,
			viewportHeight?: number,
			cssRules?: string[],
		})
	{
		element = element.cloneNode(true) as HTMLElement;
		await replaceBlobUrls(element);
		
		const [w, h] = [
			options?.viewportWidth || window.innerWidth, 
			options?.viewportHeight || window.innerHeight
		];
		
		const htmlContent = new XMLSerializer().serializeToString(element);
		const image = new Image();
		const canvas = Hot.canvas({ width: w, height: h });
		const ctx = canvas.getContext("2d")!;
		const surroundingStyle = getSurroundingStyle();
		const inlineStyle = options?.cssRules?.length ? 
			`<style>${options.cssRules.join("")}</style>` : 
			"";
		
		const svgText = [
			`<svg xmlns="http://www.w3.org/2000/svg" width="${w}px" height="${h}px">`,
				`<foreignObject width="100%" height="100%">`,
					`<div xmlns="http://www.w3.org/1999/xhtml">`,
						surroundingStyle,
						inlineStyle, 
						htmlContent,
					`</div>`,
				`</foreignObject>`,
			`</svg>`
		].join("\n").replace(/&quot;/g, "")
		
		return new Promise<Blob>(resolve =>
		{
			image.onload = () =>
			{
				ctx.drawImage(image, 0, 0, w, h);
				ctx.canvas.toBlob(blob =>
				{
					resolve(blob || new Blob([]));
				}, 
				"image/jpeg");
			};
			
			image.src = `data:image/svg+xml;charset=utf-8,` + svgText;
		});
	}
	
	/** */
	function getSurroundingStyle()
	{
		if (embeddedStyle)
			return embeddedStyle;
		
		const qsa = document.querySelectorAll("LINK[rel='stylesheet'], STYLE");
		const elements = Array.from(qsa) as (HTMLLinkElement | HTMLStyleElement)[];
		const allCssText = elements
			.map(e => e.sheet)
			.filter((sh): sh is CSSStyleSheet => !!sh)
			.flatMap(sh => Array.from(sh.cssRules))
			.map(rule => rule.cssText)
			.join("\n");
		
		return embeddedStyle = `<style type="text/css">${allCssText}</style>`;
	}
	let embeddedStyle = "";
	
	/** */
	async function replaceBlobUrls(element: HTMLElement)
	{
		const promises: Promise<void>[] = [];
		
		for (const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT);;)
		{
			const node = walker.nextNode();
			if (!node)
				break;
			
			if (!(node instanceof HTMLElement))
				continue;
			
			if (node instanceof HTMLImageElement && node.src.startsWith("blob:"))
			{
				const blob = BlobUri.recover(node.src);
				if (!blob)
					return console.warn("Blob not found for blob: " + node.src);
				
				promises.push(new Promise<void>(async resolve =>
				{
					node.src = await getDataUri(blob);
					resolve();
				}));
			}
			
			const bg = node.style.backgroundImage;
			if (!bg.startsWith("url(blob:") && !bg.startsWith(`url("blob:`))
				continue;
			
			const start = bg.indexOf("blob:");
			const end = bg.endsWith(`")`) ? -2 : -1;
			const blobUri = bg.slice(start, end);
			const blob = BlobUri.recover(blobUri);
			
			if (!blob)
				return console.warn("Blob not found for blob: " + blobUri);
			
			promises.push(new Promise<void>(async resolve =>
			{
				const uri = await getDataUri(blob);
				node.style.backgroundImage = `url(${uri})`;
				resolve();
			}));
		}
		
		await Promise.allSettled(promises);
	}
	
	/** */
	function getDataUri(blob: Blob)
	{
		return new Promise<string>(resolve =>
		{
			const fileReader = new FileReader();
			fileReader.onload = e =>
			{
				const dataUri = (e.target?.result ?? "") as string;
				resolve(dataUri);
			};
			fileReader.readAsDataURL(blob);
		});
	}
}
