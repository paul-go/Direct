
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
		const media = new Turf.MediaRecord();
		const type = Turf.MimeType.fromFileName(path);
		media.blob = new Blob([buffer], { type });
		media.name = path.split("/").slice(-1)[0];
		media.type = type;
		return media;
	}
	
	/** */
	export function display(controller: Controller.IController)
	{
		Query.find(CssClass.appRoot)[0].append(controller.root);
	}
	
	if (typeof module !== "undefined")
		Object.assign(module.exports, { Cover });
}
