
namespace App
{
	const headerPadding = "25px";
	
	/** */
	export abstract class SceneView
	{
		static readonly headerHeight = "100px";
		
		/** */
		static new(record: SceneRecord)
		{
			if (record instanceof AttentionSceneRecord)
				return new AttentionSceneView(record);
			
			if (record instanceof GallerySceneRecord)
				return new GallerySceneView(record);
			
			if (record instanceof ProseSceneRecord)
				return new ProseSceneView(record);
			
			throw "Unknown record type.";
		}
		
		/** */
		constructor(readonly record: SceneRecord)
		{
			this.root = Htx.div(
				"scene-view",
				{
					backgroundColor: UI.darkGrayBackground
				},
				
				// Hide the transition configurator for the first scene view
				Htx.css(":first-of-type .transition-configurator", { visibility: "hidden" }),
				
				// 
				Htx.css(":not(:last-of-type) .footer-box", { display: "none" }),
				
				// Controls header
				Htx.div(
					"scene-header",
					(this.headerBox = new HeightBox(this.renderDefaultHeader())).root,
					...UI.dripper(new Text("Add Here"))
				),
				
				//
				this.sceneContainer = Htx.div(
					"scene-container",
					{
						overflow: "hidden",
						height: UI.vsize(100), 
						backgroundColor: "black",
					},
				),
				
				//
				Htx.div(
					{
						backgroundColor: UI.darkGrayBackground,
						position: "sticky",
						bottom: "0",
					},
					this.configuratorButtonsContainer = Htx.div(
						"config-buttons-container",
						{
							width: "max-content",
							maxWidth: "100%",
							margin: "auto",
							paddingBottom: "20px",
							overflowX: "auto",
							overflowY: "scroll",
							color: "white",
							textAlign: "center",
							whiteSpace: "nowrap",
						}
					),
				),
				
				//
				(this.configuratorContainer = new HeightBox(
					"config-container",
					{
						padding: "0 30px 30px"
					},
					Htx.on(document.body, "keydown", ev =>
					{
						ev.key === "Escape" && this.deselectSceneButtons();
					})
				)).root,
				
				// Final add
				(this.footerBox = new HeightBox("footer-box", this.renderDefaultFooter())).root,
				
				When.connected(() => this.updateBackgroundColor())
			)
			
			// Populate this with data in the future.
			this.transition = Transitions.slide;
			
			Htx.from(this.moreButton.root)(
				Htx.on(UI.clickEvt, ev =>
				{
					return UI.springMenu(ev.target, {
						...(this.root.previousElementSibling ? { "Move Up": () => this.moveSceneUp() } : {}),
						...(this.root.nextElementSibling ? { "Move Down": () => this.moveSceneDown() } : {}),
						"Delete": () => this.root.remove(),
					});
				})
			);
			
			Cage.set(this);
		}
		
		readonly root: HTMLDivElement;
		private readonly headerBox;
		private readonly footerBox;
		readonly sceneContainer;
		readonly configuratorButtonsContainer;
		readonly configuratorContainer;
		private transitionAnchor: HTMLAnchorElement | null = null;
		
		/** */
		private renderDefaultHeader(): HTMLElement
		{
			return Htx.div(
				"default-header",
				{
					display: "flex",
					height: SceneView.headerHeight,
					paddingLeft: headerPadding,
					paddingRight: headerPadding,
				},
				Htx.div(
					"transition-configurator",
					{
						display: "flex",
						alignItems: "stretch",
						flex: "1 0",
					},
					this.transitionAnchor = Htx.a(
						UI.clickable,
						{
							fontSize: "25px",
						},
						UI.flexVCenter,
						Htx.on(UI.clickEvt, () => this.handleTransition())
					),
				),
				Htx.div(
					UI.flexVCenter,
					Icon.plus(
						Htx.on(UI.clickEvt, () => this.renderInsertScene(this.headerBox, "beforebegin")),
					),
				)
			);
		}
		
		/** */
		private renderDefaultFooter(): HTMLElement
		{
			return Htx.div(
				"insert-footer",
				{
					direction: "rtl",
					padding: headerPadding,
					paddingLeft: "0",
				},
				Icon.plus(
					Htx.on(UI.clickEvt, () => 
					{
						const view = this.renderInsertScene(this.footerBox, "afterend");
						Htx.from(view.root)({ marginBottom: "100px" });
					}),
				)
			);
		}
		
		/** */
		private renderInsertScene(box: HeightBox, where: InsertPosition)
		{
			const ibv = new InsertSceneView("h");
			ibv.setInsertCallback(scene =>
			{
				this.root.insertAdjacentElement(where, scene.root);
				box.back();
			});
			ibv.setCancelCallback(() => box.back());
			box.push(ibv.root);
			return ibv;
		}
		
