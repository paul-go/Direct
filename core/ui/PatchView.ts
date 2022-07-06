
namespace Turf
{
	/** */
	export class PatchView
	{
		/** */
		constructor(readonly record = new PatchRecord())
		{
			this.root = Htx.div(
				"patch-view",
				{
					paddingBottom: "10px",
				},
				this.bladesElement = Htx.div(
					"blades-element",
					UI.flexColumn,
					{
						flex: "1 0",
					},
					Htx.p(
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
					"footer",
					{
						margin: "auto",
						maxWidth: "400px",
						padding: "20px",
					},
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
