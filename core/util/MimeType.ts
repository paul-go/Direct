
namespace App
{
	/** */
	export enum MimeType
	{
		unknown = "",
		
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
		js = "text/javascript",
		txt = "text/plain",
	}
	
	/** */
	export const enum MimeClass
	{
		other = "",
		image = "image",
		video = "video",
		text = "text",
	}
	
	/** */
	export namespace MimeType
	{
		const mimes: Map<string, string> = new Map(Object.entries(MimeType)
			.filter(([k, v]) => typeof v === "string") as [string, string][]);
		
		/** */
		export function from(mimeString: string)
		{
			for (const mime of mimes.values())
				if (mime === mimeString)
					return mime as MimeType;
			
			return null;
		}
		
		/** */
		export function getExtension(mimeType: string)
		{
			for (const [ext, mime] of mimes)
				if (mime === mimeType)
					return ext.split("+")[0];
			
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
		
		/** */
		export function ofClass(...classes: MimeClass[])
		{
			return [...mimes.values()].filter(m => classes.includes(getClass(m)));
		}
		
		/**
		 * Parses the specified file name and returns the mime
		 * type that is likely associated with it, based on the file extension.
		 */
		export function fromFileName(fileName: string)
		{
			let ext = (fileName.split(".").slice(-1)[0] || "").toLowerCase();
			
			if (ext === "jpeg")
				ext = "jpg";
			
			return (mimes.get(ext) || "") as MimeType;
		}
	}
}
