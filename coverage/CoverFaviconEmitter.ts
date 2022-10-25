
namespace Cover
{
	/** */
	export async function coverFaviconEmitter()
	{
		const blob = Cover.readBlob("resources/icon.png");
		const emitter = new App.FaviconEmitter();
		const icons = await emitter.emit(blob);
		const outDir = Electron.path.join(process.cwd(), "+favicons");
		
		if (!Electron.fs.existsSync(outDir))
			Electron.fs.mkdirSync(outDir);
		
		for (const [fileName, blob] of icons)
			Cover.writeBlob(blob, outDir, fileName);
		
		console.log("Done");
		
		// Add this to the build if it works
	}
	
	/** * /
	export async function coverResizeImage()
	{
		//const inBlob = Cover.readBlob("resources/icon.png");
		const image = new Image();
		image.src = Electron.path.join(process.cwd(), "resources/icon.png");
		
		const blob = await App.rasterize(image, {
			viewportWidth: 300,
			viewportHeight: 300,
		});
		
		const outDir = Electron.path.join(process.cwd(), "+favicons");
		const fileName = "fav.png";
		const arrayBuffer = await blob.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const fullPath = Electron.path.join(outDir, fileName);
		Electron.fs.writeFileSync(fullPath, buffer);
	}*/
}
