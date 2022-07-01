
namespace Turf
{
	/** */
	export class PreviewView
	{
		/** */
		constructor()
		{
			this.root = Htx.div(
				UI.fixed(20),
				{
					overflowX: "hidden",
					overflowY: "auto",
				}
			);
			
			Controller.set(this);
		}
		
		readonly root;
		
		/** */
		render(patch: PatchRecord)
		{
			
		}
	}
}
