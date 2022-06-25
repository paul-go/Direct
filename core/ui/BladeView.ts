
namespace Turf
{
	/** */
	export abstract class BladeView
	{
		/** */
		constructor()
		{
			this.root = Htx.div(
				"blade-view",
				
				// Controls header
				Htx.div(
					"controls-header",
					UI.flexCenter,
					{
						height: "100px",
					},
					Htx.a(
						this.buttonStyle,
						new Text("^"),
						Htx.on(UI.click, () => this.handleMove())
					),
					Htx.div(
						{
							textAlign: "center",
							flex: "1 0"
						},
						new Text("Transition"),
						this.transitionAnchor = Htx.a(
							Htx.on(UI.click, () => this.handleTransition())
						)
					),
					Htx.a(
						this.buttonStyle,
						new Text("+"),
						Htx.on(UI.click, () => this.handleAdd())
					),
					...this.createDripper("Add Here", dt =>
					{
						debugger;
					})
				),
				
				//
				this.sceneContainer = Htx.div(
					"scene-container",
					{
						height: UI.vsize(100),
						borderRadius: UI.borderRadius.default,
						backgroundColor: "gray",
					},
					// Close button
					Htx.div(
						"delete-button",
						new Text(UI.mul),
						UI.anchorTopRight(5, 5),
						UI.flexCenter,
						UI.clickable,
						{
							width: "40px",
							height: "40px",
							fontWeight: "900",
							borderRadius: "100%",
							backgroundColor: UI.gray(0.5),
						},
						Htx.on(UI.click, () => this.root.remove())
					),
				),
				
				//
				this.controlsContainer = Htx.div(
					"controls-container",
					{
						display: "flex",
						justifyContent: "center"
					}
				),
			);
			
			// Populate this with data in the future.
			this._transition = BladeTransition.scroll;
			
			Controller.set(this);
		}
		
		readonly root: HTMLDivElement;
		readonly sceneContainer;
		readonly controlsContainer;
		
		/** */
		private readonly buttonStyle: Htx.Style = {
			width: "50px",
			fontSize: "30px",
			...UI.clickable,
		};
		
		/** */
		private handleMove()
		{
			
		}
		
		/** */
		private async handleAdd()
		{
			const view = await AddBladeView.show(this.root);
			if (view)
				this.root.insertAdjacentElement("beforebegin", view.root);
		}
		
		/** */
		private handleTransition()
		{
			// Display the transition screen and then set the local property when done
		}
		
		/** */
		get transition()
		{
			return this._transition;
		}
		set transition(value: BladeTransition)
		{
			this._transition = value;
			this.transitionAnchor.innerHTML = `Transition - <b>${value}</b>`;
		}
		private _transition: BladeTransition;
		
		private readonly transitionAnchor: HTMLAnchorElement;
		
		/** */
		createBladeButton(text: string, clickFn: () => void)
		{
			return Htx.a(
				UI.clickable,
				{
					display: "block",
					whiteSpace: "nowrap",
					padding: "10px",
				},
				Htx.on(UI.click, clickFn),
				new Text(text)
			);
		}
		
		/** */
		protected createDripper(title: string, dropFn: (dt: DataTransfer) => void)
		{
			return UI.dripper(
				new Text(title),
				UI.flexCenter,
				{
					backgroundColor: UI.color({ l: 20, a: 0.85 }),
					border: "3px solid " + UI.color({ l: 20 }),
					borderRadius: UI.borderRadius.default,
					fontSize: "40px",
					fontWeight: "700",
					color: "white"
				},
				Htx.on("drop", ev =>
				{
					if (ev.dataTransfer)
						dropFn(ev.dataTransfer);
				})
			);
		}
	}
}
