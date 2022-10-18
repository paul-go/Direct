
namespace Cover
{
	/** */
	export async function coverPostFromStart()
	{
		await App.createApp({ shell: false, clear: true });
	}
	
	/** */
	export async function coverPostHatEmpty()
	{
		const app = await App.createApp({ shell: true, clear: true });
		const postHat = new App.PostHat(app.blog.homePost);
		Cover.display(postHat);
	}
	
	/** */
	export async function coverPostHatExisting()
	{
		const app = await App.createApp({ shell: true });
		const postHat = new App.PostHat(app.blog.homePost);
		Cover.display(postHat);
	}
	
	/** */
	export async function coverPostHatWithProse()
	{
		const app = await App.createApp({ shell: true, clear: true });
		const postHat = new App.PostHat(app.blog.homePost);
		const sv = new App.ProseSceneHat();
		postHat.scenes.insert(sv);
		Cover.display(postHat);
	}
	
	/** */
	export async function coverPostHatWithCanvas()
	{
		const app = await App.createApp({ shell: true, clear: true });
		const postHat = new App.PostHat(app.blog.homePost);
		const sv = new App.CanvasSceneHat();
		postHat.scenes.insert(sv);
		Cover.display(postHat);
	}
	
	/** */
	export async function coverPostHatWithMultipleCanvas()
	{
		const app = await App.createApp({ shell: true, clear: true });
		const postHat = new App.PostHat(app.blog.homePost);
		const sceneHat1 = new App.CanvasSceneHat();
		const sceneHat2 = new App.CanvasSceneHat();
		postHat.scenes.insert(sceneHat1);
		postHat.scenes.insert(sceneHat2);
		Cover.display(postHat);
	}
	
	/** */
	export async function coverPostHatWithGallery()
	{
		const app = await App.createApp({ shell: true, clear: true });
		const postHat = new App.PostHat(app.blog.homePost);
		const sv = new App.GallerySceneHat();
		postHat.scenes.insert(sv);
		Cover.display(postHat);
	}
	
	/** */
	export async function coverDrag()
	{
		document.body.append(
			Hot.div(
				"parent",
				{
					...App.UI.anchorTopRight(20, 20),
					width: "200px",
					height: "200px",
					backgroundColor: "rgba(0, 0, 0, 0.3)",
				},
				
				Hot.on("dragenter", ev =>
				{
					ev.preventDefault();
				},
				{ capture: true }),
				
				Hot.on("dragleave", ev =>
				{
					ev.preventDefault();
				},
				{ capture: true }),
				
				Hot.div(
					"child",
					{
						width: "100px",
						height: "100px",
						backgroundColor: "rgba(0, 0, 0, 0.3)",
					}
				)
			)
		);
	}
}
