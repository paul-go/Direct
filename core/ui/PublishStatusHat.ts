
namespace App
{
	/** */
	export class PublishStatusHat
	{
		/** */
		static get(target: string)
		{
			const existing = Hat.down(document.body, PublishStatusHat);
			if (existing)
				return existing;
			
			const hat = new PublishStatusHat(target);
			document.body.append(hat.head);
			return hat;
		}
		
		readonly head;
		
		/** */
		constructor(targetName: string)
		{
			this.head = Hot.div(
				When.rendered(() => Hot.get(this.head)(show)),
				UI.anchorBottom(20),
				UI.backdropBlur(5),
				hide,
				{
					position: "fixed",
					width: "fit-content",
					margin: "auto",
					transformOrigin: "50% 50%",
					transitionProperty: "transform, opacity",
					transitionDuration: transitionTicks + "ms",
					borderRadius: UI.borderRadius.large,
					backgroundColor: UI.gray(75, 0.5),
					zIndex: 3
				},
				Hot.div(
					"header",
					UI.flexCenter,
					{
						padding: "20px",
					},
					UI.spinner(),
					Hot.span(
						{
							opacity: 0.8,
							margin: "0 6px 0 20px",
						},
						...UI.text("Publishing to: ", 22)
					),
					Hot.span(
						...UI.text(targetName, 22, 700)
					),
					Hot.div(
						{
							marginLeft: "20px",
							padding: "20px",
							fontWeight: "700",
							borderRadius: UI.borderRadius.large,
							backgroundColor: UI.white(0.15),
							cursor: "pointer",
						},
						UI.click(() => this._cancelFn()),
						new Text("Stop")
					),
				),
				this.fileNameElement = Hot.div(
					"status-area",
					{
						padding: "30px",
						textAlign: "center",
					},
				),
				Hot.div(
					{
						background: UI.black(0.33),
					},
					this.progressMeterElement = Hot.div(
						"progress-element",
						{
							background: UI.themeGradient(),
							borderRadius: UI.borderRadius.max,
							transitionProperty: "width",
							transitionDuration: "0.25s",
						}
					)
				)
			);
			
			[this.cancelFn, this._cancelFn] = Force.create<() => void>();
			this.cancelFn(() => this.remove());
			
			Hat.wear(this);
		}
		
		private readonly showTime = Date.now();
		private readonly fileNameElement;
		private progressMeterElement;
		
		/** */
		readonly cancelFn;
		private readonly _cancelFn;
		
		private currentFileName = "";
		private currentProgress = 0;
		
		/**
		 * Sets the name of the currently uploading file.
		 */
		setFile(name: string)
		{
			this.currentFileName = name;
			this.update();
		}
		
		/**
		 * Sets a number between 0 and 1 which indicates the
		 * percentage progress to display.
		 */
		setProgress(progress: number)
		{
			this.currentProgress = progress;
			this.update();
		}
		
		/** */
		private update()
		{
			const p = this.currentProgress;
			const hasProgress = p >= 0 || p <= 1;
			const pct = (p * 100).toFixed(1) + "%";
			this.fileNameElement.replaceChildren();
			
			if (this.currentFileName)
			{
				Hot.get(this.fileNameElement)(
					{
						borderTop: "1px solid " + UI.white(0.15),
						background: UI.black(0.33),
					},
					new Text("Uploading "),
					Hot.span(
						{ fontWeight: 700 },
						new Text(this.currentFileName)
					),
					hasProgress && Hot.span(
						{
							display: "inline-block",
							minWidth: "4em",
							textAlign: "right",
							fontWeight: 700
						},
						new Text(pct)
					)
				);
			}
			
			const s = this.progressMeterElement.style;
			
			if (hasProgress)
			{
				s.height = "6px";
				
				const currentWidth = parseInt(s.width);
				const newWidth = parseInt(pct);
				
				if (newWidth < currentWidth)
				{
					this.resetMeter();
				}
				else
				{
					s.width = pct;
				}
			}
			else
			{
				s.height = "0";
				this.resetMeter();
			}
		}
		
		/** */
		private resetMeter()
		{
			const clone = this.progressMeterElement.cloneNode() as HTMLDivElement;
			clone.style.width = "0";
			this.progressMeterElement.replaceWith(clone);
			this.progressMeterElement = clone;
		}
		
		/** */
		async remove()
		{
			if (this.isRemoving)
				return;
			
			this.isRemoving = true;
			
			const ms = Date.now() - (this.showTime + transitionTicks + 100);
			if (ms < 0)
				await UI.wait(Math.abs(ms));
			
			this.head.classList.replace(show, hide);
			await UI.waitTransitionEnd(this.head);
			this.head.remove();
		}
		private isRemoving = false;
	}
	
	/** */
	const show = Hot.css("& !", {
		opacity: 1,
		transform: "translateY(0) scale(1)",
	}).class;
	
	/** */
	const hide = Hot.css("& !", {
		opacity: 0,
		transform: "translateY(10px) scale(0.8)",
	}).class;
	
	const transitionTicks = 650;
}
