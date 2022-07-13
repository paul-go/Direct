
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
				UI.fixed(20),
				UI.keyable,
				{
					zIndex: "1",
					backgroundColor: "black",
					boxShadow: "0 0 0 100px " + UI.gray(128, 0.33),
					borderRadius: UI.borderRadius.large
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
						this.root.focus();
						Util.clear(this.previewRoot);
						const renderRoot = Turf.renderPatchPreview(patch, meta);
						this.previewRoot.append(renderRoot);
						new Player.Story(renderRoot);
					}
				),
				
				UI.checkmark(
					UI.clickable,
					{
						position: "absolute",
						bottom: "-17px",
						left: "0",
						right: "0",
						margin: "auto",
						backgroundColor: UI.gray(128, 0.33),
						backdropFilter: "blur(10px)",
						borderRadius: "100%"
					},
					Htx.on(UI.click, () =>
					{
						this.root.remove();
					})
				)
			);
			
			document.body.append(this.root);
			Controller.set(this);
		}
		
		readonly root;
		private readonly previewRoot;
		
	}
}
