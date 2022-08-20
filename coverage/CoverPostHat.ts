
namespace Cover
{
	/** */
	export async function coverPostHatEmpty()
	{
		const app = await App.createApp({ shell: true, clear: true });
		const pv = new App.PostHat(app.homePost);
		Cover.display(pv);
	}
	
	/** */
	export async function coverPostHatExisting()
	{
		const app = await App.createApp({ shell: true });
		const pv = new App.PostHat(app.homePost);
		Cover.display(pv);
	}
	
	/** */
	export async function coverPostHatWithProse()
	{
		const app = await App.createApp({ shell: true, clear: true });
		const pv = new App.PostHat(app.homePost);
		const sv = new App.ProseSceneHat();
		pv.scenes.insert(sv);
		Cover.display(pv);
	}
	
	/** */
	export async function coverPostHatWithCanvas()
	{
		const app = await App.createApp({ shell: true, clear: true });
		const pv = new App.PostHat(app.homePost);
		const sv = new App.CanvasSceneHat();
		pv.scenes.insert(sv);
		Cover.display(pv);
	}
	
	/** */
	export async function coverPostHatWithMultipleCanvas()
	{
		const app = await App.createApp({ shell: true, clear: true });
		const pv = new App.PostHat(app.homePost);
		const sv1 = new App.CanvasSceneHat();
		const sv2 = new App.CanvasSceneHat();
		pv.scenes.insert(sv1);
		pv.scenes.insert(sv2);
		Cover.display(pv);
	}
	
	/** */
	export async function coverPostHatWithGallery()
	{
		const app = await App.createApp({ shell: true, clear: true });
		const pv = new App.PostHat(app.homePost);
		const sv = new App.GallerySceneHat();
		pv.scenes.insert(sv);
		Cover.display(pv);
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
