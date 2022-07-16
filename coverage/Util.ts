
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
		media.blob = new Blob([buffer]);
		media.name = path.split("/").slice(-1)[0];
		media.type = Turf.MimeType.fromFileName(path);
		return media;
	}
	
	/** */
	export function display(controller: Controller.IController)
	{
		Query.find(CssClass.appRoot)[0].append(controller.root);
	}
}
