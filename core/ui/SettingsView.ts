
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
				"settings-view",
				UI.fixed(),
				...UI.removeOnEscape(),
				UI.removeOnClick(),
				Htx.div(
					"window",
					{
						overflowY: "auto",
					},
					UI.anchorCenter("85vw", "auto"),
					UI.shadow.window,
					{
						backgroundColor: "white",
						color: "black",
						padding: "20px",
						borderRadius: UI.borderRadius.large,
						maxHeight: "80vh",
					},
					Htx.div(...UI.text("Settings", 35, 600)),
					this.windowContents = Htx.div(
						"window-contents",
					),
					Htx.div(
						"closer",
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
			
			this.addSection({
				label: "Publishing",
				params: [
					this.publishConfiguratorsElement = Htx.div("publish-configurators")
				]
			}),
			
			Htx.defer(this.root, () =>
			{
				for (const configurator of PublishConfigurator.all)
				{
					const cfg = new configurator(this.meta);
					cfg.selected = cfg.publisherType.identifier === this.meta.publishMethod;
					this.publishConfiguratorsElement.append(cfg.root);
				}
			});
			
			this.addSection({
				label: "Color Scheme",
				params: [
					Htx.div(...this.colorSchemeViews.map(v => v.root))
				]
			});
			
			Controller.set(this);
		}
		
		readonly root;
		readonly windowContents;
		private readonly colorSchemeViews;
		private readonly publishConfiguratorsElement;
		
		/** */
		private addSection(options: { label: string, params: Htx.Param[] })
		{
			Htx.from(this.windowContents)(
				Htx.div(
					{
						padding: "1em 0",
					},
					...UI.text(options.label, 25, 600),
				),
				...options.params
			);
		}
		
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
