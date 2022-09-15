
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
					{
						overflowX: "hidden",
						overflowY: "auto",
						borderRadius: "inherit",
					},
					When.connected(async () =>
					{
						const postPreview = await Render.createPostPreview(post, blog);
						const styleElement = Hot.style(new Text(postPreview.cssText));
						this.previewRoot.replaceChildren(
							postPreview.storyElement,
							styleElement);
					})
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
	}
}
