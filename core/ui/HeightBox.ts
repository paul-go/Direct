
namespace Turf
{
	/**
	 * A class that wraps a <div> that performs a height adjustment
	 * animation when items are added and removed from it.
	 */
	export class HeightBox
	{
		constructor(...params: Htx.Param[])
		{
			this.root = Htx.div(
				"height-box",
				{
					transitionDuration: "0.3s",
					transitionProperty: "height",
				},
				...params,
			);
		}
		
		readonly root;
		
		private currentItem: HTMLElement | null = null;
		
		/** */
		async setItem(e: HTMLElement)
		{
			this.currentItem?.remove();
			this.currentItem = e;
			this.root.append(e);
			
			/*
			const s = this.root.style;
			const storedOverflow = s.overflow;
			const storedHeight = e.offsetHeight;
			const storedTransitionDuration = s.transitionDuration;
			
			const measureDiv = Htx.div(
				{
					position: "absolute",
					left: "-99999px",
					visibility: "hidden",
				},
				e);
			
			this.root.append(measureDiv);
			await UI.wait();
			const height = measureDiv.offsetHeight;
			
			measureDiv.remove();
			
			// Disable any transition
			s.transitionDuration = "0";
			await UI.wait();
			
			// Set an explicit height
			s.height = height + "px";
			s.overflow = "hidden";
			await UI.wait();
			
			// Set the new height
			
			Util.clear(this.root);
			
			
			s.overflow = storedOverflow;
			
			*/
		}
	}
}
