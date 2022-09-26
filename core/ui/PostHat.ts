
namespace App
{
	/** */
	export class PostHat
	{
		readonly head;
		
		/**
		 * Creates a new PostHat instance, which is populated with data
		 * from the specified PostRecord. If the PostRecord argument is
		 * omitted, this indicates that this PostHat should create it a new, 
		 * unsaved record.
		 */
		constructor(record?: PostRecord, isHomePost?: "home")
		{
			this.record = record || (() =>
			{
				const post = new PostRecord();
				post.slug = Util.generatePostSlug();
				return post;
			})();
			
			this._isKeepingRecord = !!record;
			const minHeight: Hot.Param = { minHeight: isHomePost ? "85vh" : "100vh" };
			
			this.head = Hot.div(
				"post-hat",
				{
					backgroundColor: UI.darkGrayBackground,
				},
				Hot.div(
					"post-hat-width",
					UI.editorMaxWidth(),
					{
						paddingBottom: "10px",
						transitionDuration: "0.5s",
						transitionProperty: "transform, opacity",
						transformOrigin: "0 0",
						opacity: 1,
					},
					minHeight,
					this.scenesElement = Hot.div(
						"scenes-element",
						minHeight,
					),
					
					Hot.div(
						"no-scenes-message",
						UI.anchor(),
						UI.flexCenter,
						UI.visibleWhenEmpty(this.scenesElement),
						minHeight,
						{
							zIndex: 1,
						},
						(this.noScenesBox = new HeightBox(this.renderNoScenes())).head,
					),
					
					this.footerElement = Hot.div(
						"footer",
						{
							padding: "0 20px",
							display: "none",
						},
						UI.visibleWhenNotEmpty(this.scenesElement),
						
						Hot.div(
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
								Hot.on(UI.clickEvt, () =>
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
									Hot.on(UI.clickEvt, ev =>
									{
										this.setupPublish();
										ev.stopPropagation();
									}),
								)
							)
						),
						this.publishInfoElement = Hot.div("publish-info")
					),
				)
			);
			
			this.scenes = new Hat.Array(this.scenesElement, SceneHat);
			this.scenes.insert(...this.record.scenes.map(b => SceneHat.new(b)));
			this.scenes.observe(() =>
			{
				this.footerElement.style.display = this.scenes.length > 0 ? "block" : "none";
				this.save();
			});
			
			this.updatePublishInfo();
			Hat.wear(this);
		}
		
		readonly scenes;
		readonly record;
		private readonly scenesElement;
		private readonly footerElement;
		private readonly settingsButtonElement;
		private readonly noScenesBox;
		private publishInfoElement;
		
		/** */
		private renderNoScenes()
		{
			return Hot.div(
				"add-first-scene",
				Hot.div(
					UI.presentational,
					{
						fontSize: "30px",
						fontWeight: 600,
						marginBottom: "30px",
					},
					new Text("This post has no scenes."),
				),
				UI.actionButton("filled", 
					{
						marginTop: "10px",
					},
					Hot.on(UI.clickEvt, () =>
					{
						const ibv = new InsertSceneHat("v");
						ibv.setCancelCallback(() => this.noScenesBox.back());
						ibv.setInsertCallback(scene =>
						{
							this.scenesElement.append(scene.head);
						});
						this.noScenesBox.push(ibv.head);
					}),
					new Text("Add One"),
				)
			);
		}
		
		/** */
		get isKeepingRecord()
		{
			return this._isKeepingRecord;
		}
		private _isKeepingRecord = false;
		
		/** */
		private save()
		{
			this._isKeepingRecord = true;
			this.record.scenes = this.scenes.map(hat => hat.record);
			AppContainer.of(this).blog.retainPost(this.record);
			this.record.dateModified = Date.now();
		}
		
		/** */
		private handlePreview()
		{
			const blog = AppContainer.of(this).blog;
			new PreviewHat(this.record, blog);
		}
		
		/** */
		private async tryPublish()
		{
			const blog = AppContainer.of(this).blog;
			const publisher = Publisher.getCurrentPublisher(this.record, blog);
			
			if (publisher?.canPublish())
			{
				if (publisher.canHaveSlug && !Util.isSlugValid(this.slugInput?.textContent || ""))
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
			const publishSetupHat = new PublishSetupHat(this.record, app);
			this.head.append(publishSetupHat.head);
		}
		
		/** */
		async updatePublishInfo()
		{
			When.connected(this.publishInfoElement, () =>
			{
				const blog = AppContainer.of(this).blog;
				const publisher = Publisher.getCurrentPublisher(this.record, blog);
				const dstRoot = publisher?.getPublishDestinationRoot();
				
				this.publishInfoElement.replaceWith(this.publishInfoElement = Hot.div(
					"publish-info",
					{
						margin: "40px auto",
						paddingBottom: "50px",
						color: UI.white(0.5),
						textAlign: "center",
						lineHeight: 1.5,
						verticalAlign: "top",
					},
					
					dstRoot && Hot.span(
						{
							paddingRight: "10px",
							opacity: 0.66,
							whiteSpace: "nowrap",
							verticalAlign: "bottom",
						},
						...UI.text("Publishes to:", 24, 600)
					),
					
					dstRoot && Hot.span(
						{
							display: "inline-block",
							maxWidth: (ConstN.appMaxWidth - 250) + "px",
							fontSize: "24px",
							fontWeight: 800,
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
			return this.slugInput = Hot.span(e => [
				Editable.single({
					placeholderText: "...Enter a slug...",
					placeholderCss: {
						opacity: 1
					}
				}),
				{
					color: "white",
					textAlign: "left",
				},
				Hot.on("input", () =>
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
}
