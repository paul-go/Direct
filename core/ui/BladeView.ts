
namespace Turf
{
	const headerPadding = "25px";
	
	/** */
	export abstract class BladeView
	{
		static readonly headerHeight = "100px";
		
		/** */
		static new(record: BladeRecord)
		{
			if (record instanceof CaptionedBladeRecord)
				return new CaptionedBladeView(record);
			
			if (record instanceof GalleryBladeRecord)
				return new GalleryBladeView(record);
			
			if (record instanceof ProseBladeRecord)
				return new ProseBladeView(record);
			
			throw "Unknown record type.";
		}
		
		/** */
		constructor(readonly record: BladeRecord)
		{
			this.root = Htx.div(
				"blade-view",
				{
					backgroundColor: UI.darkGrayBackground
				},
				
				// Hide the transition configurator for the first blade view
				Htx.css(":first-of-type .transition-configurator", { visibility: "hidden" }),
				
				// 
				Htx.css(":not(:last-of-type) .footer-box", { display: "none" }),
				
				// Controls header
				Htx.div(
					"blade-header",
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
						boxShadow:
							"inset 0 1px 0 " + UI.white(0.15) + ", " +
							"inset 0 -1px 0 " + UI.white(0.15)
					},
				),
				
				//
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
				
				//
				(this.configuratorContainer = new HeightBox(
					"config-container",
					{
						padding: "0 30px 30px"
					}
				)).root,
				
				// Final add
				(this.footerBox = new HeightBox("footer-box", this.renderDefaultFooter())).root,
				
				When.connected(() => this.updateBackgroundColor())
			)
			
			// Populate this with data in the future.
			this.transition = Transitions.slide;
			
			Htx.from(this.moreButton.root)(
				Htx.on(UI.clickEvt, ev => UI.springMenu(ev.target, {
					"Move Up": () => {},
					"Move Down": () => {},
					"Delete": () => this.root.remove(),
				}))
			);
			
			Controller.set(this);
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
					height: BladeView.headerHeight,
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
					UI.plusButton(
						Htx.on(UI.clickEvt, () => this.renderInsertBlade(this.headerBox, "beforebegin")),
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
				UI.plusButton(
					Htx.on(UI.clickEvt, () => 
					{
						const view = this.renderInsertBlade(this.footerBox, "afterend");
						Htx.from(view.root)({ marginBottom: "100px" });
					}),
				)
			);
		}
		
		/** */
		private renderInsertBlade(box: HeightBox, where: InsertPosition)
		{
			const ibv = new InsertBladeView("h");
			ibv.setInsertCallback(blade =>
			{
				this.root.insertAdjacentElement(where, blade.root);
				box.back();
			});
			ibv.setCancelCallback(() => box.back());
			box.push(ibv.root);
			return ibv;
		}
		
		/** */
		updateBackgroundColor()
		{
			Controller.under(this, ForegroundView)?.updateTextColor();
			const meta = AppContainer.of(this).meta;
			const colorIndex = this.record.backgroundColorIndex;
			const color = RenderUtil.resolveBackgroundColor(colorIndex, meta);
			this.sceneContainer.style.backgroundColor = UI.color(color);
		}
		
		/** */
		protected setBladeButtons(
			changedFn: () => void,
			...bladeButtons: BladeButtonView[])
		{
			this._bladeButtons = bladeButtons;
			this.bladeButtonsSelectedChangedFn = changedFn;
			
			for (const bb of bladeButtons)
			{
				this.configuratorButtonsContainer.append(bb.root);
				bb.setSelectedChangedFn(changedFn);
			}	
			
			this.configuratorButtonsContainer.append(
				...bladeButtons.map(bb => bb.root),
				this.moreButton.root
			);
		}
		
		private bladeButtonsSelectedChangedFn = () => {};
		
		/**
		 * Deselects all blade buttons, and hides any displayed configurators,
		 * and runs the provided selected changed function.
		 */
		protected deselectBladeButtons()
		{
			let changed = false;
			
			for (const bb of this.bladeButtons)
			{
				if (bb.selected)
					changed = true;
				
				bb.selected = false;
			}
			
			if (changed)
			{
				this.setBladeConfigurator(null);
				this.bladeButtonsSelectedChangedFn();
			}
		}
		
		/** */
		get bladeButtons(): readonly BladeButtonView[]
		{
			return this._bladeButtons;
		}
		private _bladeButtons: BladeButtonView[] = [];
		
		private readonly moreButton = new BladeButtonView("•••", {
			selectable: false,
		});
		
		/** */
		protected setBladeConfigurator(e: HTMLElement | null)
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
			
			if (this.transitionAnchor)
				this.transitionAnchor.innerHTML = `<b>Transition</b>&nbsp;&#8212; ${value.label}`;
		}
		private _transition = Transitions.slide;
		
		/** */
		protected createMediaRecords(
			files: FileLike[],
			accept: MimeClass[] = [MimeClass.image])
		{
			const records: MediaRecord[] = [];
			
			for (const file of files)
			{
				const mimeType = MimeType.from(file.type);
				if (!mimeType)
					continue;
				
				if (!accept.includes(MimeType.getClass(file.type)))
					continue;
				
				const record = new MediaRecord();
				record.blob = new Blob([file.data], { type: file.type });
				record.name = file.name;
				record.type = mimeType;
				records.push(record);
			}
		
			return records;
		}
	}
}
