
namespace App
{
	/**
	 * (This class is probably on it's way out)
	 */
	export class ForegroundMixin
	{
		/** */
		constructor(readonly root: HTMLElement)
		{
			Htx.from(this.root)("foreground-view");
			Hat.wear(this);
		}
	}
}
