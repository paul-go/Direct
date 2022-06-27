
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
		render(patchData: PatchData)
		{
			
		}
	}
}

/*

How preview view works:

It has to accept JSON data (which is generated from the patch view) as it's input
Then it renders the HTML element hierarchy
If you click on a link, this link needs to have information in it on how to get the other JSON data out of loki so that this other page can be re-rendered.

I don't know right now if the HTML emitter needs to take the JSON as the input, and needs to generate HTML text. It's hard to say right now if there is a shared relationship between the preview renderer and the HTML string emitter. For now, maybe these should be duplicated, because trying to code-share might just add more complexity than it solves.

*/
