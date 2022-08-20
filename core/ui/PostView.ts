
namespace App
{
	/** */
	export class PostView
	{
		/**
		 * Creates a new PostView instance, which is populated with data
		 * from the specified PostRecord. If the PostRecord argument is
		 * omitted, this indicates that this PostView should create it a new, 
		 * unsaved record.
		 */
		constructor(record?: PostRecord)
		{
			this.record = record || (() =>
			{
				const post = new PostRecord();
				post.slug = Util.generatePostSlug();
				return post;
			})();
			
			this.isNewRecord = !record;
			
			this.root = Htx.div(
				"post-view",
				Htx.on(window, "scroll", () => this.toggleHeader(window.scrollY > 0)),
				
				UI.anchorTop(),
				UI.appMaxWidth(),
				{
					paddingBottom: "10px",
					transitionDuration: "0.5s",
					transitionProperty: "transform, opacity",
					transformOrigin: "0 0",
					opacity: "1",
				},
				minHeight,
				this.scenesElement = Htx.div(
					"scenes-element",
					minHeight,
				),
				
				Htx.div(
					"no-scenes-message",
					UI.anchor(),
					UI.flexCenter,
					UI.visibleWhenEmpty(this.scenesElement),
					minHeight,
					{
						zIndex: "1",
					},
					(this.noScenesBox = new HeightBox(this.renderNoScenes())).root,
				),
				
				this.footerElement = Htx.div(
					"footer",
					{
						padding: "0 20px",
					},
					UI.visibleWhenNotEmpty(this.scenesElement),
					
					Htx.div(
						{
							width: "fit-content",
							minWidth: "400px",
							margin: "auto",
						},
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
							this.settingsButtonElement = Icon.settings(
								CssClass.hide,
								{
									position: "absolute",
									right: "-2.75em",
									width: "30px",
									height: "30px",
								},
								Htx.on(UI.clickEvt, ev =>
								{
									this.setupPublish();
									ev.stopPropagation();
								}),
							)
						)
					),
					this.publishInfoElement = Htx.div("publish-info")
				),
				
				this.headerScreen = Htx.div(
					"header-screen",
					{
						position: "fixed",
						top: "0",
						height: SceneView.headerHeight,
						transitionDuration: "0.33s",
						transitionProperty: "background-color",
						padding: "25px",
						// Elevate the chevron so that it goes above the "no scenes" message
						zIndex: "1",
						borderBottomRightRadius: UI.borderRadius.large,
					},
					!TAURI && Htx.css("." + CssClass.appContainerMaxed + " &", {
						borderBottomLeftRadius: UI.borderRadius.large
					}),
					
					UI.clickable,
					Htx.on("click", () => this.handleBack()),
					Icon.chevron(
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
			
			this.scenes = new Hat.Array(this.scenesElement, SceneView);
			this.scenes.insert(...this.record.scenes.map(b => SceneView.new(b)));
			this.scenes.observe(() =>
			{
				this.footerElement.style.display = this.scenes.length > 0 ? "block" : "none";
				this.save();
			});
			
			this.updatePublishInfo();
			Hat.wear(this);
		}
		
		readonly root;
		readonly scenes;
		private readonly record;
		private readonly headerScreen;
		private readonly scenesElement;
		private readonly footerElement;
		private readonly settingsButtonElement;
		private readonly noScenesBox;
		private readonly isNewRecord: boolean;
		private publishInfoElement;
		
		/** */
		private renderNoScenes()
		{
			return Htx.div(
				"add-first-scene",
				Htx.div(
					UI.presentational,
					{
						fontSize: "30px",
						fontWeight: "600",
						marginBottom: "30px",
					},
					new Text("This post has no scenes."),
				),
				UI.actionButton("filled", 
					{
						marginTop: "10px",
					},
					Htx.on(UI.clickEvt, () =>
					{
						const ibv = new InsertSceneView("v");
						ibv.setCancelCallback(() => this.noScenesBox.back());
						ibv.setInsertCallback(scene =>
						{
							this.scenesElement.append(scene.root);
						});
						this.noScenesBox.push(ibv.root);
					}),
					new Text("Add One"),
				)
			);
		}
		
		/** */
		private save()
		{
			this.record.scenes = this.scenes.map(view => view.record);
		}
		
		/** */
		setKeepCallback(fn: (post: PostRecord) => void)
		{
			this.keepFn = fn;
		}
		private keepFn = (post: PostRecord) => {};
		
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
			
			// If there is no BlogView sitting behind this PostView, its because
			// the application launched directly into a PostView for editing the
			// home page, and so we need to insert a new BlogView.
			if (!Query.find(CssClass.blogView, AppContainer.of(this).root))
			{
				const blogView = new BlogView();
				const app = AppContainer.of(this);
				app.root.prepend(blogView.root);
				await UI.wait();
				const s = this.root.style;
				s.opacity = "0";
				s.transform = "scale(0.3333)";
				await UI.waitTransitionEnd(this.root);
				this.root.remove();
			}
			else
			{
				if (this.isNewRecord && this.scenes.length > 0)
					this.keepFn(this.record);
				
				this.backFn();
			}
		}
		
		/** */
		private handlePreview()
		{
			const meta = AppContainer.of(this).meta;
			new PreviewView(this.record, meta);
		}
		
		/** */
		private async tryPublish()
		{
			const app = AppContainer.of(this);
			const meta = app.meta;
			const publisher = Publisher.getCurrentPublisher(this.record, meta);
			
			if (publisher?.canPublish())
			{
				if (publisher.canHaveSlug &&  !Util.isSlugValid(this.slugInput?.textContent || ""))
				{
					await Util.alert("Please enter a valid slug before publishing.");
					
					// Need to wait after the alert has been closed
					// before setting the focus, or it won't work.
					setTimeout(() => this.slugInput?.focus(), 100);
				}
				else
				{
					publisher.publish();
				}
			}
			else this.setupPublish();
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
				const dstRoot = publisher?.getPublishDestinationRoot();
				
				this.publishInfoElement.replaceWith(this.publishInfoElement = Htx.div(
					"publish-info",
					{
						margin: "40px auto",
						paddingBottom: "50px",
						color: UI.white(0.5),
						textAlign: "center",
						lineHeight: "1.5",
						verticalAlign: "top",
					},
					
					dstRoot && Htx.span(
						{
							paddingRight: "10px",
							opacity: "0.66",
							whiteSpace: "nowrap",
							verticalAlign: "bottom",
						},
						...UI.text("Publishes to:", 24, 600)
					),
					
					dstRoot && Htx.span(
						{
							display: "inline-block",
							maxWidth: (ConstN.appMaxWidth - 250) + "px",
							fontSize: "24px",
							fontWeight: "800",
							verticalAlign: "bottom",
							textAlign: "left",
							wordBreak: "break-all"
						},
						new Text(dstRoot),
						
						publisher?.canHaveSlug && this.renderSlugEditor(),
						dstRoot && Icon.openExternal(
							{
								top: "0.25em",
								left: "0.75em",
							},
							...UI.click(() => publisher?.openOutput())
						)
					),
				));
				
				UI.toggle(this.settingsButtonElement, !!publisher);
			});
		}
		
		/** */
		private renderSlugEditor()
		{
			return this.slugInput = Htx.span(e => [
				Editable.single({
					placeholderText: "...Enter a slug...",
					placeholderCss: {
						opacity: "1"
					}
				}),
				{
					color: "white",
					textAlign: "left",
				},
				Htx.on("input", () =>
				{
					const slug = e.textContent = (e.textContent || "").toLocaleLowerCase();
					const valid = Util.isSlugValid(slug);
					e.style.color = !slug || valid ? "white" : "red";
					
					if (valid)
						this.record.slug = slug;
				}),
				this.record.slug ? new Text(this.record.slug) : null
			]);
		}
		private slugInput: HTMLElement | null = null;
	}
	
	const minHeight: Htx.Param = { minHeight: "85vh" };
}
