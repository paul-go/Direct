
namespace App
{
	/** */
	export abstract class ListHat<TRectangle extends RectangleHat = RectangleHat>
	{
		/** */
		constructor()
		{
			this.head = Hot.div(
				"list-hat",
				this.omniview = new Player.Omniview<TRectangle>()
			);
		}
		
		readonly head;
		protected readonly omniview;
	}
}
