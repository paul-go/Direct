
namespace Cover
{
	const Fs = require("fs") as typeof import("fs");
	const Path = require("path") as typeof import("path");
	
	/** */
	export function readSampleBlob(sampleFileName: string)
	{
		const path = Path.join(__dirname, "../coverage/sample-media", sampleFileName);
		const buffer =  Fs.readFileSync(path);
		const type = Turf.MimeType.fromFileName(path);
		const fileLike = new Blob([buffer], { type }) as Turf.FileLike;
		fileLike.name = path.split("/").slice(-1)[0];
		return fileLike;
	}
}
