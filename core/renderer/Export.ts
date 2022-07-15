
namespace Turf
{
	/** */
	export namespace Exporter
	{
		/** */
		export async function exportPatch(
			patch: PatchRecord,
			meta: MetaRecord,
			baseFolder: string)
		{
			const storyDiv = renderPatchFinal(patch, meta);
			const htmlExport = createHtmlFile(storyDiv);
			const cssExport = createGeneralCssFile();
			const jsExport = await createPlayerJsFile();
			if (!jsExport)
				throw "Could not fetch the index file.";
			
			await htmlExport.write(baseFolder);
			await cssExport.write(baseFolder);
			await jsExport.write(baseFolder);
		}
		
		/** */
		function createHtmlFile(element: HTMLElement)
		{
			const htmlFile = new HtmlFile();
			const htmlText = htmlFile.emit(element);
			return new ExportFile(
				htmlText,
				MimeType.html,
				ConstS.htmlFileName);
		}
		
		/** */
		function createGeneralCssFile()
		{
			const cssText = Turf.createGeneralCssText();
			return new ExportFile(
				cssText,
				MimeType.css,
				ConstS.cssFileNameGeneral);
		}
		
		/** */
		async function createPlayerJsFile()
		{
			let jsFileText = "";
			
			if (TAURI)
			{
				try
				{
					const result = await fetch(ConstS.jsFileName);
					jsFileText = await result.text();
				}
				catch (e) { }
			}
			else if (ELECTRON)
			{
				const path = Electron.path.join(__dirname, ConstS.jsFileName);
				jsFileText = Electron.fs.readFileSync(path, "utf-8");
			}
			
			return new ExportFile(
				jsFileText,
				MimeType.js,
				ConstS.jsFileName);
		}
		
		/** */
		function createMediaFile()
		{
			
		}
	}
	
	/** */
	class ExportFile
	{
		constructor(
			readonly data: string | ArrayBuffer,
			readonly mime: MimeType,
			readonly fileName: string,
			readonly folderName: string = "")
		{ }
		
		/** */
		async write(baseFolder: string)
		{
			if (TAURI)
			{
				const path = await Tauri.path.join(baseFolder, this.folderName, this.fileName);
				
				typeof this.data === "string" ?
					await Tauri.fs.writeFile(path, this.data) :
					await Tauri.fs.writeBinaryFile(path, this.data);
			}
			else if (ELECTRON)
			{
				const path = Electron.path.join(baseFolder, this.folderName, this.fileName);
				const data = typeof this.data === "string" ?
					this.data : 
					Buffer.from(this.data);
				
				Electron.fs.writeFileSync(path, data);
			}
		}
	}
}
