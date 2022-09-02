
namespace App
{
	/**
	 * A namespace of functions that handle exporting
	 * the database to .zip files.
	 */
	export namespace BlogFile
	{
		/**
		 * Generates a Uint8Array containing a .zip file
		 * from the specified database information structure.
		 */
		export async function create(blogObject: IBlogExport)
		{
			await App.Util.include("JSZip.js");
			
			// This function uses it's own JSON serialization rather than 
			// the typical JSON.stringify, so that we can have more control
			// over the formatting to make the file line-based and more easily 
			// human-readable.
			
			const aboutFileContent = JSON.stringify(
				blogObject, 
				(k, v) =>k === ("blobs" as keyof IBlogExport) ? undefined : v,
				"\t");
			
			const zip = new JSZip();
			zip.file(aboutFileName, aboutFileContent);
			
			if (blogObject.blobs)
			{
				for (const [name, blob] of blogObject.blobs)
				{
					const file = new File([blob], name, { type: blob.type });
					zip.file(name, file);
				}
			}
			
			const exportFileBytes = await zip.generateAsync({
				type: "uint8array",
				compression: "STORE",
			});
			
			return exportFileBytes;
		}
		
		/**
		 * Generates an I information structure from the specified
		 * Uint8Array, which is expected to contain a .zip file whose contents
		 * were exported from the .create() function.
		 */
		export async function parse(exportFileBytes: Uint8Array)
		{
			await App.Util.include("JSZip.js");
			
			const zip = await JSZip.loadAsync(exportFileBytes);
			const aboutFileRef = zip.file(aboutFileName);
			if (!aboutFileRef)
				return null;
			
			const aboutText = await aboutFileRef.async("string");
			const aboutFileJson = Util.tryParseJson<IBlogAbout>(aboutText);
			if (!aboutFileJson)
				return null;
			
			const blogObject: IBlogExport = {
				...aboutFileJson,
				blobs: [],
			};
			
			const contents = new Map<string, JSZip.JSZipObject>();
			
			zip.forEach((path, file) =>
			{
				if (file.name !== aboutFileName)
					contents.set(path, file);
			});
			
			for (const [path, file] of contents)
			{
				const buffer = await file.async("arraybuffer");
				const blob = new Blob([buffer], { type: MimeType.fromFileName(path) });
				blogObject.blobs.push([path, blob]);
			}
			
			return blogObject;
		}
		
		/** */
		export async function triggerDownload(fileName: string, bytes: Uint8Array)
		{
			const element = document.createElement("a");
			element.href = URL.createObjectURL(new Blob([bytes]));
			element.download = fileName;
			element.style.display = "none";
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);
		}
	}
	
	const aboutFileName = "about.json";
}
