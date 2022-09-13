
namespace App
{
	/** */
	export async function drawHtml(
		htmlContent: string,
		ctx: CanvasRenderingContext2D)
	{
		const image = new Image();
		const canvas = ctx.canvas;
		const width = canvas.width;
		const height = canvas.height;
		const svgText = 
			`<svg xmlns="http://www.w3.org/2000/svg" width="${width}px" height="${height}px">` +
				`<foreignObject width="100%" height="100%">` +
					`<div xmlns="http://www.w3.org/1999/xhtml">` +
						htmlContent +
					`</div>` +
				`</foreignObject>` +
			`</svg>`;
		
		return new Promise<void>(resolve =>
		{
			image.onload = () =>
			{
				ctx.drawImage(image, 0, 0);
				resolve();
			};
			
			image.src = `data:image/svg+xml;charset=utf-8,` + svgText;
		});
	}
}
