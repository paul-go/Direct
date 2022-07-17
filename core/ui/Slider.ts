
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
				Htx.on("pointerdown", () =>
				{
					this.root.setPointerCapture(1);
				}),
				Htx.on("pointerup", () =>
				{
					this.root.releasePointerCapture(1);
				}),
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
					
			if (ev.buttons !== 1 || ev.movementX === 0)
				return;
			
			const pctLeft = parseFloat(this.thumb.style.left);
			const pctMovement = (ev.movementX / this.slideArea.offsetWidth || 0) * 100;
			const position = Math.max(0, Math.min(100, pctLeft + pctMovement));
			this._progress = (position / 100 || 0) * this.max;
			
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
