
namespace Turf
{
	/** */
	export enum MimeType
	{
		gif = "image/gif",
		jpg = "image/jpeg",
		png = "image/png",
		svg = "image/svg+xml",
		webp = "image/webp",
		avif = "image/avif",
		
		// Videos
		mp4 = "video/mp4",
		webm = "video/av1",
		
		// Zip
		zip = "application/zip",
		
		// Text
		html = "text/html",
		css = "text/css",
		js = "text/javascript"
	}
	
	/** */
	export const enum MimeClass
	{
		other = "",
		image = "image",
		video = "video",
	}
	
	/** */
	export namespace MimeType
	{
		const mimes: Map<string, string> = new Map(Object.entries(MimeType)
			.filter(([k, v]) => typeof v === "string") as [string, string][]);
		
		/** */
		export function getExtension(mimeType: MimeType)
		{
			for (const [ext, mime] of mimes)
				if (mime === mimeType)
					return ext;
			
			return "";
		}
		
		/** */
		export function getClass(mimeType: string)
		{
			const [cls] = mimeType.split("/");
			switch (cls)
			{
				case MimeClass.image: return MimeClass.image;
				case MimeClass.video: return MimeClass.video;
			}
			
			return MimeClass.other;
		}
	}
}
