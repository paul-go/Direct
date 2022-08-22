
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
	export function display(hat: Hat.IHat)
	{
		Query.find(CssClass.appContainer)?.append(hat.head);
	}
	
	if (typeof module !== "undefined")
		Object.assign(module.exports, { Cover });
}
