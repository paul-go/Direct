
namespace App
{
	/** */
	export abstract class ListHat<TRectangle extends Player.RectangleHat = Player.RectangleHat>
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
