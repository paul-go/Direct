
namespace App
{
	/**
	 * (This class is probably on it's way out)
	 */
	export class ForegroundHat
	{
		/** */
		constructor(readonly head: HTMLElement)
		{
			Hat.wear(this);
		}
	}
}
