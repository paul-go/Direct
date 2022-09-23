
namespace App
{
	/** */
	export class MainMenuHat
	{
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
				Hot.on("pointerdown", ev => ev.target === this.head && this.hide()),
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
					UI.fixed(),
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
				UI.actionButton(
					"filled",
					{ zIndex: 1 },
					UI.click(() => this.showPreview()),
					new Text("Preview")
				),
				UI.actionButton(
					"filled",
					{ zIndex: 2 },
					UI.click(() => this.showPublish()),
					new Text("Publish")
				),
				UI.actionButton(
					"filled",
					{ zIndex: 3 },
					UI.click(() => this.showPalette()),
					new Text("Manage Blogs")
				)
			));
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
		async showPublish()
		{
			
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
