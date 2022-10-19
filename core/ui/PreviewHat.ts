
namespace App
{
	/** */
	export class PreviewHat
	{
		/** */
		constructor(post: PostRecord, blog: Blog)
		{
			this.head = Hot.div(
				UI.fixed(),
				UI.keyable,
				{
					zIndex: 1,
					borderRadius: UI.borderRadius.large,
					opacity: 0,
					transform: "scale(0.66)",
					transformOrigin: "50% 50%",
					transitionProperty: "transform, opacity, border-radius",
					transitionDuration: "0.5s",
				},
				
				UI.removeOnEscape(),
				
				this.previewRoot = Hot.div(
					"preview-root",
					UI.anchor(),
					UI.overflow("hidden", "overlay"),
					{
						borderRadius: "inherit",
					},
					When.connected(() => this.renderPreview(post, blog)),
				),
				
				Hot.div(
					UI.anchorTopRight(30, 30),
					UI.clickable,
					{
						backgroundColor: UI.gray(128, 0.33),
						borderRadius: "100%",
						transform: "rotate(45deg)",
						padding: "20px",
					},
					UI.backdropBlur(10),
					Icon.plus(),
					Hot.on(UI.clickEvt, () => UI.removeWithFade(this.head))
				),
				
				When.rendered(e =>
				{
					e.style.opacity = "1";
					e.style.borderRadius = "0";
					e.style.transform = "scale(1)";
				})
			);
			
			document.body.append(this.head);
			Hat.wear(this);
		}
		
		readonly head;
		private readonly previewRoot;
		private readonly classGenerator = new CssClassGenerator();
		
		/** */
		private async renderPreview(post: PostRecord, blog: Blog)
		{
			const postPreview = await Render.createPostPreview(post, blog);
			const scenery = new Player.Scenery().insert(...postPreview.scenes);
			const styleElement = Hot.style(new Text(postPreview.cssText));
			const futuresMap = new WeakMap<Player.Scenery, PostStreamRecordFuture>();
			const elements = [styleElement, scenery.head];
			
			if (blog.postStream.length > 2)
			{
				const omniview = new Player.Omniview<Player.Scenery>();
				
				omniview.handlePreviewRequest(async req =>
				{
					const postStream = blog.postStream;
					const futures = postStream.query(req.rangeStart, req.rangeEnd);
					return futures.map(future =>
					{
						const scenery = this.createScenery(future);
						futuresMap.set(scenery, future);
						return scenery;
					});
				});
				
				omniview.handleScenesRequest(async () =>
				{
					const renderer = new PostRenderer(post, blog);
					const renderResult = await renderer.render(true);
					return renderResult.scenes.slice(1);
				});
				
				elements.push(omniview.head);
			}
			
			this.previewRoot.replaceChildren(...elements);
		}
		
		/** */
		private createScenery(future: PostStreamRecordFuture)
		{
			const scenery = new Player.Scenery();
			
			future.getScene().then(async scene =>
			{
				const renderer = SceneRenderer.new(scene, true);
				renderer.classGenerator = this.classGenerator;
				const sceneElement = await renderer.render();
				scenery.insert(sceneElement);
			});
			
			return scenery;
		}
	}
}
