
namespace App
{
	/**
	 * A class that wraps a <div> that performs a height adjustment
	 * animation when items are added and removed from it.
	 */
	export class HeightBox
	{
		constructor(...params: Hot.Param[])
		{
			this.head = Hot.div(
				"height-box",
				{
					transitionDuration: "0.3s",
					transitionProperty: "height",
				},
				...params,
			);
		}
		
		readonly head;
		
		private readonly elementStack: HTMLElement[] = [];
		
		/** */
		async replace(e: HTMLElement | null)
		{
			for (const visibleElement of this.elementStack)
				visibleElement.remove();
			
			this.elementStack.length = 0;
			
			if (e)
			{
				this.elementStack.push(e);
				this.head.append(e);
			}
			
			/*
			const s = this.head.style;
			const storedOverflow = s.overflow;
			const storedHeight = e.offsetHeight;
			const storedTransitionDuration = s.transitionDuration;
			
			const measureDiv = Hot.div(
				{
					position: "absolute",
					left: "-99999px",
					visibility: "hidden",
				},
				e);
			
			this.head.append(measureDiv);
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
			
			this.head.replaceChildren();
			
			
			s.overflow = storedOverflow;
			
			*/
		}
		
		/** */
		async push(e: HTMLElement)
		{
			this.elementStack.push(...Query.children(this.head));
			this.head.replaceChildren();
			this.head.append(e);
		}
		
		/** */
		async back()
		{
			this.head.replaceChildren();
			const next = this.elementStack.pop();
			if (next)
				this.head.append(next);
		}
	}
}
