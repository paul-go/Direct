
namespace Cover
{
	/** */
	export async function createBlog()
	{
		const friendlyName = Moduless.getRunningFunctionName();
		const blog = await App.Blog.new({ friendlyName });
		return [blog, friendlyName] as [App.Blog, string];
	}
	
	/** */
	export async function createBlogFromScratch()
	{
		await App.Store.clear();
		return Cover.createBlog();
	}
	
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
