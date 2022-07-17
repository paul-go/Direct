
namespace Turf
{
	/** */
	export class SettingsView
	{
		/** */
		constructor()
		{
			this.colorSchemeViews = ColorScheme.all.map(scheme =>
			{
				const csv = new ColorSchemeView(scheme);
				csv.setSelectedFn(() =>
				{
					this.meta.colorScheme = scheme.colors;
				});
				return csv;
			});
			
			this.root = Htx.div(
				UI.fixed(),
				...UI.removeOnEscape(),
				UI.removeOnClick(),
				Htx.div(
					{
						overflowY: "auto",
					},
					UI.anchorCenter(600, "auto"),
					UI.shadow.window,
					{
						backgroundColor: "white",
						color: "black",
						padding: "20px",
						borderRadius: UI.borderRadius.large,
						maxHeight: "80vh",
					},
					Htx.div(
						Htx.h2(
							new Text("Settings"),
							{
								paddingBottom: "1em",
								fontSize: "4vw"
							}
						),
						Htx.h3(
							new Text("Color Scheme"),
							{
								paddingBottom: "1em",
								fontSize: "2.5vw",
							}
						),
						Htx.div(...this.colorSchemeViews.map(v => v.root))
					),
					Htx.div(
						UI.clickable,
						UI.anchorBottomRight(20),
						UI.checkmark({ filter: "invert(1)" }),
						Htx.on(UI.clickEvt, () =>
						{
							//this.save();
							UI.removeWithFade(this.root);
						})
					)
				),
				() =>
				{
					const scheme = ColorScheme.fromJson(this.meta.colorScheme);
					if (!scheme)
						return;
					
					const view = this.colorSchemeViews.find(v => v.scheme === scheme);
					if (!view)
						return;
					
					view.select();
				}
			);
			
			Controller.set(this);
		}
		
		readonly root;
		private readonly colorSchemeViews;
		
		/** */
		private get meta()
		{
			return this._meta || (this._meta = AppContainer.of(this).meta);
		}
		private _meta: MetaRecord | null = null;
		
		/** */
		save()
		{
			const db = AppContainer.of(this).database;
			db.save(this.meta);
		}
	}
	
	/** */
	class ColorSchemeView
	{
		/** */
		constructor(readonly scheme: ColorScheme)
		{
			this.root = Htx.div(
				{
					display: "flex",
					justifyContent: "center",
					padding: "10px 10px 10px 5px",
					marginBottom: "10px",
					borderRadius: UI.borderRadius.large,
					borderWidth: "3px",
					borderStyle: "solid",
					borderColor: "transparent",
				},
				Htx.on(UI.clickEvt, () =>
				{
					this.select();
					this.selectedFn();
				}),
				...scheme.colors.map(color =>
				{
					return Htx.div(
						{
							width: "50px",
							height: "50px",
							marginLeft: "5px",
							borderRadius: UI.borderRadius.default,
							backgroundColor: UI.color(color),
						}
					)
				})
			);
			
			Controller.set(this);
		}
		
		readonly root;
		
		/** */
		select()
		{
			Query.siblings(this.root).map(e => e.style.borderColor = "transparent");
			this.root.style.borderColor = UI.black(0.15);
		}
		
		/** */
		setSelectedFn(fn: () => void)
		{
			this.selectedFn = fn;
		}
		private selectedFn = () => {};
	}
}