		/** */
		updateBackgroundColor()
		{
			Cage.under(this, ForegroundMixin)?.updateTextColor();
			const meta = AppContainer.of(this).meta;
			const colorIndex = this.record.backgroundColorIndex;
			const color = RenderUtil.resolveBackgroundColor(colorIndex, meta);
			this.sceneContainer.style.backgroundColor = UI.color(color);
		}
		
		/** */
		protected createToolsHeader(...params: Htx.Param[])
		{
			return Htx.div(
				"tool-buttons",
				UI.anchorTop(),
				UI.flexCenter,
				{
					zIndex: "2",
				},
				...params,
			);
		}
		
		/**
		 * Creates a tool button for the toolbar that renders on top of the scene.
		 * If the label is prefixed with +, this is converted into a UI plus button.
		 */
		protected createToolButton(label: string, click: () => void)
		{
			const hasPlus = label.startsWith("+");
			
			if (hasPlus)
				label = label.slice(1).trim();
			
			return UI.toolButton(
				{
					margin: "10px 5px 0",
				},
				hasPlus && Icon.plus(
					{
						width: "15px",
						height: "15px",
						marginRight: "20px",
						transitionProperty: "transform",
						transitionDuration: "0.25s",
						transform: "rotate(0deg)",
						transformOrigin: "50% 50%",
					}
				),
				...UI.click(ev =>
				{
					ev.preventDefault();
					this.deselectSceneButtons();
					click();
				}),
				new Text(label)
			);
		}
		
		/** */
		protected setSceneButtons(
			changedFn: () => void,
			...sceneButtons: SceneButtonView[])
		{
			this._sceneButtons = sceneButtons;
			this.sceneButtonsSelectedChangedFn = changedFn;
			
			for (const btn of sceneButtons)
			{
				this.configuratorButtonsContainer.append(btn.root);
				btn.setSelectedChangedFn(changedFn);
			}
			
			this.configuratorButtonsContainer.append(
				...sceneButtons.map(bb => bb.root),
				this.moreButton.root
			);
			
			new MutationObserver(() =>
			{
				sceneButtons.map(b => b.selected && b.updateIndicator());
				
			}).observe(this.configuratorButtonsContainer, { 
				childList: true,
				subtree: true,
				characterData: true,
				attributes: true
			});
		}
		
		private sceneButtonsSelectedChangedFn = () => {};
		
		/**
		 * Deselects all scene buttons, and hides any displayed configurators,
		 * and runs the provided selected changed function.
		 */
		protected deselectSceneButtons()
		{
			let changed = false;
			
			for (const bb of this.sceneButtons)
			{
				if (bb.selected)
					changed = true;
				
				bb.selected = false;
			}
			
			if (changed)
			{
				this.setSceneConfigurator(null);
				this.sceneButtonsSelectedChangedFn();
			}
		}
		
		/** */
		get sceneButtons(): readonly SceneButtonView[]
		{
			return this._sceneButtons;
		}
		private _sceneButtons: SceneButtonView[] = [];
		
		private readonly moreButton = new SceneButtonView("•••", {
			selectable: false,
		});
		
		/** */
		protected setSceneConfigurator(e: HTMLElement | null)
		{
			this.configuratorContainer.replace(e);
		}
		
		/** */
		private handleTransition()
		{
			// Display the transition screen and then set the local property when done
		}
		
		/** */
		get transition()
		{
			return this._transition;
		}
		set transition(value: Animation)
		{
			this._transition = value;
			
			//if (this.transitionAnchor)
			//	this.transitionAnchor.innerHTML = `<b>Transition</b>&nbsp;&#8212; ${value.label}`;
		}
		private _transition = Transitions.slide;
		
		/** */
		protected createMediaRecords(
			files: FileLike[],
			guardedMimes?: MimeClass[])
		{
			const records: MediaRecord[] = [];
			
			for (const file of files)
			{
				const mimeType = MimeType.from(file.type);
				if (!mimeType)
					continue;
				
				if (guardedMimes && !guardedMimes.includes(MimeType.getClass(file.type)))
					continue;
				
				const record = new MediaRecord();
				record.blob = new Blob([file.data], { type: file.type });
				record.name = file.name;
				record.type = mimeType;
				records.push(record);
			}
		
			return records;
		}
		
		/** */
		private moveSceneUp()
		{
			this.root.previousElementSibling?.before(this.root);
			this.root.scrollIntoView({ behavior: "smooth" });
		}
		
		/** */
		private moveSceneDown()
		{
			this.root.nextElementSibling?.after(this.root);
			this.root.scrollIntoView({ behavior: "smooth" });
		}
	}
}
