
namespace Turf
{
	/** */
	export class PatchView
	{
		/** */
		constructor()
		{
			this.root = Htx.div(
				"patch-view",
				UI.flexColumn,
				{
					flex: "1 0",
					width: UI.vsize(100),
					margin: "auto",
					padding: "0 20px 60px",
				},
				
				this.bladesElement = Htx.div(
					"blades-element",
					UI.flexColumn,
					{
						flex: "1 0",
					},
					Htx.div(
						"no-blades-message",
						UI.visibleWhenAlone(),
						UI.anchor(),
						UI.flexCenter,
						{
							zIndex: "1",
						},
						Htx.div(
							"add-first-blade",
							new Text("This patch has no blades."),
							UI.actionButton("filled", 
								{
									marginTop: "10px",
								},
								Htx.on(UI.click, async () =>
								{
									const bladeView = await AddBladeView.show(this.root);
									if (bladeView)
										this.bladesElement.append(bladeView.root);
								}),
								new Text("Add One"),
							)
						),
					),
				),
				
				Htx.div(
					"preview-button",
					UI.actionButton("filled", 
						new Text("Preview"),
						Htx.on("click", () =>
						{
							
						})
					)
				)
			);
			this.blades = new Controller.Array(this.bladesElement, BladeView);
			
			Controller.set(this);
		}
		
		readonly root;
		readonly blades;
		private readonly bladesElement;
		
		/** */
		private toJSON()
		{
			return {
				blades: this.blades
			}
		}
	}
}
