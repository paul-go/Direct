
namespace Player
{
	/**
	 * Observes the resizing of the particular element, and invokes
	 * the specified callback when the element is resized.
	 */
	export function observeResize(
		e: HTMLElement,
		callback: (width: number, height: number) => void)
	{
		if (typeof ResizeObserver !== "undefined")
		{
			new ResizeObserver(rec =>
			{
				if (rec.length === 0)
					return;
				
				const entry = rec[0];
				if (entry.borderBoxSize?.length > 0)
				{
					const size = entry.borderBoxSize[0];
					callback(size.inlineSize, size.blockSize);
				}
				else
				{
					const width = e.offsetWidth;
					const height = e.offsetHeight;
					callback(width, height);
				}
			}).observe(e, { box: "border-box" });
		}
		else
		{
			Hot.get(e)(
				Hot.on(window, "resize", () =>
				{
					window.requestAnimationFrame(() =>
					{
						const width = e.offsetWidth;
						const height = e.offsetHeight;
						callback(width, height);
					});
				})
			);
		}
	}
}
