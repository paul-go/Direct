
namespace Cover
{
	/** */
	export function readMedia(sampleFileName: string)
	{
		const path = Electron.path.join(
			__dirname,
			"../coverage/sample-media",
			sampleFileName);
		
		const buffer =  Electron.fs.readFileSync(path);
		const media = new App.MediaRecord();
		const type = App.MimeType.fromFileName(path);
		media.blob = new Blob([buffer], { type });
		media.name = path.split("/").slice(-1)[0];
		media.type = type;
		return media;
	}
	
	/** */
	export function display(cage: Cage.ICage)
	{
		Query.find(CssClass.appContainer)?.append(cage.root);
	}
	
	if (typeof module !== "undefined")
		Object.assign(module.exports, { Cover });
}
