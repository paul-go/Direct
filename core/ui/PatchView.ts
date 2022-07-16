
namespace Turf
{
	/** */
	export class PatchView
	{
		/** */
		constructor(record?: PatchRecord)
		{
			this.isNewRecord = !record;
			this.record = record || (() =>
			{
				const r = new PatchRecord();
				r.slug = Util.generatePatchSlug();
				return r;
			})();
			
			const minHeight: Htx.Param = { minHeight: "85vh" };
			
			this.root = Htx.div(
				"patch-view",
				UI.anchorTop(),
				{
					minHeight: "100vh",
					paddingBottom: "10px",
					backgroundColor: "black",
				},
				minHeight,
				this.bladesElement = Htx.div(
					"blades-element",
					minHeight,
				),
				Htx.p(
					"no-blades-message",
					UI.anchor(),
					UI.flexCenter,
					UI.visibleWhenEmpty(this.bladesElement),
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
							Htx.on(UI.click, () => this.handleAddFirst()),
							new Text("Add One"),
						)
					),
				),
				
				this.footerElement = Htx.div(
					"footer",
					UI.visibleWhenNotEmpty(this.bladesElement),
					{
						margin: "auto",
						maxWidth: "400px",
						padding: "20px",
					},
					UI.actionButton("filled", 
						new Text("Preview"),
						Htx.on("click", () => this.handlePreview())
					),
					Htx.div(
						{
							textAlign: "center",
							margin: "20px",
						},
						UI.clickable,
						Htx.on(UI.click, () =>
						{
							this.export();
						}),
						new Text("Export"),
					)
				),
				UI.chevron(
					Origin.left,
					UI.clickable,
					UI.anchorTopLeft(30),
					{ zIndex: "1" }, // Elevate the chevron so that it goes above the "no blades" message
					Htx.on("click", () => this.handleBack())
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
		}
		
		/** */
		setKeepCallback(fn: (patch: PatchRecord) => void)
		{
			this.keepFn = fn;
		}
		private keepFn = (patch: PatchRecord) => {};
		
		/** */
		setBackCallback(fn: () => void)
		{
			this.backFn = fn;
		}
		private backFn = () => {};
		
		/** */
		private handleBack()
		{
			this.save();
			
			if (this.isNewRecord && this.blades.length > 0)
				this.keepFn(this.record);
			
			this.backFn();
		}
		
		/** */
		private async handleAddFirst()
		{
			const bladeView = await AddBladeView.show(this.root);
			if (bladeView)
				this.bladesElement.append(bladeView.root);
		}
		
		/** */
		private handlePreview()
		{
			Saver.execute(this);
			const meta = AppContainer.of(this).meta;
			new PreviewView(this.record, meta);
		}
		
		/** */
		private async export()
		{
			const meta = AppContainer.of(this).meta;
			let baseFolder = "";
			
			if (ELECTRON)
			{
				baseFolder = getExportsFolder();
			}
			else
			{
				const key = ConstS.baseFolderPrefix + meta.id;
				baseFolder = localStorage.getItem(key) || "";
				
				if (TAURI)
				{
					const choice = await Tauri.dialog.open({
						recursive: true,
						directory: true,
						multiple: false,
						defaultPath: "",
					});
				}
				
				localStorage.setItem(key, baseFolder);
			}
			
			await Export.single(this.record, meta, baseFolder);
			
			if (DEBUG)
				console.log("Exported to: " + baseFolder);
		}
	}
}
