
namespace App
{
	/** */
	export class MainMenuHat
	{
		/** */
		static getWindowStyle()
		{
			return {
				position: "absolute",
				left: 0,
				right: 0,
				bottom: "2vh",
				margin: "auto",
				maxHeight: "96vh",
				width: "100%",
				height: "fit-content",
				maxWidth: "600px",
				padding: "10px",
				borderRadius: UI.borderRadius.large,
				backgroundColor: UI.lightGrayBackground,
				boxShadow: "0 0 100px black",
			} as Hot.Style;
		}
		
		readonly head;
		
		/** */
		constructor()
		{
			this.head = Hot.div(
				"main-menu-hat",
				UI.backdropBlur(4),
				{
					position: "fixed",
					bottom: 0,
					left: 0,
					right: 0,
					zIndex: 2,
					transitionProperty: "background-color, filter",
					transitionDuration: "0.3s",
				},
				Hot.on(document.body, "keydown", ev => this.handleKeydown(ev)),
				Hot.on("pointerdown", ev => ev.target === this.screens && this.hide()),
				this.openButton = UI.circleButton(
					{
						position: "fixed",
						bottom: "30px",
						right: "30px",
						zIndex: 1,
						color: "white",
						letterSpacing: "-0.1em",
						lineHeight: 3,
					},
					visibleClass,
					Hot.div(
						{
							transformOrigin: "50% 50%",
							transform: "rotate(90deg)",
						},
						new Text("•••")
					),
					UI.click(() => this.show()),
				),
				this.screens = Hot.div(
					"screens",
					UI.anchor(),
				),
			);
			
			Hat.wear(this);
		}
		
		/** */
		private readonly openButton;
		
		/** */
		private readonly screens: HTMLElement;
		
		/** */
		private handleKeydown(ev: KeyboardEvent)
		{
			if (ev.key === "p" && ev.metaKey && !ev.ctrlKey && !ev.shiftKey && !ev.altKey)
			{
				ev.preventDefault();
				this.show();
			}
			else if (ev.key === "Escape")
			{
				this.hide();
			}
		}
		
		/** */
		get isVisible()
		{
			return this._isVisible;
		}
		private _isVisible = false;
		
		/** */
		async show()
		{
			if (this.isVisible)
				return;
			
			await this.setScreen(Hot.div(
				invisibleForwardClass,
				{
					position: "fixed",
					left: 0,
					right: 0,
					bottom: 0,
					margin: "auto",
					width: "100%",
					maxWidth: "400px",
				},
				Hot.css(" > ." + UI.actionButton.name, {
					marginBottom: "20px",
					boxShadow: "0 10px 20px " + UI.black(0.25)
				}),
				this.getPublishButtons(),
				UI.actionButton(
					"filled",
					UI.click(() => this.showPreview()),
					new Text("Preview")
				),
				UI.actionButton(
					"filled",
					UI.click(() => this.showPalette()),
					new Text("Manage Blogs")
				)
			));
		}
		
		/** */
		private getPublishButtons()
		{
			return Publishers.create(this.head).map((publisher, i) =>
				UI.actionButton(
					"filled",
					UI.click(() => this.tryPublish(publisher, false)),
					i === 0 && {
						backgroundImage: "linear-gradient(160deg, orange, crimson)",
						textShadow: "0 5px 12px " + UI.black(0.66)
					},
					new Text("Publish - " + publisher.name),
					Hot.div(
						"settings-button",
						{
							position: "absolute",
							margin: "auto",
							top: "10px",
							bottom: "10px",
							right: "10px",
							width: "60px",
							borderRadius: "100%",
							transitionProperty: "box-shadow",
							transitionDuration: "0.15s",
							backgroundColor: UI.white(0.15)
						},
						
						Hot.css(":hover !", {
							boxShadow: "0 0 0 4px " + UI.white(0.5)
						}),
						UI.click(ev =>
						{
							ev.stopPropagation();
							this.tryPublish(publisher, true);
						}),
						Icon.settings(
							UI.anchorCenter(),
							{
								width: "30px",
								height: "30px",
								pointerEvents: "none",
							}
						)
					)
				));
		}
		
		/** */
		private async tryPublish(publisher: AbstractPublisher, showConfig: boolean)
		{
			const result = await publisher.tryPublish(showConfig);
			if (result !== undefined)
				this.setScreen(result);
		}
		
		/** */
		private async hide()
		{
			this.setScreen(null);
		}
		
		/** */
		async showPalette()
		{
			this.setScreen(new BlogPaletteHat().head);
		}
		
		/** */
		async showPreview()
		{
			
		}
		
		/** */
		private async setScreen(newScreen: HTMLElement | null)
		{
			if (newScreen)
			{
				this.expandHead(true);
				await UI.wait();
			}
			
			Hot.get(this.head)(
				UI.backdropBlur(newScreen ? 4 : 0),
				{ backgroundColor: UI.black(newScreen ? 0.33 : 0) }
			);
			
			const currentScreen = this.screens.firstElementChild as HTMLElement;
			const openList = this.openButton.classList;
			
			if (currentScreen)
			{
				const newClass = newScreen ? 
					invisibleBackwardClass :
					invisibleForwardClass;
				
				currentScreen.classList.replace(visibleClass, newClass);
				UI.waitTransitionEnd(currentScreen).then(() => currentScreen.remove());
			}
			
			if (newScreen)
			{
				if (openList.contains(visibleClass))
					openList.add(invisibleBackwardClass);
				
				newScreen.classList.remove(visibleClass);
				newScreen.classList.add(invisibleForwardClass);
				this.screens.append(newScreen);
				await UI.waitAnimationFrame();
				await UI.wait(1);
				newScreen.classList.replace(invisibleForwardClass, visibleClass);
			}
			else
			{
				openList.contains(invisibleBackwardClass) ?
					openList.replace(invisibleBackwardClass, visibleClass) :
					openList.add(visibleClass);
				
				this.expandHead(false);
			}
		}
		
		/** */
		private expandHead(expanded: boolean)
		{
			this._isVisible = expanded;
			this.head.style.top = expanded ? "0" : "auto";
		}
	}
	
	const transitionDuration = "0.5s";
	
	/** */
	const transitionClassStyles: Hot.Style = {
		transitionProperty: "transform, opacity",
		transitionDuration,
		opacity: 1,
		transform: "translateX(0)",
	};
	
	/** */
	const invisibleForwardClass = Hot.css({
		...transitionClassStyles,
		opacity: 0,
		transform: "translateX(100px)",
	});
	
	/** */
	const invisibleBackwardClass = Hot.css({
		...transitionClassStyles,
		opacity: 0,
		transform: "translateX(-100px)",
	});
	
	/** */
	const visibleClass = Hot.css(transitionClassStyles);
}
