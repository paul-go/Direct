
namespace Turf
{
	/** */
	export class PatchView
	{
		/**
		 * Creates a new PatchView instance, which is populated with data
		 * from the specified PatchRecord. If the PatchRecord argument is
		 * omitted, this indicates that this PatchView should create it a new, 
		 * unsaved record.
		 */
		constructor(record?: PatchRecord)
		{
			this.record = record || (() =>
			{
				const patch = new PatchRecord();
				patch.slug = Util.generatePatchSlug();
				return patch;
			})();
			
			this.isNewRecord = !record;
			const minHeight: Htx.Param = { minHeight: "85vh" };
			
			this.root = Htx.div(
				"patch-view",
				
				Htx.on(window, "scroll", () => this.toggleHeader(window.scrollY > 0)),
				
				UI.anchorTop(),
				{
					minHeight: "100vh",
					paddingBottom: "10px",
					transitionDuration: "0.5s",
					transitionProperty: "transform, opacity",
					transformOrigin: "0 0",
					opacity: "1",
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
							Htx.on(UI.clickEvt, () => this.handleAddFirst()),
							new Text("Add One"),
						)
					),
				),
				
				this.footerElement = Htx.div(
					"footer",
					{
						width: "fit-content",
						minWidth: "400px",
						margin: "auto",
						padding: "0 20px",
					},
					UI.visibleWhenNotEmpty(this.bladesElement),
					
					UI.actionButton(
						"filled",
						{ maxWidth: "400px" },
						...UI.click(() => this.handlePreview()),
						new Text("Preview")
					),
					UI.clickLabel(
						"publish-button",
						{
							margin: "10px auto",
							padding: "20px",
							width: "min-content",
						},
						Htx.on(UI.clickEvt, () =>
						{
							this.tryPublish();
						}),
						...UI.text("Publish", 25, 800),
					),
					this.publishInfoElement = Htx.div("publish-info")
				),
				
				this.headerScreen = Htx.div(
					"header-screen",
					{
						position: "fixed",
						top: "0",
						left: "0",
						borderBottomRightRadius: UI.borderRadius.large,
						height: BladeView.headerHeight,
						transitionDuration: "0.33s",
						transitionProperty: "background-color",
						padding: "25px",
						// Elevate the chevron so that it goes above the "no blades" message
						zIndex: "1",
					},
					UI.clickable,
					Htx.on("click", () => this.handleBack()),
					UI.chevron(
						Origin.left,
						TAURI && {
							width: "20px",
							height: "20px",
							top: "20px",
							left: "3px"
						},
						!TAURI && {
							top: "12px",
							left: "5px",
						},
					),
				),
			);
			
			this.blades = new Controller.Array(this.bladesElement, BladeView);
			this.blades.insert(...this.record.blades.map(b => BladeView.new(b)));
			this.blades.observe(() =>
			{
				this.footerElement.style.display = this.blades.length > 0 ? "block" : "none";
				this.save();
			});
			
			this.updatePublishInfo();
			
			Controller.set(this);
		}
		
		readonly root;
		readonly blades;
		private readonly record;
		private readonly headerScreen;
		private readonly bladesElement;
		private readonly footerElement;
		private readonly isNewRecord: boolean;
		private publishInfoElement;
		
		/** */
		private save()
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
		private toggleHeader(visible: boolean)
		{
			Htx.from(this.headerScreen)(
				{ backgroundColor: visible ? UI.gray(128, 0.25) : "transparent" },
				UI.backdropBlur(visible ? 8 : 0)
			);
		}
		
		/** */
		private async handleBack()
		{
			this.save();
			
			// If there is no PatchesView sitting behind this PatchView, its because
			// the application launched directly into a PatchView for editing the
			// home page, and so we need to insert a new PatchesView.
			if (Query.find(CssClass.patchesView, AppContainer.of(this).root).length === 0)
			{
				const patchesView = new PatchesView();
				const app = AppContainer.of(this);
				app.root.prepend(patchesView.root);
				await UI.wait();
				const s = this.root.style;
				s.opacity = "0";
				s.transform = "scale(0.3333)";
				await UI.waitTransitionEnd(this.root);
				this.root.remove();
			}
			else
			{
				if (this.isNewRecord && this.blades.length > 0)
					this.keepFn(this.record);
				
				this.backFn();
			}
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
			const meta = AppContainer.of(this).meta;
			new PreviewView(this.record, meta);
		}
		
		/** */
		private tryPublish()
		{
			const app = AppContainer.of(this);
			const meta = app.meta;
			const publisher = Publisher.getCurrentPublisher(this.record, meta);
			
			if (publisher?.canPublish())
				publisher.publish();
			else
				this.setupPublish();
		}
		
		/** */
		private setupPublish()
		{
			const app = AppContainer.of(this);
			const publishSetupView = new PublishSetupView(this.record, app);
			this.root.append(publishSetupView.root);
		}
		
		/** */
		async updatePublishInfo()
		{
			When.connected(this.publishInfoElement, () =>
			{
				const meta = AppContainer.of(this).meta;
				const publisher = Publisher.getCurrentPublisher(this.record, meta);
				const dstText = publisher?.getPublishDestinationText() || "";
				
				this.publishInfoElement.replaceWith(this.publishInfoElement = Htx.div(
					"publish-info",
					{
						height: "1.6em",
						margin: "40px 0",
						color: UI.white(0.5),
						textAlign: "center",
					},
					
					dstText && UI.settingsIcon(
						{
							position: "absolute",
							right: "-1.5em",
							width: "30px",
							height: "30px",
						},
						...UI.click(() => this.setupPublish())
					),
					
					dstText && Htx.span(
						...UI.text("Publish to: ", 24, 600)
					),
					
					dstText && Htx.span(
						{
							maxWidth: "8em",
							verticalAlign: "bottom",
							overflow: "hidden",
							display: "inline-block",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						},
						...UI.text(dstText, 24, 800)
					),
				))
			});
		}
	}
}
