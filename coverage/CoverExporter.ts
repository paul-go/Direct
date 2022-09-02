
namespace Cover
{
	/** */
	export async function coverExporter()
	{
		App.Css.append();
		
		const [blog] = await Cover.createBlog();
		
		const post = new App.PostRecord();
		post.slug = "slug";
		const scene = new App.CanvasSceneRecord();
		scene.titles.push({ text: "Title", weight: 700, size: 10, hasColor: false });
		
		const background = new App.BackgroundRecord();
		background.media = readMedia("image-1.jpg");
		scene.backgrounds.push(background);
		
		post.scenes.push(scene);
		
		const folder = getExportsFolder();
		const publisher = new App.LocalPublisher(post, blog);
		publisher.folder = folder;
		await publisher.publish();
		
		console.log("Done");
	}
}
