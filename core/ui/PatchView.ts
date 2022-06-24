
namespace Grassroots
{
	/** */
	export class PatchView
	{
		/** */
		constructor()
		{
			this.root = Htx.div(
				"patch-view",
				{
					flex: "1 0",
					width: UI.vsize(100),
					margin: "auto",
					padding: "0 20px 60px",
				},
				Htx.div(
					UI.visibleWhenAlone(),
					UI.anchor(),
					UI.flexCenter,
					{
						zIndex: "1",
					},
					Htx.div(
						new Text("This patch has no blades."),
						UI.actionButton("filled", 
							{
								marginTop: "10px",
							},
							Htx.on(UI.click, async () =>
							{
								const view = await AddBladeView.show(this.root);
								if (view)
									this.root.append(view.root);
							}),
							new Text("Add One"),
						)
					),
				)
			);
			this.blades = new Controller.Array(this.root, BladeView);
			
			Controller.set(this);
		}
		
		readonly root;
		readonly blades;
		
		
	}
}
