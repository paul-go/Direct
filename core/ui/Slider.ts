
namespace App
{
	/** */
	export class Slider
	{
		/** */
		constructor(...params: Hot.Param[])
		{
			this.head = Hot.div(
				{
					height: (thumbSize + thumbPadding * 2) + "px",
					padding: thumbPadding + "px",
					boxShadow: 
						"inset 0 0 0 5px " + UI.white(0.15) +
						", 0 3px 15px " + UI.black(0.75),
					borderRadius: "1000px",
				},
				Hot.on("pointerdown", ev => this.startDrag(ev)),
				Hot.on("pointerup", ev => this.endDrag(ev)),
				Hot.on("pointercancel", ev => this.endDrag(ev)),
				Hot.on("pointermove", ev =>
				{
					this.handlePointerMove(ev);
				}),
				this.slideArea = Hot.div(
					"slide-area",
					UI.anchor(),
					{
						left: (thumbSize / 2 + thumbPadding) + "px",
						right: (thumbSize / 2 + thumbPadding) + "px",
					},
					Hot.css("&:before, &:after", {
						margin: "auto",
						fontWeight: 600,
						fontSize: "1.25em",
						opacity: 0.33,
						height: "fit-content",
					}),
					Hot.css(":before", {
						content: `attr(data-left-label)`,
						...UI.anchorLeft(),
					}),
					Hot.css(":after", {
						content: `attr(data-right-label)`,
						...UI.anchorRight(),
					}),
					this.thumb = Hot.div(
						"thumb",
						UI.clickable,
						UI.flexCenter,
						UI.backdropBlur(3),
						{
							position: "absolute",
							top: thumbPadding + "px",
							left: "50%",
							transform: "translateX(-50%)",
							width: thumbSize + "px",
							height: thumbSize + "px",
							borderRadius: "100%",
							boxShadow: "inset 0 0 0 4px white",
							color: "white",
							fontWeight: 900,
						}
					)
				),
				...params
			);
			
			setTimeout(() => this.updateThumb());
			Hat.wear(this);
		}
		
		readonly head;
		private readonly slideArea;
		private readonly thumb;
		
		private sliderRect: DOMRect | null = null;
		
		/** */
		private startDrag(ev: PointerEvent)
		{
			if (ev.buttons === 1)
			{
				this.head.setPointerCapture(ev.pointerId);
				this.sliderRect = this.slideArea.getBoundingClientRect();
				this.draggingChangedFn(true);
			}
		}
		
		/** */
		private endDrag(ev: PointerEvent)
		{
			this.head.releasePointerCapture(ev.pointerId);
			this.sliderRect = null;
			this.draggingChangedFn(false);
		}
		
		/** */
		setDraggingChangedFn(fn: (dragging: boolean) => void)
		{
			this.draggingChangedFn = fn;
		}
		private draggingChangedFn = (dragging: boolean) => {};
		
		/** */
		setLeftLabel(label: string)
		{
			this.slideArea.setAttribute("data-left-label", label);
		}
		
		/** */
		setRightLabel(label: string)
		{
			this.slideArea.setAttribute("data-right-label", label);
		}
		
		/** */
		get min()
		{
			return this._min;
		}
		set min(value: number)
		{
			this._min = value;
			this.updateThumb();
		}
		private _min = 0;	
		
		/** */
		get max()
		{
			return this._max;
		}
		set max(value: number)
		{
			this._max = value;
			this.updateThumb();
		}
		private _max = 100;
		
		/** */
		get place()
		{
			return this._place;
		}
		set place(value: number)
		{
			this._place = Math.max(this.min, Math.min(this.max, value));
			this.updateThumb();
		}
		private _place = 50;
		
		/** */
		get decimals()
		{
			return this._decimals;
		}
		set decimals(decimals: number)
		{
			this._decimals = Math.max(0, decimals);
			this.updateThumb();
		}
		private _decimals = 1;
		
		/**
		 * Indicates whether the Slider should display values
		 * via Math.abs(), so that negative values are actually
		 * displayed as positive.
		 */
		get abs()
		{
			return this._abs;
		}
		set abs(abs: boolean)
		{
			this._abs = abs;
			this.updateThumb();
		}
		private _abs = false;
		
		/** */
		get skipZero()
		{
			return this._skipZero;
		}
		set skipZero(skipZero: boolean)
		{
			this._skipZero = skipZero;
			this.updateThumb();
		}
		private _skipZero = false;
		
		/** */
		private handlePointerMove(ev: PointerEvent)
		{
			this.head.style.cursor = ev.buttons === 1 ? "pointer" : "default";
			
			if (this.sliderRect === null)
				return;
			
			const xPixel = Math.max(0, Math.min(this.sliderRect.width, ev.clientX - this.sliderRect.x));
			const xPercent = xPixel / this.sliderRect.width;
			const range = this.max - this.min;
			const place = this.fix((xPercent * range) + this.min);
			this._place = this.maybeSkipZero(place);
			
			this.updateThumb();
			this.progressChangeFn();
		}
		
		/** */
		private updateThumb()
		{
			const range = this.max - this.min;
			const cssLeftAmount = (this.place - this.min) / range * 100;
			this.thumb.style.left = cssLeftAmount + "%";
			let visibleNumber = this.fix(this.place);
			visibleNumber = this.maybeSkipZero(visibleNumber);
			
			if (this.abs)
				visibleNumber = Math.abs(visibleNumber);
			
			this.thumb.textContent = visibleNumber.toString();
		}
		
		/** */
		private fix(val: number)
		{
			return Number(val.toFixed(this.decimals));
		}
		
		/** */
		private maybeSkipZero(val: number)
		{
			return this.skipZero && val === 0 ?
				val + 1 / (10 ** this.decimals) :
				val;
		}
		
		/** */
		setPlaceChangeFn(fn: () => void)
		{
			this.progressChangeFn = fn;
		}
		private progressChangeFn = () => {};
	}
	
	const thumbSize = 60;
	const thumbPadding = 8;
}
