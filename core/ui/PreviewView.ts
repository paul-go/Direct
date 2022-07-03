
namespace Turf
{
	/** */
	export class PreviewView
	{
		/** */
		constructor()
		{
			this.root = Htx.div(
				UI.fixed(0),
				{
					overflowX: "hidden",
					overflowY: "auto",
				}
			);
			
			Controller.set(this);
		}
		
		readonly root;
		
		/** */
		render(patch: PatchRecord, meta: MetaRecord)
		{
			const renderer = new Renderer();
			const renderRoot = renderer.render(patch, meta);
			Util.clear(this.root);
			this.root.append(renderRoot);
			new Player.Story(renderRoot);
		}
	}
}
