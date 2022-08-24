
namespace App
{
	/** */
	export class ElementPickerHat
	{
		/** */
		constructor(container: HTMLElement)
		{
			this.head = Hot.div(
				UI.anchor(),
				{
					zIndex: 1
				},
				Hot.on("pointerdown", ev =>
				{
					this.pickFromPoint(ev.clientX, ev.clientY);
				}),
				this.indicator = Hot.div(
					"indicator",
					{
						position: "absolute",
						transitionDuration: "0.15s",
						transitionProperty: "none",
					},
					Hot.css(":before", {
						content: '""',
						...UI.anchor(),
						border: "1px dashed rgba(0, 0, 0, 0.75)",
						borderRadius: UI.borderRadius.default
					}),
					Hot.css(":after", {
						content: '""',
						...UI.anchor(-1),
						border: "1px dashed rgba(255, 255, 255, 0.75)",
						borderRadius: UI.borderRadius.default
					}),
				)
			);
			
			this.toggle(false);
			container.append(this.head);
			this.resizeObserver = new ResizeObserver(() => this.updateIndicator());
			this.resizeObserver.observe(this.head);
			Hat.wear(this);
		}
		
		readonly head;
		readonly indicator;
		private readonly registeredElements = new Map<HTMLElement, number>();
		private readonly resizeObserver;
		
		/** */
		get pickedElement()
		{
			return this._pickedElement;
		}
		set pickedElement(e: HTMLElement | null)
		{
			this._pickedElement = e;
			this.updateIndicator("transition").then(() =>
			{
				this._pickChangedFn();
			});
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
		
		/** */
		toggle(visible: boolean)
		{
			Hot.get(this.head)({
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
			
			When.disconnected(e => setTimeout(() =>
			{
				if (!e.isConnected)
					this.unregisterElement(e);
			},
			100));
			
			if (empty)
				this.pickedElement = e;
		}
		
		/** */
		unregisterElement(e: HTMLElement)
		{
			if (this.pickedElement === e)
				this.pickedElement = null;
			
			this.registeredElements.delete(e);
			this.resizeObserver.unobserve(e);
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
				this.pickedElement = pickedElement;
			}
			else
			{
				this.toggle(false);
				this._cancelFn();	
			}
		}
		
		/** */
		async updateIndicator(transition?: "transition")
		{
			const e = this._pickedElement;
			if (e)
			{
				const s = this.indicator.style;
				s.removeProperty("display");
				
				if (transition)
				{
					s.transitionProperty = "top, left, width, height";
					await UI.wait();
				}
				
				const overlayRect = this.head.getBoundingClientRect();
				const targetRect = e.getBoundingClientRect();
				const expand = baseExpand + (this.registeredElements.get(e) || 0);
				
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
			else this.indicator.style.display = "none";
		}
	}
	
	const baseExpand = 6;
}
