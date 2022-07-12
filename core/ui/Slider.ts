
namespace Turf
{
	/** */
	export class Slider
	{
		/** */
		constructor(defaultPosition = 50)
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
							this.updateThumb(ev.movementX);
				}),
				Htx.div(
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
			
			this._position = defaultPosition;
			setTimeout(() => this.updateThumb(0));
			Controller.set(this);
		}
		
		readonly root;
		private readonly thumb;
		
		/** */
		get position()
		{
			return this._position;
		}
		private _position: number;
		
		/** */
		private updateThumb(deltaX: number)
		{
			const pctLeft = parseFloat(this.thumb.style.left);
			const pctMovement = (deltaX / this.root.offsetWidth) * 100;
			const pctUpdate = pctMovement + pctLeft;
			this._position = Math.max(0, Math.min(100, pctUpdate));
			this.thumb.style.left = this._position + "%";
			this.thumb.textContent = (Math.round(this._position * 10) / 10).toString();
			this.positionChangeFn();
		}
		
		positionChangeFn = () => {};
	}
	
	const thumbSize = 60;
	const thumbPadding = 8;
}
