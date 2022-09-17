
namespace Player
{
	export class RectangleHat
	{
		/** */
		constructor()
		{
			this.head = Hot.div(
				Hot.css("& > *", {
					pointerEvents: "none",
				}),
				{
					backgroundImage: getTempBackground(),
					backgroundSize: "100% 100%",
					cursor: "pointer",
				}
			);
		}
		
		readonly head;
		
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
	
	/** */
	function getTempBackground()
	{
		if (tempBackground === "")
		{
			const canvas = Hot.canvas({ width: 32, height: 32 });
			const ctx = canvas.getContext("2d")!;
			const grad = ctx.createLinearGradient(0, 0, 32, 32);
			grad.addColorStop(0, "rgb(200, 200, 200)");
			grad.addColorStop(1, "rgb(50, 50, 50)");
			ctx.fillStyle = grad;
			ctx.fillRect(0, 0, 32, 32);
			tempBackground = `url(${canvas.toDataURL()})` ;
		}
		
		return tempBackground;
	}
	let tempBackground = "";
	
	export type RectangleFidelity = "performance" | "precision";
}
