
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
						boxShadow: "inset 0 0 0 3px black",
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
			
			if (pickedElement)
				this.pickElement(pickedElement);
			else
				this.innerRemove();
		}
		
		/** */
		private async pickElement(e: HTMLElement)
		{
			this._pickedElement = e;
			await this.updateIndicator("transition");
			this._pickChangedFn();
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
				
				const overlayRect = this.overlay.getBoundingClientRect();
				const targetRect = e.getBoundingClientRect();
				
				s.top = (targetRect.top - overlayRect.top - expand) + "px";
				s.left = (targetRect.left - overlayRect.left - expand) + "px";
				s.width = (targetRect.width + expand * 2) + "px";
				s.height = (targetRect.height + expand * 2) + "px";
				
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
		setPickChangedFn(fn: () => void)
		{
			this._pickChangedFn = fn;
		}
		private _pickChangedFn = () => {};
		
		/** */
		setRemovedFn(fn: () => void)
		{
			this._removedFn = fn;
		}
		private _removedFn = () => {};
		
		/** */
		remove()
		{
			return UI.removeWithFade(this.overlay);
		}
		
		/** */
		private async innerRemove()
		{
			await this.remove();
			this._removedFn();
		}
	}
	
	const expand = 6;
}
