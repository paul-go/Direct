
namespace Turf
{
	/** */
	export class PublishStatusView
	{
		/** */
		static show(kind: string)
		{
			const view = new PublishStatusView(kind);
			document.body.append(view.root);
			return () => view.remove();
		}
		
		/** */
		private constructor(kind: string)
		{
			this.root = Htx.div(
				UI.flexCenter,
				UI.anchorBottomRight(20),
				UI.spinner(),
				{
					padding: "20px",
					borderRadius: UI.borderRadius.large,
					backgroundColor: UI.gray(75, 0.5),
					backdropFilter: "blur(5px)",
					transformOrigin: "50% 50%",
					transitionProperty: "transform, opacity",
					transitionDuration: "0.66s",
					pointerEvents: "none",
				},
				this.hide,
				() => Htx.from(this.root)(this.show),
				Htx.span(
					{
						opacity: "0.8",
						margin: "0 6px 0 20px",
					},
					...UI.text("Publishing to: ", 22)
				),
				Htx.span(
					...UI.text(kind, 22, 700)
				),
			);
		}
		
		readonly root;
		
		/** */
		private readonly show = Htx.css({
			opacity: "1",
			transform: "translateY(0) scale(1)",
		});
		
		/** */
		private readonly hide = Htx.css({
			opacity: "0",
			transform: "translateY(10px) scale(0.8)",
		});
		
		/** */
		private async remove()
		{
			if (this.isRemoving)
				return;
			
			this.isRemoving = true;
			this.root.classList.remove(this.show);
			this.root.classList.add(this.hide);
			await UI.waitTransitionEnd(this.root);
			this.root.remove();
		}
		private isRemoving = false;
	}
}
