
namespace Cover
{
	/** */
	export async function coverPostViewEmpty()
	{
		const app = await App.createApp({ shell: true, clear: true });
		const pv = new App.PostView(app.homePost);
		Cover.display(pv);
	}
	
	/** */
	export async function coverPostViewExisting()
	{
		const app = await App.createApp({ shell: true });
		const pv = new App.PostView(app.homePost);
		Cover.display(pv);
	}
	
	/** */
	export async function coverPostViewWithProse()
	{
		const app = await App.createApp({ shell: true, clear: true });
		const pv = new App.PostView(app.homePost);
		const sv = new App.ProseSceneView();
		pv.scenes.insert(sv);
		Cover.display(pv);
	}
	
	/** */
	export async function coverPostViewWithCanvas()
	{
		const app = await App.createApp({ shell: true, clear: true });
		const pv = new App.PostView(app.homePost);
		const sv = new App.CanvasSceneView();
		pv.scenes.insert(sv);
		Cover.display(pv);
	}
	
	/** */
	export async function coverPostViewWithMultipleCanvas()
	{
		const app = await App.createApp({ shell: true, clear: true });
		const pv = new App.PostView(app.homePost);
		const sv1 = new App.CanvasSceneView();
		const sv2 = new App.CanvasSceneView();
		pv.scenes.insert(sv1);
		pv.scenes.insert(sv2);
		Cover.display(pv);
	}
	
	/** */
	export async function coverPostViewWithGallery()
	{
		const app = await App.createApp({ shell: true, clear: true });
		const pv = new App.PostView(app.homePost);
		const sv = new App.GallerySceneView();
		pv.scenes.insert(sv);
		Cover.display(pv);
	}
	
	/** */
	export async function coverDrag()
	{
		document.body.append(
			Htx.div(
				"parent",
				{
					...App.UI.anchorTopRight(20, 20),
					width: "200px",
					height: "200px",
					backgroundColor: "rgba(0, 0, 0, 0.3)",
				},
				
				Htx.on("dragenter", ev =>
				{
					ev.preventDefault();
				},
				{ capture: true }),
				
				Htx.on("dragleave", ev =>
				{
					ev.preventDefault();
				},
				{ capture: true }),
				
				Htx.div(
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
