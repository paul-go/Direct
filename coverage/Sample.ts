
namespace Cover
{
	/** */
	export namespace Sample
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
			return Sample.createBlog();
		}
		
		/** */
		export function createPost(slug?: string)
		{
			const post = new App.PostRecord();
			const num = Date.now().toString().slice(-8);
			post.slug = slug ?? "slug-" + num;
			post.title = "Title " + num;
			post.description = "This is the description for post " + num + ".";
			const scene1 = createCanvasScene();
			const scene2 = createCanvasScene();
			const scene3 = createCanvasScene();
			post.scenes.push(scene1, scene2, scene3);
			return post;
		}
		
		/** */
		export function createCanvasScene()
		{
			const scene = new App.CanvasSceneRecord();
			scene.titles.push({
				text: "Lorem Ipsum " + lipsum(),
				weight: randomize(400, 500, 600, 700, 800, 900),
				hasColor: true,
				size: 5,
			});
			scene.contrast = 0.5;
			scene.backgrounds.push(createBackgroundImage());
			return scene;
		}
		
		/** */
		export function createContentImage()
		{
			return readMedia("image-content-1.png");
		}
		
		/** */
		export function createBackgroundImage()
		{
			const bg = new App.BackgroundRecord();
			bg.media = Sample.readImage();
			return bg;
		}
		
		/** */
		export function createBackgroundVideo()
		{
			const bg = new App.BackgroundRecord();
			bg.media = Sample.readVideo();
			return bg;
		}
		
		/** */
		export function randomize<T>(...values: T[]): T
		{
			return values[Math.floor(Math.random() * values.length)];
		}
		
		/** */
		export function lipsum()
		{
			return "Lorem Ipsum " + (++lipsumCount);
		}
		let lipsumCount = 0;
		
		/** */
		export function readImage(index?: number)
		{
			index ||= ((imageIdx++) % numImages) + 1;
			const fileName = "image-" + index + ".jpeg";
			return readMedia(fileName);
		}
		let imageIdx = 0;
		
		/** */
		export function readVideo(index?: number)
		{
			index ||= ((videoIdx++) % numVideos) + 1;
			const fileName = "video-" + index + ".mp4";
			return readMedia(fileName);
		}
		let videoIdx = 0;
		
		/** */
		function readMedia(sampleFileName: string)
		{
			const path = Electron.path.join(
				__dirname,
				"../coverage/+sample-media",
				sampleFileName);
			
			const buffer =  Electron.fs.readFileSync(path);
			const media = new App.MediaRecord();
			const type = App.MimeType.fromFileName(path);
			media.blob = new Blob([buffer], { type });
			media.name = path.split("/").slice(-1)[0];
			media.type = type;
			return media;
		}
		
		const numImages = 32;
		const numVideos = 3;
	}
}
