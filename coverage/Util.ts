
namespace Cover
{
	/** */
	export function readBlob(relativePath: string)
	{
		const path = Electron.path.join(process.cwd(), relativePath);
		const buffer =  Electron.fs.readFileSync(path);
		const type = Mime.fromPath(path);
		return new Blob([buffer], { type });
	}
	
	/** */
	export async function writeBlob(blob: Blob, ...pathParts: string[])
	{
		const arrayBuffer = await blob.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const fullPath = Electron.path.join(...pathParts);
		Electron.fs.writeFileSync(fullPath, buffer);
	}
	
	/** */
	export function readDirectory(...pathParts: string[])
	{
		const entries: string[] = [];
		const path = Electron.path.join(...pathParts);
		const contents = Electron.fs.readdirSync(path);
		
		for (const fileName of contents)
			if (!fileName.startsWith("."))
				entries.push(Electron.path.join(path, fileName));
		
		return entries;
	}
	
	/** */
	export function display(hat: Hat.IHat)
	{
		Query.find(CssClass.appContainer)?.append(hat.head);
	}
	
	if (typeof module !== "undefined")
		Object.assign(module.exports, { Cover });
}
