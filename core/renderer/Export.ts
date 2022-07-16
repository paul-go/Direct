
namespace Turf
{
	/** */
	export namespace Export
	{
		/** */
		export async function single(
			patch: PatchRecord,
			meta: MetaRecord,
			baseFolder: string)
		{
			const storyDiv = renderPatchFinal(patch, meta);
			await maybeCreateFolder(baseFolder);
			
			const promises: Promise<void>[] = [
				writeHtmlFile(storyDiv, baseFolder),
				writeGeneralCssFile(baseFolder),
				writePlayerJsFile(baseFolder)
			];
			
			for (const record of Util.eachDeepRecord(patch))
				if (record instanceof MediaRecord)
					promises.push(createMediaFile(record, baseFolder));
			
			await Promise.all(promises);
		}
		
		/** */
		function writeHtmlFile(element: HTMLElement, folderName: string)
		{
			const htmlFile = new HtmlFile();
			const htmlText = htmlFile.emit(element);
			return writeFile(htmlText, MimeType.html, folderName, ConstS.htmlFileName);
		}
		
		/** */
		function writeGeneralCssFile(folderName: string)
		{
			const cssText = Turf.createGeneralCssText();
			return writeFile(cssText, MimeType.css, folderName, ConstS.cssFileNameGeneral);
		}
		
		/** */
		async function writePlayerJsFile(folderName: string)
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
			
			return writeFile(jsFileText, MimeType.js, folderName, ConstS.jsFileName);
		}
		
		/** */
		async function createMediaFile(record: MediaRecord, folderName: string)
		{
			const buffer = await record.blob.arrayBuffer();
			return writeFile(buffer, record.type, folderName, record.name);
		}
		
		/** */
		async function writeFile(
			data: string | ArrayBuffer,
			mime: MimeType,
			folderName: string,
			fileName: string)
		{
			const path = await pathJoin(folderName, fileName);
			
			if (TAURI)
			{
				typeof data === "string" ?
					await Tauri.fs.writeFile(path, data) :
					await Tauri.fs.writeBinaryFile(path, data);
			}
			else if (ELECTRON)
			{
				const payload = typeof data === "string" ?
					data : 
					Buffer.from(data);
				
				if (!Electron.fs.existsSync(folderName))
					Electron.fs.mkdirSync(folderName);
				
				Electron.fs.writeFileSync(path, payload);
			}
		}
		
		/** */
		async function maybeCreateFolder(folderName: string)
		{
			if (ELECTRON)
			{
				const containingDir = Electron.path.resolve(folderName, "..");
				if (!Electron.fs.existsSync(containingDir))
					Electron.fs.mkdirSync(containingDir);
				
				if (!Electron.fs.existsSync(folderName))
					Electron.fs.mkdirSync(folderName);
			}
			else if (TAURI)
			{
				await Tauri.fs.createDir(folderName, { recursive: true });
			}
		}
		
		/** */
		async function pathJoin(...parts: string[])
		{
			if (TAURI)
				return await Tauri.path.join(...parts);
			
			if (ELECTRON)
				return Electron.path.join(...parts);
			
			return parts.join("/");
		}
	}
}
