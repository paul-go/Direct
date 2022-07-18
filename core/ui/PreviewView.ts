
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
					backgroundColor: "black",
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
					() =>
					{
						Util.clear(this.previewRoot);
						const renderRoot = Turf.renderPatchPreview(patch, meta);
						this.previewRoot.append(renderRoot);
						new Player.Story(renderRoot);
					}
				),
				
				Htx.div(
					UI.anchorTopRight(30, 30),
					UI.clickable,
					{
						backgroundColor: UI.gray(128, 0.33),
						backdropFilter: "blur(10px)",
						borderRadius: "100%",
						transform: "rotate(45deg)",
						padding: "20px",
					},
					UI.plusButton(
					),
					Htx.on(UI.clickEvt, () =>
					{
						UI.removeWithFade(this.root);
					})
				),
				
				() =>
				{
					const s = this.root.style;
					s.opacity = "1";
					s.borderRadius = "0";
					s.transform = "scale(1)";
				}
			);
			
			document.body.append(this.root);
			Controller.set(this);
		}
		
		readonly root;
		private readonly previewRoot;
		
	}
}
