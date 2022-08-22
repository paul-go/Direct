
namespace App
{
	/**
	 * (This class is probably on it's way out)
	 */
	export class ForegroundMixin
	{
		/** */
		constructor(readonly head: HTMLElement)
		{
			Hot.get(this.head)("foreground-hat");
			Hat.wear(this);
		}
	}
}
