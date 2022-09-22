
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
			);
		}
		
		/** */
		setHtml(html: string | HTMLElement)
		{
			if (typeof html === "string")
			{
				this.head.replaceChildren();
				this.head.innerHTML = html;
			}
			else
			{
				this.head.replaceChildren(html);
			}
			
			this.head.style.removeProperty("background-image");
			this.html = html;
		}
		protected html: string | HTMLElement = "";
		
		/** */
		setImage(image: string | Blob)
		{
			const url = typeof image === "string" ? 
				image : 
				URL.createObjectURL(image);
			
			this.head.replaceChildren();
			this.head.style.backgroundImage = `url(${url})`;
			this.image = image;
		}
		protected image: string | Blob = "";
		
		/** */
		setFidelity(fidelity: RectangleFidelity)
		{
			if (fidelity === "performance")
				this.setHtml(this.html);
			
			else if (fidelity === "precision")
				this.setImage(this.image);
			
			this.fidelity = fidelity;
		}
		protected fidelity?: RectangleFidelity;
	}
	
	export type RectangleFidelity = "performance" | "precision";
}
