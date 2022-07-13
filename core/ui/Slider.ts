
namespace Turf
{
	/** */
	export class Slider
	{
		/** */
		constructor()
		{
			this.root = Htx.div(
				{
					height: (thumbSize + thumbPadding * 2) + "px",
					padding: thumbPadding + "px",
					outline: "5px solid " + UI.white(0.15),
					borderRadius: "1000px",
				},
				Htx.on("pointerdown", ev =>
				{
					this.root.setPointerCapture(1);
				}),
				Htx.on("pointerup", ev =>
				{
					this.root.releasePointerCapture(1);
				}),
				Htx.on("pointermove", ev =>
				{
					if (ev.buttons === 1)
						if (ev.movementX !== 0)
							this.moveThumb(ev.movementX);
					
					this.root.style.cursor = ev.buttons === 1 ? "pointer" : "default";
				}),
				this.slideArea = Htx.div(
					"slide-area",
					UI.anchor(),
					{
						left: (thumbSize / 2 + thumbPadding) + "px",
						right: (thumbSize / 2 + thumbPadding) + "px",
					},
					this.thumb = Htx.div(
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
							outline: "4px solid white",
							color: "white",
							fontWeight: "900",
						}
					)
				)
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
		private moveThumb(deltaX: number)
		{
			const pctLeft = parseFloat(this.thumb.style.left);
			const pctMovement = (deltaX / this.slideArea.offsetWidth || 0) * 100;
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
		
		progressChangeFn = () => {};
	}
	
	const thumbSize = 60;
	const thumbPadding = 8;
}
