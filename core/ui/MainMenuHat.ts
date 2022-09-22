
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
				menuClosedClass,
				UI.backdropBlur(4),
				{
					position: "fixed",
					bottom: 0,
					right: 0,
					zIndex: 2,
					transitionProperty: "background-color, filter",
					transitionDuration: "0.3s",
				},
				Hot.on(document.body, "keydown", ev => this.handleKeydown(ev)),
				Hot.on("pointerdown", ev => ev.target === this.head && this.hide()),
				this.menuButton = UI.circleButton(
					{
						position: "fixed",
						bottom: "30px",
						right: "30px",
						zIndex: 1,
						opacity: 1,
						transitionProperty: "transform, opacity",
						transitionDuration: "0.5s",
						transform: "none",
						color: "white",
						letterSpacing: "-0.1em",
						lineHeight: 3,
					},
					Hot.div(
						{
							transformOrigin: "50% 50%",
							transform: "rotate(90deg)",
						},
						new Text("•••")
					),
					UI.click(() => this.show()),
				),
			);
			
			Hat.wear(this);
		}
		
		/** */
		private readonly menuButton;
		
		/** */
		private menuContents: HTMLElement | null = null;
		
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
			
			this._isVisible = true;
			this.head.classList.remove(menuClosedClass);
			this.head.classList.add(menuOpenClass);
			await UI.wait();
			
			this.head.append(this.menuContents = Hot.div(
				"menu-contents",
				{
					position: "fixed",
					left: 0,
					right: 0,
					bottom: 0,
					width: "100%",
					maxWidth: "400px",
					margin: "auto",
					opacity: 0,
					transform: "translateX(100px)",
					transitionProperty: "transform, opacity",
					transitionDuration: "0.5s",
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
			
			await UI.waitAnimationFrame();
			await UI.wait(1);
			
			let s = this.menuButton.style;
			s.transform = "translateX(-100px)";
			s.opacity = "0";
			
			s = this.menuContents.style;
			s.transform = "none";
			s.opacity = "1";
			
			Hot.get(this.head)(
				UI.backdropBlur(4),
				{ backgroundColor: UI.black(0.33) }
			);
		}
		
		/** */
		private async hide()
		{
			if (!this.isVisible)
				return;
			
			this._isVisible = false;
			let s = this.menuButton.style;
			s.transform = "none";
			s.opacity = "1";
			
			Hot.get(this.head)(
				UI.backdropBlur(0),
				{ backgroundColor: UI.black(0) }
			);
			
			if (!this.menuContents)
				return;
			
			s = this.menuContents.style;
			s.transform = "translateX(100px)";
			s.opacity = "0";
			
			await UI.waitTransitionEnd(this.menuContents);
			this.menuContents?.remove();
			this.menuContents = null;
			
			this.head.classList.remove(menuOpenClass);
			this.head.classList.add(menuClosedClass);
		}
		
		/** */
		async showPalette()
		{
			
		}
		
		/** */
		async showPublish()
		{
			
		}
		
		/** */
		async showPreview()
		{
			
		}
	}
	
	/** */
	const menuOpenClass = Hot.css({
		top: 0,
		left: 0,
	});
	
	/** */
	const menuClosedClass = Hot.css({
		width: 0,
		height: 0,
	});
}
