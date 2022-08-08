
namespace Cover
{
	/** */
	export async function coverExporter()
	{
		App.appendCss();
		const meta = new App.MetaRecord();
		const post = new App.PostRecord();
		post.slug = "slug";
		const scene = new App.AttentionSceneRecord();
		scene.titles.push({ text: "Title", weight: 700, size: 10 });
		
		const background = new App.BackgroundRecord();
		background.media = readMedia("image-1.jpg");
		scene.backgrounds.push(background);
		
		post.scenes.push(scene);
		
		const folder = getExportsFolder();
		const publisher = new App.LocalPublisher(post, meta);
		publisher.folder = folder;
		await publisher.publish();
		
		console.log("Done");
	}
}
