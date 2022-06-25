
namespace Turf
{
	/** */
	export class ApexView
	{
		/** */
		constructor()
		{
			this.root = Htx.div(
				"apex-view",
				UI.flexColumn,
				{
					maxWidth: "1000px",
					margin: "auto",
					minHeight: "100%",
				}
			);
			
			Controller.set(this);
		}
		
		readonly root;
	}
}
