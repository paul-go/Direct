
namespace Turf
{
	/** */
	export class Slider
	{
		/** */
		constructor(...params: Htx.Param[])
		{
			this.root = Htx.div(
				{
					height: (thumbSize + thumbPadding * 2) + "px",
					padding: thumbPadding + "px",
					boxShadow: "inset 0 0 0 5px " + UI.white(0.15),
					borderRadius: "1000px",
				},
				Htx.on("pointerdown", ev => this.startDrag(ev)),
				Htx.on("pointerup", ev => this.endDrag(ev)),
				Htx.on("pointercancel", ev => this.endDrag(ev)),
				Htx.on("pointermove", ev =>
				{
					this.handlePointerMove(ev);
				}),
				this.slideArea = Htx.div(
					"slide-area",
					UI.anchor(),
					{
						left: (thumbSize / 2 + thumbPadding) + "px",
						right: (thumbSize / 2 + thumbPadding) + "px",
					},
					this.thumb = Htx.div(
						"thumb",
						UI.clickable,
						UI.flexCenter,
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
							fontWeight: "900",
						}
					)
				),
				...params
			);
			
			setTimeout(() => this.updateThumb());
			Controller.set(this);
		}
		
		readonly root;
		private readonly slideArea;
		private readonly thumb;
		
		private sliderRect: DOMRect | null = null;
		
		/** */
		private startDrag(ev: PointerEvent)
		{
			if (ev.buttons === 1)
			{
				this.root.setPointerCapture(ev.pointerId);
				this.sliderRect = this.slideArea.getBoundingClientRect();
			}
		}
		
		/** */
		private endDrag(ev: PointerEvent)
		{
			this.root.releasePointerCapture(ev.pointerId);
			this.sliderRect = null;
		}
		
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
		get progress()
		{
			return this._progress;
		}
		set progress(value: number)
		{
			this._progress = Math.max(0, Math.min(this.max, value));
			this.updateThumb();
		}
		private _progress = 50;
		
		/** */
		private handlePointerMove(ev: PointerEvent)
		{
			this.root.style.cursor = ev.buttons === 1 ? "pointer" : "default";
			
			if (this.sliderRect === null)
				return;
			
			const xPixel = Math.max(0, Math.min(this.sliderRect.width, ev.clientX - this.sliderRect.x));
			const xPercent = xPixel / this.sliderRect.width;
			this._progress = xPercent * this.max;
			
			this.updateThumb();
			this.progressChangeFn();
		}
		
		/** */
		private updateThumb()
		{
			const amount = (this._progress / this._max) * 100;
			this.thumb.style.left = amount + "%";
			this.thumb.textContent = (Math.round(this._progress * 10) / 10).toString();
		}
		
		/** */
		setProgressChangeFn(fn: () => void)
		{
			this.progressChangeFn = fn;
		}
		private progressChangeFn = () => {};
	}
	
	const thumbSize = 60;
	const thumbPadding = 8;
}
