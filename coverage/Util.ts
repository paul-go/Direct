
namespace Cover
{
	const Fs = require("fs") as typeof import("fs");
	const Path = require("path") as typeof import("path");
	
	/** */
	export function readMedia(sampleFileName: string)
	{
		const path = Path.join(__dirname, "../coverage/sample-media", sampleFileName);
		const buffer =  Fs.readFileSync(path);
		const media = new Turf.MediaRecord();
		media.blob = new Blob([buffer]);
		media.name = path.split("/").slice(-1)[0];
		media.type = Turf.MimeType.fromFileName(path);
		return media;
	}
}
