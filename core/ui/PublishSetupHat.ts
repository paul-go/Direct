
namespace App
{
	/** */
	export class PublishSetupHat
	{
		/** */
		static show(via: Hat.IHat, record: PostRecord)
		{
			const app = AppContainer.of(via);
			const hat = new PublishSetupHat(record, app);
			app.head.append(hat.head);
		}
		
		/** */
		constructor(
			record: PostRecord,
			private readonly app: AppContainer)
		{
			this.windowFlipper = createFlipper({
				invisible: {
					transform: "translateY(100%)",
					opacity: 0,
				},
				visible: {
					transform: "translateY(0)",
					opacity: 1,
				},
			})
			
			const overlay = UI.overlay(
				{
					overflow: "hidden",
				},
				this.windowElement = Hot.div(
					"window-element",
					UI.anchorBottom(40),
					{
						margin: "auto",
						padding: "40px",
						maxWidth: "fit-content",
						backgroundColor: UI.gray(40),
						boxShadow: "0 0 40px " + UI.black(0.5),
						borderRadius: UI.borderRadius.large,
						textAlign: "center",
						transitionDuration: "0.33s",
						transitionProperty: "transform, opacity",
					},
					this.windowFlipper.install(),
					When.rendered(e =>
					{
						this.windowFlipper.visible();
						
						UI.waitTransitionEnd(e).then(() =>
						{
							this.head.addEventListener("transitionstart", ev =>
							{
								if (ev.target === this.head)
									this.windowFlipper.invisible();
							});
						});
					}),
					
					this.contents = Hot.div(
						"contents",
						{
							minWidth: "400px",
						},
						() =>
						{
							const publishers = Publisher.getPublishers(record, app.meta);
							
							return Hot.div(
								{ textAlign: "center" },
								Hot.div(
									{ marginBottom: "20px" },
									...UI.text("Where?", 50, 800),
								),
								Hot.div(
									...publishers.map(pub => this.renderOption(pub))
								)
							);
						},
					),
				)
			);
			
			this.head = overlay.element;
			this.overlayFlipper = overlay.flipper;
			
			Hat.wear(this);
		}
		
		readonly head;
		readonly windowElement;
		private readonly overlayFlipper;
		private readonly windowFlipper;
		private readonly contents;
		
		/** */
		private renderOption(publisher: Publisher)
		{
			return Hot.a(
				{
					display: "inline-block",
					padding: "20px",
				},
				...publisher.renderLink(),
				...UI.click(async () =>
				{
					if (await publisher.shouldInsert())
					{
						this.app.meta.publishMethod = publisher.key;
						this.contents.replaceChildren(publisher.head);
					}
				})
			);
		}
		
		/** */
		async close()
		{
			this.overlayFlipper.invisible();
			this.windowFlipper.invisible();
			await UI.waitTransitionEnd(this.overlayFlipper.element);
			this.overlayFlipper.element.remove();
		}
	}
}
