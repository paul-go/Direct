
namespace App
{
	/** */
	export class ElementPickerHat
	{
		/** */
		constructor(container: HTMLElement)
		{
			this.root = Hot.div(
				"element-picker",
				UI.anchor(),
				{
					zIndex: "1"
				},
				Hot.on("pointerdown", ev =>
				{
					this.pickFromPoint(ev.clientX, ev.clientY);
				}),
				this.indicator = Hot.div(
					"indicator",
					{
						position: "absolute",
						outline: "3px dashed rgb(128, 128, 128)",
						boxShadow: "inset 0 0 0 3px black",
						transitionDuration: "0.15s",
						transitionProperty: "none",
					}
				)
			);
			
			this.toggle(false);
			container.append(this.root);
			this.resizeObserver = new ResizeObserver(() => this.updateIndicator());
			this.resizeObserver.observe(this.root);
			Hat.wear(this);
		}
		
		readonly root;
		private readonly indicator;
		private readonly registeredElements = new Map<HTMLElement, number>();
		private readonly resizeObserver;
		
		/** */
		toggle(visible: boolean)
		{
			Hot.get(this.root)({
				pointerEvents: visible ? "all" : "none",
				visibility: visible ? "visible" : "hidden",
			});
		}
		
		/** */
		registerElement(e: HTMLElement, outlineOffset = 0)
		{
			const empty = this.registeredElements.size === 0;
			this.registeredElements.set(e, outlineOffset);
			this.resizeObserver.observe(e);
			
			if (empty)
				this.pickElement(e);
		}
		
		/** */
		unregisterElements()
		{
			for (const e of this.registeredElements.keys())
				this.resizeObserver.unobserve(e);
			
			this.registeredElements.clear();
		}
		
		/** */
		private pickFromPoint(x: number, y: number)
		{
			const possibleElements = document.elementsFromPoint(x, y);
			const pickedElement = (() =>
			{
				for (const e of possibleElements)
					if (e instanceof HTMLElement)
						if (this.registeredElements.has(e))
							return e;
				
				return null;
			})();
			
			if (pickedElement)
			{
				this.pickElement(pickedElement);
			}
			else
			{
				this.toggle(false);
				this._cancelFn();	
			}
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
				
				const overlayRect = this.root.getBoundingClientRect();
				const targetRect = e.getBoundingClientRect();
				
				s.top = (targetRect.top - overlayRect.top - expand) + "px";
				s.left = (targetRect.left - overlayRect.left - expand) + "px";
				s.width = (targetRect.width + expand * 2) + "px";
				s.height = (targetRect.height + expand * 2) + "px";
				s.outlineOffset = (this.registeredElements.get(e) || 0) + "px";
				
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
		setCancelFn(fn: () => void)
		{
			this._cancelFn = fn;
		}
		private _cancelFn = () => {};
	}
	
	const expand = 6;
}
