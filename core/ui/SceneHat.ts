
namespace App
{
	const headerPadding = "25px";
	
	/** */
	export abstract class SceneHat
	{
		static readonly headerHeight = "100px";
		
		/** */
		static new(record: SceneRecord)
		{
			if (record instanceof CanvasSceneRecord)
				return new CanvasSceneHat(record);
			
			if (record instanceof GallerySceneRecord)
				return new GallerySceneHat(record);
			
			if (record instanceof ProseSceneRecord)
				return new ProseSceneHat(record);
			
			throw "Unknown record type.";
		}
		
		/** */
		constructor(readonly record: SceneRecord)
		{
			this.root = Hot.div(
				{
					backgroundColor: UI.darkGrayBackground
				},
				
				// Hide the transition configurator for the first scene hat
				Hot.css(":first-of-type .transition-configurator", { visibility: "hidden" }),
				
				// 
				Hot.css(":not(:last-of-type) .footer-box", { display: "none" }),
				
				// Controls header
				Hot.div(
					"scene-header",
					(this.headerBox = new HeightBox(this.renderDefaultHeader())).root,
					Drop.here({
						accept: MimeType.ofClass(MimeClass.image, MimeClass.video),
						dropFn: files => this.insertGalleryScene(files),
						center: new Text("Add Here")
					})
				),
				
				//
				this.sceneContainer = Hot.div(
					"scene-container",
					{
						overflow: "hidden",
						height: UI.vsize(100), 
						backgroundColor: "black",
					},
					
					Hot.css("." + CssClass.appContainerMaxed + " &", {
						borderRadius: UI.borderRadius.large,
					})
				),
				
				//
				Hot.div(
					"config-buttons-footer",
					{
						backgroundColor: UI.darkGrayBackground,
						position: "sticky",
						bottom: 0,
					},
					this.configuratorButtonsContainer = Hot.div(
						"config-buttons-width",
						{
							width: "max-content",
							maxWidth: "100%",
							margin: "auto",
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
					Hot.on(document.body, "keydown", ev =>
					{
						ev.key === "Escape" && this.deselectSceneButtons();
					})
				)).root,
				
				// Final add
				(this.footerBox = new HeightBox("footer-box", this.renderDefaultFooter())).root,
				
				When.connected(() => this.updateHue())
			)
			
			// Populate this with data in the future.
			this.transition = Transitions.slide;
			
			Hot.get(this.moreButton.root)(
				Hot.on(UI.clickEvt, ev =>
				{
					return UI.springMenu(ev.target, {
						...(this.root.previousElementSibling ? { "Move Up": () => this.moveSceneUp() } : {}),
						...(this.root.nextElementSibling ? { "Move Down": () => this.moveSceneDown() } : {}),
						"Delete": () => this.root.remove(),
					});
				})
			);
			
			this.updateHue();
			this.updateLightnessPrivate();
			this.hasColor = this.record.hasColor;
			
			Hat.wear(this);
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
			return Hot.div(
				"default-header",
				{
					display: "flex",
					height: SceneHat.headerHeight,
					paddingLeft: headerPadding,
					paddingRight: headerPadding,
				},
				Hot.div(
					"transition-configurator",
					{
						display: "flex",
						alignItems: "stretch",
						flex: "1 0",
					},
					this.transitionAnchor = Hot.a(
						UI.clickable,
						{
							fontSize: "25px",
						},
						UI.flexVCenter,
						Hot.on(UI.clickEvt, () => this.handleTransition())
					),
				),
				Hot.div(
					UI.flexVCenter,
					Icon.plus(
						Hot.on(UI.clickEvt, () => this.renderInsertScene(this.headerBox, "beforebegin")),
					),
				)
			);
		}
		
		/** */
		private renderDefaultFooter(): HTMLElement
		{
			return Hot.div(
				"insert-footer",
				{
					width: "fit-content",
					marginLeft: "auto",
					padding: headerPadding,
					paddingLeft: 0,
				},
				Icon.plus(
					Hot.on(UI.clickEvt, () => 
					{
						const hat = this.renderInsertScene(this.footerBox, "afterend");
						Hot.get(hat.root)({ marginBottom: "100px" });
					}),
				)
			);
		}
		
		/** */
		private renderInsertScene(box: HeightBox, where: InsertPosition)
		{
			const ibv = new InsertSceneHat("h");
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
		updateHue()
		{
			const colors = RenderUtil.renderColors(this.record);
			const s = this.root.style;
			s.setProperty(ConstS.lightColorProperty, colors.light);
			s.setProperty(ConstS.darkColorProperty, colors.dark);
		}
		
		/** */
		updateLightness()
		{
			this.updateLightnessPrivate();
		}
		
		/**
		 * This method is separated from the main updateLightness() method
		 * because it needs to be called directly from the constructor,
		 * without invoking any overridden versions of the method.
		 */
		private updateLightnessPrivate()
		{
			const inverted = this.record.getDarkOnLight();
			const fc = `var(${inverted ? ConstS.darkColorProperty : ConstS.lightColorProperty})`;
			const bc = `var(${inverted ? ConstS.lightColorProperty : ConstS.darkColorProperty})`;
			const fu = inverted ? "black" : "white";
			const bu = inverted ? "white" : "black";
			
			const s = this.root.style;
			s.setProperty(ConstS.foreColorProperty, fc);
			s.setProperty(ConstS.backColorProperty, bc);
			s.setProperty(ConstS.foreUncolorProperty, fu);
			s.setProperty(ConstS.backUncolorProperty, bu);
		}
		
		/** */
		get hasColor()
		{
			return this.record.hasColor;
		}
		set hasColor(hasColor: boolean)
		{
			const back = hasColor ? ConstS.backColorProperty : ConstS.backUncolorProperty;
			this.sceneContainer.style.backgroundColor = `var(${back})`;
			this.record.hasColor = hasColor;
		}
		
		/** */
		protected createToolsHeader(...params: Hot.Param[])
		{
			return Hot.div(
				"tool-buttons",
				UI.anchorTop(),
				UI.flexCenter,
				{
					zIndex: 2,
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
			...sceneButtons: SceneButtonHat[])
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
		get sceneButtons(): readonly SceneButtonHat[]
		{
			return this._sceneButtons;
		}
		private _sceneButtons: SceneButtonHat[] = [];
		
		private readonly moreButton = new SceneButtonHat("•••", {
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
		
		/** */
		private insertGalleryScene(files: FileLike[])
		{
			const galleryScene = new GallerySceneHat();
			galleryScene.importMedia(files);
			this.root.before(galleryScene.root);
		}
	}
}
