
namespace Turf
{
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
			
			if (record instanceof VideoBladeRecord)
				return new VideoBladeView(record);
			
			throw "Unknown record type.";
		}
		
		/** */
		constructor(readonly record: BladeRecord)
		{
			const headerPadding = "25px";
			
			this.root = Htx.div(
				"blade-view",
				
				{
					backgroundColor: UI.darkGrayBackground
				},
				
				// Hide the transition configurator for the first blade view
				Htx.css(":first-of-type .transition-configurator", { visibility: "hidden" }),
				
				// 
				Htx.css(":not(:last-of-type) .final-add", { display: "none" }),
				
				// Controls header
				Htx.div(
					"blade-header",
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
							Htx.on(UI.clickEvt, () => this.handleAdd("beforebegin")),
						),
					),
					...UI.dripper(
						new Text("Add Here"),
					)
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
				Htx.div(
					"final-add",
					{
						direction: "rtl",
						padding: headerPadding,
						paddingLeft: "0",
					},
					UI.plusButton(
						Htx.on(UI.clickEvt, () => this.handleAdd("afterend")),
					),
				)
			);
			
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
			Saver.set(this);
		}
		
		readonly root: HTMLDivElement;
		readonly sceneContainer;
		readonly configuratorButtonsContainer;
		readonly configuratorContainer;
		readonly backgroundChanged = new Force();
		
		/** */
		protected setBladeButtons(
			changedFn: () => void,
			...bladeButtons: BladeButtonView[])
		{
			this._bladeButtons = bladeButtons;
			
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
			this.configuratorContainer.setItem(e);
		}
		
		/** */
		private async handleAdd(where: InsertPosition)
		{
			const view = await AddBladeView.show(this.root);
			if (view)
				this.root.insertAdjacentElement(where, view.root);
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
			this.transitionAnchor.innerHTML = `<b>Transition</b>&nbsp;&#8212; ${value.label}`;
		}
		private _transition = Transitions.slide;
		
		private readonly transitionAnchor: HTMLAnchorElement;
		
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
				record.blob = new Blob([file.data]);
				record.name = file.name;
				record.type = mimeType;
				records.push(record);
			}
		
			return records;
		}
		
		/** */
		abstract save(): void;
	}
}
