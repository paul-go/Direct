
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
					UI.anchorCenter(600, "auto"),
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
					this.publishOptionsElement = Htx.div()
				]
			}),
			
			this.publishOptions = new Controller.Array(
				this.publishOptionsElement,
				PublishOptionView);
			
			this.addPublishOption(
				"custom-s3",
				"Use my own hosting (S3 Storage)",
				Htx.div(
					{
						padding: "60px 0",
						textAlign: "center",
						fontStyle: "italic",
						fontSize: "22px",
						opacity: "0.66",
						border: "1px solid " + UI.black(0.25),
						borderRadius: UI.borderRadius.default,
					},
					...UI.text("Coming soon")
				)
			),
			
			this.addSection({
				label: "Color Scheme",
				params: [
					Htx.div(...this.colorSchemeViews.map(v => v.root))
				]
			}),
			
			Controller.set(this);
			
			Htx.defer(this.root, () =>
			{
				const meta = AppContainer.of(this).meta;
				if (!meta.publishIdentifier)
					return;
				
				for (const publishOption of this.publishOptions)
				{
					if (publishOption.staticIdentifier === meta.publishIdentifier)
					{
						publishOption.selected = true;
						break;
					}
				}
			});
		}
		
		readonly root;
		readonly windowContents;
		private readonly colorSchemeViews;
		private readonly publishOptionsElement;
		private readonly publishOptions;
		
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
		protected addPublishOption(
			staticIdentifier: string,
			label: string,
			container: HTMLElement)
		{
			this.publishOptionsElement.prepend(
				new PublishOptionView(staticIdentifier, label, container).root);
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
	class PublishOptionView
	{
		/** */
		constructor(
			readonly staticIdentifier: string,
			label: string,
			contents: HTMLElement)
		{
			this.root = Htx.div(
				"publish-option",
				{
					display: "flex",
					flex: "1 0",
					margin: "20px 0 30px"
				},
				Htx.div(
					"option-radio",
					{
					},
					this.circle = Htx.div(
						{
							borderRadius: "100%",
							width: "40px",
							height: "40px",
							marginRight: "10px",
							boxShadow: "0 0 0 1px " + UI.black(0.3)
						},
						UI.clickable,
						Htx.on(UI.clickEvt, () => this.selected = true),
					)
				),
				Htx.div(
					{
						flex: "1 0",
						paddingTop: "6px",
					},
					Htx.div(
						...UI.text(label, 24, 500),
						Htx.on(UI.clickEvt, () => this.selected = true),
					),
					this.contents = Htx.div(
						"publish-option-contents",
						{
							marginTop: "20px",
							padding: "20px"
						},
						contents
					)
				)
			);
			
			this.selected = false;
			Controller.set(this);
		}
		
		readonly root;
		readonly circle;
		readonly contents;
		
		/** */
		get selected()
		{
			return this._selected;
		}
		set selected(selected: boolean)
		{
			if (!this._selected && selected)
			{
				const parent = this.root.parentElement;
				if (parent)
				{
					const siblings = Controller.map(parent, PublishOptionView);
					for (const sibling of siblings)
						sibling.selected = false;
				}
				
				AppContainer.of(this).meta.publishIdentifier = this.staticIdentifier;
			}
			
			this.circle.style.backgroundColor = selected ? 
				UI.black(0.1) :
				"transparent";
			
			this.contents.style.display = selected ? "block" : "none";
			this._selected = selected;
		}
		private _selected = false;
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
