
namespace App
{
	//@ts-ignore
	if (!DEBUG) return;
	
	/** */
	export class FaviconEmitter
	{
		/** */
		async emit(blob: Blob)
		{
			debugger;
			return this.emitPngs(blob);
		}
		
		/** */
		async emitIco(blob: Blob)
		{
			const canvas = Hot.canvas();
			const image = new Image();
			image.src = URL.createObjectURL(blob);
			const ctx = canvas.getContext("2d")!;
			
			const outBlob = await new Promise<Blob>(resolve =>
			{
				ctx.drawImage(image, 0, 0, image.width, image.height);
				canvas.toBlob(blob =>
				{
					resolve(blob!);
				},
				"image/vnd.microsoft.icon", "-moz-parse-options: format-bmp;bpp=32");
			});
			
			return outBlob;
		}
		
		/** */
		async emitPngs(blob: Blob)
		{
			const image = new Image();
			image.src = URL.createObjectURL(blob);
			
			await new Promise<void>(resolve =>
			{
				image.onload = () => resolve();
			});
			
			const width = image.width;
			const height = image.height;
			const out = new Map<string, Blob>();
			const promises: Promise<void>[] = [];
			
			for (const size of sizes)
			{
				const canvas = Hot.canvas({ width, height });
				const ctx = canvas.getContext("2d")!;
				promises.push(new Promise<void>(resolve =>
				{
					ctx.drawImage(image, 0, 0, width, height);
					ctx.imageSmoothingEnabled = true;
					ctx.imageSmoothingQuality = "high";
					canvas.toBlob(blob =>
					{
						out.set(nameOf(size), blob!);
						resolve();
					},
					"image/png", "");
				}));
			}
			
			await Promise.all(promises);
			
			return out;
			
		}
		
		/** */
		emitHtml(relativePath = "/")
		{
			const r = relativePath;
			
			return [
				`<link rel="apple-touch-icon" sizes="57x57" href="${nameOf(57, r)}">`,
				`<link rel="apple-touch-icon" sizes="60x60" href="${nameOf(60, r)}">`,
				`<link rel="apple-touch-icon" sizes="72x72" href="${nameOf(72, r)}">`,
				`<link rel="apple-touch-icon" sizes="76x76" href="${nameOf(76, r)}">`,
				`<link rel="apple-touch-icon" sizes="114x114" href="${nameOf(114, r)}">`,
				`<link rel="apple-touch-icon" sizes="120x120" href="${nameOf(120, r)}">`,
				`<link rel="apple-touch-icon" sizes="144x144" href="${nameOf(144, r)}">`,
				`<link rel="apple-touch-icon" sizes="152x152" href="${nameOf(152, r)}">`,
				`<link rel="apple-touch-icon" sizes="180x180" href="${nameOf(180, r)}">`,
				`<link rel="icon" type="image/png" sizes="192x192"  href="${nameOf(192, r)}">`,
				`<link rel="icon" type="image/png" sizes="32x32" href="${nameOf(32, r)}">`,
				`<link rel="icon" type="image/png" sizes="96x96" href="${nameOf(96, r)}">`,
				`<link rel="icon" type="image/png" sizes="16x16" href="${nameOf(16, r)}">`,
				`<link rel="manifest" href="${r}manifest.json">`,
				`<meta name="msapplication-TileColor" content="#000000">`,
				`<meta name="msapplication-TileImage" content="${nameOf(144, r)}">`,
				`<meta name="theme-color" content="#000000">`,
			].join("\n");
		}
	}
	
	/** */
	function nameOf(size: number, relativePath?: string)
	{
		let name = prefix + "-" + size + "x" + size + ".png";
		if (relativePath)
			name = relativePath + name;
		
		return name;
	}
	
	const prefix = "favicon";
	const sizes = [16, 32, 57, 60, 72, 76, 96, 114, 120, 144, 152, 180, 192] as const;
}
