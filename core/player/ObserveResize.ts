
namespace Player
{
	/** */
	export function observeResize(
		e: HTMLElement,
		callback: (rect: DOMRectReadOnly) => void)
	{
		if (typeof ResizeObserver !== "undefined")
		{
			new ResizeObserver(rec =>
			{
				if (rec.length > 0)
					callback(rec[0].contentRect);
			
			}).observe(e);
		}
		else
		{
			// Implement
		}
	}
}
