
namespace Turf
{
	/** */
	export class ElementPicker
	{
		/** */
		constructor(container: HTMLElement)
		{
			this.overlay = Htx.div(
				UI.anchor(),
				{
					backgroundColor: UI.black(0.2),
					zIndex: "9"
				},
				Htx.on("pointerdown", ev =>
				{
					this.pickFromPoint(ev.clientX, ev.clientY);
				}),
				this.indicator = Htx.div(
					"indicator",
					{
						position: "absolute",
						border: "3px solid white",
						borderRadius: UI.borderRadius.default,
						transitionDuration: "0.15s",
						transitionProperty: "none",
					}
				)
			);
			
			container.append(this.overlay);
			
			this.resizeObserver = new ResizeObserver(() =>
			{
				this.updateIndicator();
			});
			
			this.resizeObserver.observe(this.overlay);
		}
		
		private readonly overlay;
		private readonly indicator;
		private readonly registeredElements: HTMLElement[] = [];
		private readonly resizeObserver;
		
		/** */
		registerElement(e: HTMLElement)
		{
			const empty = this.registeredElements.length === 0;
			this.registeredElements.push(e);
			this.resizeObserver.observe(e);
			
			if (empty)
				this.pickElement(e);
		}
		
		/** */
		private pickFromPoint(x: number, y: number)
		{
			const possibleElements = document.elementsFromPoint(x, y);
			const pickedElement = (() =>
			{
				for (const e of possibleElements)
					if (e instanceof HTMLElement)
						if (this.registeredElements.includes(e))
							return e;
				
				return null;
			})();
			
			if (!pickedElement)
				return;
			
			this.pickElement(pickedElement);
		}
		
		/** */
		private async pickElement(e: HTMLElement)
		{
			this._pickedElement = e;
			await this.updateIndicator("transition");
			this.pickChangedFn();
		}
		
		/** */
		private async updateIndicator(transition?: "transition")
		{
			const e = this._pickedElement;
			if (e)
			{
				const s = this.indicator.style;
				
				if (transition)
				{
					s.transitionProperty = "top, left, width, height";
					await UI.wait();
				}
				
				s.top = e.offsetTop + "px";
				s.left = e.offsetLeft + "px";
				s.width = e.offsetWidth + "px";
				s.height = e.offsetHeight + "px";
				
				if (transition)
				{
					await UI.waitTransitionEnd(this.indicator);
					this.indicator.style.transitionProperty = "none";
				}
			}
		}
		
		/** */
		get pickedElement()
		{
			return this._pickedElement;
		}
		private _pickedElement: HTMLElement | null = null;
		
		/** */
		pickChangedFn = () => {};
		
		/** */
		async remove()
		{
			const s = this.overlay.style;
			s.opacity = "1";
			s.transitionDuration = "0.2s";
			s.transitionProperty = "opacity";
			await UI.wait();
			s.opacity = "0";
			await UI.waitTransitionEnd(this.overlay);
			this.overlay.remove();
		}
	}
}
