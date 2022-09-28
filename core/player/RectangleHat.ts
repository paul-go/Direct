
namespace Player
{
	/** */
	export class RectangleHat
	{
		/** */
		static get defaultBackground()
		{
			if (!this._defaultBackground)
			{
				const canvas = Hot.canvas({ width: 32, height: 32 });
				const ctx = canvas.getContext("2d")!;
				const grad = ctx.createLinearGradient(0, 0, 32, 32);
				grad.addColorStop(0, "rgb(50, 50, 50)");
				grad.addColorStop(1, "rgb(0, 0, 0)");
				ctx.fillStyle = grad;
				ctx.fillRect(0, 0, 32, 32);
				
				this._defaultBackground = {
					backgroundImage: `url(${canvas.toDataURL()})`,
					backgroundSize: "100% 100%",
				};
			}
			return this._defaultBackground;
		}
		private static _defaultBackground: Hot.Style | null = null;
		
		readonly head;
		
		/** */
		constructor()
		{
			this.head = Hot.div(
				Hot.css("& > *", {
					pointerEvents: "none",
				}),
				RectangleHat.defaultBackground,
				{
					cursor: "pointer",
				},
				Hot.get(this)(
					Hot.on(window, "resize", () => this.deferUpdateImage())
				)
			);
		}
		
		/** */
		setHtml(element: HTMLElement)
		{
			this.html = element;
			return this.updateImage();
		}
		
		/** */
		private showHtml()
		{
			this.head.replaceChildren(this.html);
			this.head.style.removeProperty("background-image");
		}
		protected html: HTMLElement = Hot.div("null");
		
		/** */
		private showImage()
		{
			this.head.replaceChildren();
			this.head.style.backgroundImage = `url(${this.image})`;
		}
		protected image: string = "";
		
		/** */
		private deferUpdateImage()
		{
			clearTimeout(this.timeoutId);
			this.timeoutId = setTimeout(() => this.updateImage(), 100);
		}
		private timeoutId: any = 0;
		
		/** */
		private async updateImage()
		{
			if (this.image)
				BlobUri.revoke(this.image);
			
			const blob = await Player.rasterize(this.html);
			this.image = BlobUri.create(blob);
		}
		
		/** */
		setFidelity(fidelity: RectangleFidelity)
		{
			if (fidelity === "performance")
				this.showHtml();
			
			else if (fidelity === "precision")
				this.showImage();
			
			this.fidelity = fidelity;
		}
		protected fidelity?: RectangleFidelity;
	}
	
	export type RectangleFidelity = "performance" | "precision";
}
