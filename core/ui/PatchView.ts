
namespace Turf
{
	/** */
	export class PatchView
	{
		/** */
		constructor(record?: PatchRecord)
		{
			this.isNewRecord = !record;
			this.record = record || new PatchRecord();
			
			const minHeight: Htx.Param = { minHeight: "85vh" };
			
			this.root = Htx.div(
				"patch-view",
				UI.anchor(),
				{
					paddingBottom: "10px",
				},
				minHeight,
				this.bladesElement = Htx.div(
					"blades-element",
					minHeight,
					Htx.p(
						"no-blades-message",
						UI.visibleWhenAlone(),
						UI.anchor(),
						UI.flexCenter,
						minHeight,
						{
							zIndex: "1",
						},
						Htx.div(
							"add-first-blade",
							Htx.div(
								UI.presentational,
								{
									fontSize: "30px",
									fontWeight: "600",
									marginBottom: "30px",
								},
								new Text("This patch has no blades."),
							),
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
				
				this.footerElement = Htx.div(
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
							Saver.execute(this);
							const apex = Controller.over(this, ApexView);
							const meta = apex.currentMeta;
							new PreviewView(this.record, meta);
						})
					)
				),
				UI.chevron(
					UI.clickable,
					UI.anchorTopLeft(30),
					Htx.on("click", () => this.backFn()),
				),
			);
			
			this.blades = new Controller.Array(this.bladesElement, BladeView);
			this.blades.insert(...this.record.blades.map(b => BladeView.new(b)));
			this.blades.observe(() =>
			{
				this.footerElement.style.display = this.blades.length > 0 ? "block" : "none";
				this.save();
			});
			
			Controller.set(this);
			Saver.set(this);
		}
		
		readonly root;
		readonly blades;
		private readonly bladesElement;
		private readonly footerElement;
		private readonly record;
		private isNewRecord: boolean;
		
		/** */
		save()
		{
			this.record.blades = this.blades
				.toArray()
				.map(view => view.record);
			
			if (this.isNewRecord)
				this.newlySavedFn(this.record);
		}
		
		/** */
		setNewlySavedCallback(fn: (patch: PatchRecord) => void)
		{
			this.newlySavedFn = fn;
		}
		private newlySavedFn = (patch: PatchRecord) => {};
		
		/** */
		setBackCallback(fn: () => void)
		{
			this.save();
			this.backFn = fn;
		}
		private backFn = () => {};
	}
}
