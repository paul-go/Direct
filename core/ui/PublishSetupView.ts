
namespace Turf
{
	/** */
	export class PublishSetupView
	{
		/** */
		static show(via: Controller.IController, record: PatchRecord)
		{
			const app = AppContainer.of(via);
			const view = new PublishSetupView(record, app);
			app.root.append(view.root);
		}
		
		/** */
		constructor(
			record: PatchRecord,
			private readonly app: AppContainer)
		{
			this.windowFlipper = createFlipper({
				invisible: {
					transform: "translateY(100%)",
					opacity: "0",
				},
				visible: {
					transform: "translateY(0)",
					opacity: "1",
				},
			})
			
			const overlay = UI.overlay(
				{
					overflow: "hidden",
				},
				this.windowElement = Htx.div(
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
					When.connected(e =>
					{
						this.windowFlipper.visible();
						
						UI.waitTransitionEnd(e).then(() =>
						{
							this.root.addEventListener("transitionstart", ev =>
							{
								if (ev.target === this.root)
									this.windowFlipper.invisible();
							});
						});
					}),
					
					this.contents = Htx.div(
						"contents",
						{
							minWidth: "400px",
						},
						() =>
						{
							const publishers = Publisher.getPublishers(record, app.meta);
							
							return Htx.div(
								{ textAlign: "center" },
								Htx.div(
									{ marginBottom: "20px" },
									...UI.text("Where?", 50, 800),
								),
								Htx.div(
									...publishers.map(pub => this.renderOption(pub))
								)
							);
						},
					),
				)
			);
			
			this.root = overlay.element;
			this.overlayFlipper = overlay.flipper;
			
			Controller.set(this);
		}
		
		readonly root;
		readonly windowElement;
		private readonly overlayFlipper;
		private readonly windowFlipper;
		private readonly contents;
		
		/** */
		private renderOption(publisher: Publisher)
		{
			return Htx.a(
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
						this.contents.replaceChildren(publisher.root);
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
