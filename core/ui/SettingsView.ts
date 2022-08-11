
namespace App
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
			
			let windowElement: HTMLElement;
			const edge = parseInt(UI.borderRadius.large);
			
			this.root = Htx.div(
				"settings-view",
				UI.fixed(),
				...UI.removeOnEscape(),
				UI.removeOnClick(),
				windowElement = Htx.div(
					"window",
					UI.anchor(-edge, 0, -edge, 0),
					UI.shadow.window,
					{
						maxWidth: "700px",
						margin: "auto",
						opacity: "0",
						transform: "translateY(-20%) scale(0.9)",
						transformOrigin: "50% 50%",
						transitionProperty: "opacity, transform, border-radius",
						transitionDuration: "0.3s",
						overflowY: "auto",
						backgroundColor: "white",
						color: "black",
						padding: `${20 + edge * 2}px 20px`,
						borderRadius: 
							UI.borderRadius.large + " " +
							UI.borderRadius.large + " 0 0",
					},
					this.settingsTitle = Htx.div(
						Htx.on(document.body, "click", ev => this.doSecretClick(ev.target)),
						...UI.text("Settings", 35, 600)
					),
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
							UI.removeWithFade(this.root);
						})
					)
				),
				When.rendered(() =>
				{
					const s = windowElement.style;
					s.opacity = "1";
					s.transform = `translateY(-${edge}px) scale(1)`;
					
					const scheme = ColorScheme.fromJson(this.meta.colorScheme);
					if (!scheme)
						return;
					
					const view = this.colorSchemeViews.find(v => v.scheme === scheme);
					if (!view)
						return;
					
					view.select();
				})
			);
			
			this.addSection({
				label: "Color Scheme",
				params: [
					Htx.div(...this.colorSchemeViews.map(v => v.root))
				]
			});
			
			Cage.set(this);
		}
		
		readonly root;
		readonly windowContents;
		private readonly colorSchemeViews;
		private readonly settingsTitle;
		
		/** */
		private async doSecretClick(target: EventTarget | null)
		{
			if (target instanceof Node)
			{
				const clickedSecret = [target, ...Query.ancestors(target)].includes(this.settingsTitle);
				if (clickedSecret)
				{
					this.secretClickCount++;
					
					if (this.secretClickCount > 4)
					{
						this.secretClickCount = 0;
						const message = 
							"Are you sure you want to clear your ENTIRE cache?\n\n" +
							"This will delete EVERYTHING and there is no going back.";
						
						if (await Util.confirm(message))
							AppContainer.of(this).restartFromScratch();
					}
					
					return;
				}
			}
			
			this.secretClickCount = 0;
		}
		private secretClickCount = 0;
		
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
			
			Cage.set(this);
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
