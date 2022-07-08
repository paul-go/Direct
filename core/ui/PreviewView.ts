
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
				UI.fixed(0),
				{
					tabIndex: 0,
					overflowX: "hidden",
					overflowY: "auto",
					zIndex: "1",
					backgroundColor: "black",
				},
				
				Htx.on("keydown", ev =>
				{
					if (ev.key === "Escape")
						this.root.remove();
					
				}, { capture: true }),
				
				() =>
				{
					Util.clear(this.root);
					const renderRoot = Turf.renderPatchPreview(patch, meta);
					this.root.append(renderRoot);
					new Player.Story(renderRoot);
				}
			);
			
			document.body.append(this.root);
			Controller.set(this);
		}
		
		readonly root;
	}
}
