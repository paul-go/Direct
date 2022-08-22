
namespace App
{
	/** */
	export class PublishStatusHat
	{
		/** */
		static show(target: string)
		{
			const hat = new PublishStatusHat(target);
			document.body.append(hat.head);
			return () => hat.remove();
		}
		
		/** */
		private constructor(target: string)
		{
			this.head = Hot.div(
				UI.flexCenter,
				UI.anchorBottomRight(20),
				UI.spinner(),
				{
					position: "fixed",
					padding: "20px",
					borderRadius: UI.borderRadius.large,
					backgroundColor: UI.gray(75, 0.5),
					transformOrigin: "50% 50%",
					transitionProperty: "transform, opacity",
					transitionDuration: transitionTicks + "ms",
					pointerEvents: "none",
				},
				UI.backdropBlur(5),
				this.hide,
				When.rendered(() => Hot.get(this.head)(this.show)),
				Hot.span(
					{
						opacity: 0.8,
						margin: "0 6px 0 20px",
					},
					...UI.text("Publishing to: ", 22)
				),
				Hot.span(
					...UI.text(target, 22, 700)
				),
			);
		}
		
		readonly head;
		private readonly showTime = Date.now();
		
		/** */
		private readonly show = Hot.css({
			opacity: 1,
			transform: "translateY(0) scale(1)",
		});
		
		/** */
		private readonly hide = Hot.css({
			opacity: 0,
			transform: "translateY(10px) scale(0.8)",
		});
		
		/** */
		private async remove()
		{
			if (this.isRemoving)
				return;
			
			this.isRemoving = true;
			
			const ms = Date.now() - (this.showTime + transitionTicks + 100);
			if (ms < 0)
				await UI.wait(Math.abs(ms));
			
			this.head.classList.remove(this.show);
			this.head.classList.add(this.hide);
			await UI.waitTransitionEnd(this.head);
			this.head.remove();
		}
		private isRemoving = false;
	}
	
	const transitionTicks = 650;
}
