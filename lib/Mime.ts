
namespace Mime
{
	/** */
	export enum Class
	{
		other = "",
		image = "image",
		video = "video",
		text = "text",
	}
	
	/** */
	export enum Type
	{
		none = "",
		
		gif = "image/gif",
		jpg = "image/jpeg",
		png = "image/png",
		svg = "image/svg+xml",
		webp = "image/webp",
		avif = "image/avif",
		
		// Videos
		mp4 = "video/mp4",
		webm = "video/webm",
		
		// Zip
		zip = "application/zip",
		
		// Text
		html = "text/html",
		css = "text/css",
		js = "text/javascript",
		txt = "text/plain",
	}
	
	const mimes: Map<string, string> = new Map(Object.entries(Type)
		.filter(([k, v]) => typeof v === "string") as [string, string][]);
	
	/**
	 * Returns an array containing all mime types, optionally filtered
	 * by the provided set of mime classes.
	 */
	export function each(...classFilters: Class[])
	{
		const out = [...mimes.values()];
		return classFilters.length ?
			out.filter(m => classFilters.includes(classOf(m))) :
			out;
	}
	
	/** */
	export function classOf(mimeType: string)
	{
		const [cls] = mimeType.split("/");
		switch (cls)
		{
			case Class.image: return Class.image;
			case Class.video: return Class.video;
		}
		
		return Class.other;
	}
	
	/**
	 * Returns the file extension typically associated with the specified
	 * mime type, without the leading "." character.
	 */
	export function extensionOf(mimeType: string)
	{
		for (const [ext, mime] of mimes)
			if (mime === mimeType)
				return ext.split("+")[0];
		
		return "";
	}
	
	/**
	 * Returns a Mime enum value from the specified string,
	 * or null if no such mime type exists.
	 */
	export function from(mimeString: string)
	{
		for (const mime of mimes.values())
			if (mime === mimeString)
				return mime as Type;
		
		return null;
	}
	
	/**
	 * Parses the specified file name and returns the mime
	 * type that is likely associated with it, based on the file extension.
	 */
	export function fromPath(path: string)
	{
		let ext = (path.split(".").slice(-1)[0] || "").toLowerCase();
		
		if (ext === "jpeg")
			ext = "jpg";
		
		return (mimes.get(ext) || Type.none) as Type;
	}
}
