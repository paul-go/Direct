
namespace App
{
	/** */
	interface IStoredDatabaseAbout
	{
		id: string;
		name: string;
		objects: object[];
	}
	
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
		export async function create(about: IDatabaseAbout)
		{
			await App.Util.include("JSZip.js");
			
			// This function uses it's own JSON serialization rather than 
			// the typical JSON.stringify, so that we can have more control
			// over the formatting to make the file line-based and more easily 
			// human-readable.
			
			const lines: string[] = ["{"];
			lines.push(`"id": "${about.id || ""}",`);
			lines.push(`"name": "${about.name || ""}",`);
			lines.push(`"objects": [`);
			
			if (about.objects)
			{
				for (let i = -1; ++i < about.objects.length;)
				{
					const string = JSON.stringify(about.objects[i]);
					lines.push(string + (i < about.objects.length - 1 ? "," : ""));
				}
			}
			
			lines.push("]}");
			const aboutFileContent = lines.join("\n");
			
			const zip = new JSZip();
			zip.file(aboutFileName, aboutFileContent);
			
			if (about.blobs)
			{
				for (const [name, blob] of about.blobs)
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
			const aboutFileJson = Util.tryParseJson<IStoredDatabaseAbout>(aboutText);
			if (!aboutFileJson)
				return null;
			
			const about: Required<IDatabaseAbout> = {
				name: "",
				id: "",
				objects: [],
				blobs: new Map(),
			};
			
			if (typeof aboutFileJson.name === "string")
				about.name = aboutFileJson.name;
			
			if (typeof aboutFileJson.id === "string")
				about.id = aboutFileJson.id;
			
			if (Array.isArray(aboutFileJson.objects))
				for (const object of aboutFileJson.objects)
					if (object && object.constructor === Object)
						about.objects.push(object as any);
			
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
				about.blobs.set(path, blob);
			}
			
			return about;
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
