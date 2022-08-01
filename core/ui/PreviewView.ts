
namespace Turf
{
	/** */
	export class PreviewView
	{
		/** */
		constructor(patch: PatchRecord, meta: MetaRecord)
		{
			this.root = Htx.div(
				"preview-view",
				UI.fixed(),
				UI.keyable,
				{
					zIndex: "1",
					borderRadius: UI.borderRadius.large,
					opacity: "0",
					transform: "scale(0.66)",
					transformOrigin: "50% 50%",
					transitionProperty: "transform, opacity, border-radius",
					transitionDuration: "0.5s",
				},
				
				...UI.removeOnEscape(),
				
				this.previewRoot = Htx.div(
					"preview-root",
					UI.anchor(),
					{
						overflowX: "hidden",
						overflowY: "auto",
						borderRadius: "inherit",
					},
					When.connected(() =>
					{
						const renderRoot = Render.createPatchPreview(patch, meta);
						this.previewRoot.replaceChildren(renderRoot);
						new Player.Story(renderRoot);
					})
				),
				
				Htx.div(
					UI.anchorTopRight(30, 30),
					UI.clickable,
					{
						backgroundColor: UI.gray(128, 0.33),
						borderRadius: "100%",
						transform: "rotate(45deg)",
						padding: "20px",
					},
					UI.backdropBlur(10),
					UI.plusButton(),
					Htx.on(UI.clickEvt, () => UI.removeWithFade(this.root))
				),
				
				When.connected(e => setTimeout(() =>
				{
					e.style.opacity = "1";
					e.style.borderRadius = "0";
					e.style.transform = "scale(1)";
				}))
			);
			
			document.body.append(this.root);
			Controller.set(this);
		}
		
		readonly root;
		private readonly previewRoot;
		
	}
}
