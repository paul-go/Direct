
namespace Player
{
	/**
	 * A class that is a specialization of the Purview, but where all
	 * the preview items are RectangleHat objects. Purviews of
	 * this type deal with changing between different Rectangle
	 * fidelity settings automatically.
	 */
	export class RectanglePurview extends Purview<RectangleHat>
	{
		/** */
		constructor()
		{
			super();
			
			this.enterReviewFn(clicked =>
			{
				clicked.setFidelity("precision");
			});
			
			this.exitReviewFn(() =>
			{
				this.currentPreview?.setFidelity("performance");
			});
		}
	}
}
