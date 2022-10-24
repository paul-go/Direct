
namespace App
{
	/** */
	export class RectangleHat
	{
		readonly head;
		
		/** */
		constructor()
		{
			this.head = Hot.div(
				Hot.css("& > *", {
					pointerEvents: "none",
				}),
				Player.Omniview.defaultBackground,
			);
		}
		
		/** */
		setHtml(element: HTMLElement)
		{
			this.head.replaceChildren(element);
		}
	}
	
	export type RectangleFidelity = "performance" | "precision";
}
