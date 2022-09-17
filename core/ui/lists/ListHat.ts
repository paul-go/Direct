
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
				this.purview = new Player.Purview<TRectangle>()
			);
		}
		
		readonly head;
		protected readonly purview;
	}
}
