
namespace App
{
	/** */
	export class RectangleHat
	{
		readonly head;
		
		/** */
		constructor()
		{
			this.head = Hot.div(
				Hot.css("& > *", {
					pointerEvents: "none",
				}),
				Player.Omniview.defaultBackground,
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
			this.setFidelity("precision");
			
			/*
			if (this.fidelity === "performance")
			{
				this.updateImage().then(() => this.setFidelity(this.fidelity!));
			}
			else if (this.fidelity === "precision")
			{
				this.setFidelity("performance");
				this.updateImage();
			}
			else
			{
				this.setFidelity("precision");
				this.updateImage().then(() =>
				{
					this.setFidelity("performance");
				});
			}
			*/
		}
		
		/** */
		private showHtml()
		{
			this.head.replaceChildren(this.html);
			this.head.style.removeProperty("background-image");
		}
		private html: HTMLElement = Hot.div("null");
		
		/** */
		private showImage()
		{
			this.head.replaceChildren();
			this.head.style.backgroundImage = `url(${this.image})`;
		}
		private image: string = "";
		
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
			
			const blob = await App.rasterize(this.html);
			this.image = BlobUri.create(blob);
		}
		
		/** */
		setFidelity(fidelity: RectangleFidelity)
		{
			if (fidelity === "performance")
				this.showImage();
			
			else if (fidelity === "precision")
				this.showHtml();
			
			this.fidelity = fidelity;
		}
		protected fidelity?: RectangleFidelity;
	}
	
	export type RectangleFidelity = "performance" | "precision";
}
