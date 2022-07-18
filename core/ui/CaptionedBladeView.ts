
/** */
namespace Turf
{
	/** */
	export class CaptionedBladeView extends BladeView
	{
		/** */
		constructor(readonly record = new CaptionedBladeRecord())
		{
			super(record);
			
			this.titleView = new CaptionedTitleView();
			this.descriptionView = new CaptionedDescriptionView();
			this.buttonsContainer = Htx.div("buttons");
			this.buttons = new Controller.Array(this.buttonsContainer, CaptionedButton);
			
			Htx.from(this.sceneContainer)(
				...UI.dripper(
					Htx.div(
						UI.dripperStyle("top"),
						new Text("Add Content Image")
					),
					Htx.div(
						UI.dripperStyle("bottom"),
						new Text("Add Background Image")
					),
					Htx.on("drop", ev => this.handleMediaDrop(ev)),
				),
				this.backgroundsContainer = Htx.div(
					"backgrounds-container",
					UI.anchor()
				),
				this.foregroundContainer = new ForegroundView(
					this.record,
					CssClass.captionSceneForeground,
					this.record.origin,
					this.textContainer = Htx.div(
						"text-container",
						{
							flex: "1 0"
						},
						this.contentImageContainer = Htx.div("content-image-container"),
						this.titleView.root,
						this.descriptionView.root,
						this.buttonsContainer,
					)
				).root,
				
				// Content Buttons
				
				Htx.div(
					UI.anchorTop(),
					UI.flexCenter,
					...this.createToolButtons()
				)
			);
			
			this.setBladeButtons(
				() => this.handleSelectionChange(),
				this.animationButton,
				this.originButton,
				this.sizeButton,
				this.weightButton,
				this.contrastButton,
				this.backgroundsButton,
			);
			
			this.backgroundManager = new BackgroundManager({
				record,
				renderTarget: this.backgroundsContainer,
			});
			
			this.setContentImageSize(this.record.contentImageWidth);
			
			this.titleView.setTitles(this.record.titles);
			this.titleView.setTextChangedHandler(() =>
			{
				this.record.titles = this.titleView.getTitleData();
			});
			
			this.descriptionView.setTextChangedHandler(() =>
			{
				this.record.description = this.descriptionView.html;
			});
			
			this.setDescriptionText(this.record.description);
			this.setDescriptionSize(this.record.descriptionSize);
			
			Saver.set(this);
		}
		
		private readonly foregroundContainer;
		private readonly textContainer;
		private readonly contentImageContainer;
		private contentImage: HTMLImageElement | null = null;
		private readonly titleView;
		private readonly descriptionView;
		private readonly buttonsContainer;
		private readonly buttons;
		private readonly backgroundsContainer;
		private readonly backgroundManager: BackgroundManager;
		
		private sizePicker: ElementPicker | null = null;
		private weightPicker: ElementPicker | null = null;
		private originPicker: OriginPicker | null = null;
		
		private readonly animationButton = new BladeButtonView("Animation");
		private readonly originButton = new BladeButtonView("Position");
		private readonly sizeButton = new BladeButtonView("Size");
		private readonly weightButton = new BladeButtonView("Bold");
		private readonly contrastButton = new BladeButtonView("Contrast");
		private readonly backgroundsButton = new BladeButtonView("Backgrounds");
		
		/** */
		private createToolButtons()
		{
			const imageTool = this.createToolButton("Image", () => { });
			const titleTool = this.createToolButton("Title", () => this.titleView.focus());
			const descTool = this.createToolButton("Description", () => this.descriptionView.focus());
			
			this.titleView.setHideChangedHandler(hidden => UI.hide(titleTool, !hidden));
			this.descriptionView.setHideChangedHandler(hidden => UI.hide(descTool, !hidden));
			
			return [
				imageTool,
				titleTool,
				descTool,
			];
		}
		
		/** */
		private createToolButton(label: string, click: () => void)
		{
			return UI.toolButton(
				{
					margin: "10px 5px 0",
				},
				UI.plusButton(
					{
						width: "15px",
						height: "15px",
						marginRight: "20px"
					}
				),
				...UI.click(click),
				new Text(label)
			);
		}
		
		/** */
		private addButton()
		{
			const cb = new CaptionedButton();
			this.buttons.insert(cb);
			
			// It's lame that this is in a setTimeout, but I don't care.
			// It's not working otherwise.
			setTimeout(() => cb.focus());
		}
		
		/** */
		private handleMediaDrop(ev: DragEvent)
		{
			const files = ev.dataTransfer?.files;
			const mediaRecords= this.createMediaRecords(files, [MimeClass.image, MimeClass.video]);
			if (mediaRecords.length === 0)
				return;
			
			const mediaRecord = mediaRecords[0];
			const { y } = UI.getLayerCoords(this.sceneContainer, ev);
			const isBackground = y > this.sceneContainer.offsetHeight / 2;
			
			if (isBackground)
			{
				this.backgroundManager.addBackground(mediaRecord);
			}
			else
			{
				Util.clear(this.contentImageContainer);
				
				this.contentImage = Htx.img(
					CssClass.captionSceneContentImage,
					{ src: mediaRecord.getBlobUrl() }
				);
				
				this.contentImageContainer.append(this.contentImage);
			}
		}
		
		/** */
		private handleSelectionChange()
		{
			if (this.sizeButton.selected)
				this.renderSizeConfigurator();
			else
				this.sizePicker?.remove();
			
			if (this.weightButton.selected)
				this.renderWeightConfigurator();
			else
				this.weightPicker?.remove();
			
			if (this.contrastButton.selected)
				this.renderContrastConfigurator();
			
			if (this.originButton.selected)
			{
				this.renderOriginConfigurator();
				this.setBladeConfigurator(null);
			}
			else this.originPicker?.remove();
			
			if (this.backgroundsButton.selected)
			{
				this.foregroundContainer.style.filter = "blur(3px)";
				this.foregroundContainer.style.pointerEvents = "none";
				this.setBladeConfigurator(this.backgroundManager.configuratorElement);
			}
			else
			{
				this.foregroundContainer.style.removeProperty("filter");
				this.foregroundContainer.style.removeProperty("pointer-events");
				this.backgroundManager.configuratorElement.remove();
			}
			
			if (!this.bladeButtons.some(bb => bb.selected))
				this.setBladeConfigurator(null);
		}
		
		/** */
		private setTitleText(idx: number, text: string)
		{
			const titleDatas = this.titleView.getTitleData();
			const titleData = titleDatas[idx];
			titleData.text = text;
			
			const tb = this.titleView.getTextBox(idx);
			if (tb)
				tb.html = text;
			
			this.record.titles = titleDatas;
		}
		
		/** */
		private setDescriptionText(text: string)
		{
			this.record.description = text;
			this.descriptionView.html = text;
		}
		
		/** */
		private renderSizeConfigurator()
		{
			type TPickable = 
				HTMLImageElement |
				ITitle |
				CaptionedDescriptionView;
			
			const picker = this.sizePicker = new ElementPicker(this.sceneContainer);
			const pickMap = new Map<HTMLElement, TPickable>();
			
			picker.setRemovedFn(() =>
			{
				this.sizeButton.selected = false;
				this.handleSelectionChange();
			});
			
			if (this.contentImage)
			{
				picker.registerElement(this.contentImage);
				pickMap.set(this.contentImage, this.contentImage);
			}
			
			const titleTextBoxes = this.titleView.getTextBoxes();
			const titleDatas = this.titleView.getTitleData();
			
			for (let i = -1; ++i < titleDatas.length;)
			{
				const e = titleTextBoxes[i].editableElement;
				picker.registerElement(e);
				pickMap.set(e, titleDatas[i]);
			}
			
			if (this.descriptionView.html)
			{
				const e = this.descriptionView.root;
				picker.registerElement(e);
				pickMap.set(e, this.descriptionView);
			}
			
			const slider = new Slider();
			this.setBladeConfigurator(slider.root);
			
			const updatePick = () =>
			{
				if (!picker.pickedElement)
					return;
				
				const pickable = pickMap.get(picker.pickedElement);
				if (!pickable)
					return;
				
				if (pickable instanceof HTMLImageElement)
				{
					slider.progress = this.record.contentImageWidth;
				}
				else if (pickable instanceof CaptionedDescriptionView)
				{
					slider.progress = this.record.descriptionSize;
					slider.max = 10;
				}
				else
				{
					const idx = titleDatas.indexOf(pickable);
					if (idx < 0)
						return;
					
					const titleData = titleDatas[idx];
					slider.max = 50;
					slider.progress = titleData.size;
				}
			};
			
			picker.setPickChangedFn(updatePick);
			updatePick();
			
			slider.setProgressChangeFn(() =>
			{
				if (!picker.pickedElement)
					return;
				
				const pickable = pickMap.get(picker.pickedElement);
				if (!pickable)
					return;
				
				if (pickable instanceof HTMLImageElement)
				{
					this.setContentImageSize(slider.progress);
				}
				else if (pickable instanceof CaptionedDescriptionView)
				{
					this.setDescriptionSize(slider.progress);
				}
				else
				{
					const idx = titleDatas.indexOf(pickable);
					if (idx >= 0)
						this.setTitleSize(idx, slider.progress);
				}
			});
		}
		
		/** */
		private setContentImageSize(size: number)
		{
			if (this.contentImage)
				this.contentImage.style.width = UI.vsize(size);
			
			this.record.contentImageWidth = size;
		}
		
		/** */
		private setTitleSize(titleIdx: number, size: number)
		{
			const titleDatas = this.titleView.getTitleData();
			const titleData = titleDatas[titleIdx];
			titleData.size = size;
			this.titleView.setFontSize(titleIdx, size);
		}
		
		/** */
		private setDescriptionSize(size: number)
		{
			this.descriptionView.fontSize = size;
			this.record.descriptionSize = size;
		}
		
		/** */
		private renderWeightConfigurator()
		{
			const picker = this.weightPicker = new ElementPicker(this.sceneContainer);
			const pickMap = new Map<HTMLElement, ITitle>();
			
			picker.setRemovedFn(() =>
			{
				this.weightButton.selected = false;
				this.handleSelectionChange();
			});
			
			const titleTextBoxes = this.titleView.getTextBoxes();
			const titleDatas = this.titleView.getTitleData();
			
			for (let i = -1; ++i < titleDatas.length;)
			{
				const e = titleTextBoxes[i].editableElement;
				picker.registerElement(e);
				pickMap.set(e, titleDatas[i]);
			}
			
			const slider = new Slider();
			this.setBladeConfigurator(slider.root);
			
			const updatePick = () =>
			{
				if (!picker.pickedElement)
					return;
				
				const pickable = pickMap.get(picker.pickedElement);
				if (!pickable)
					return;
				
				const idx = titleDatas.indexOf(pickable);
				if (idx < 0)
					return;
				
				const titleData = titleDatas[idx];
				slider.max = 900;
				slider.progress = titleData.weight;
			};
			
			picker.setPickChangedFn(updatePick);
			updatePick();
			
			slider.setProgressChangeFn(() =>
			{
				if (!picker.pickedElement)
					return;
				
				const pickedTitle = pickMap.get(picker.pickedElement);
				if (!pickedTitle)
					return;
				
				const idx = titleDatas.indexOf(pickedTitle);
				if (idx < 0)
					return;
				
				this.setTitleWeight(idx, slider.progress);
			});
		}
		
		/** */
		private setTitleWeight(titleIdx: number, weight: number)
		{
			const titleDatas = this.titleView.getTitleData();
			weight = Math.round(weight);
			const titleData = titleDatas[titleIdx];
			titleData.weight = weight;
			this.titleView.setFontWeight(titleIdx, weight);
			this.record.titles = titleDatas;
		}
		
		/** */
		private renderContrastConfigurator()
		{
			const slider = new Slider();
			slider.max = 100;
			slider.progress = this.record.textContrast;
			this.setBladeConfigurator(slider.root);
			slider.setProgressChangeFn(() => this.setContrast(slider.progress));
		}
		
		/** */
		private setContrast(amount: number)
		{
			RenderUtil.setContrast(this.textContainer, amount);
			this.record.textContrast = amount;
		}
		
		/** */
		private renderOriginConfigurator()
		{
			this.originPicker = new OriginPicker({
				backdropFilter: "blur(5px)",
				backgroundColor: UI.black(0.333),
			});
			
			this.originPicker.setSelectedFn(origin => this.setOrigin(origin));
			this.sceneContainer.append(this.originPicker.root);
		}
		
		/** */
		private setOrigin(origin: Origin | null)
		{
			if (origin !== null)
			{
				this.record.origin = origin;
				UI.toggleEnumClass(this.foregroundContainer, Origin, origin);
			}
			
			this.originButton.selected = false;
			this.handleSelectionChange();
		}
		
		/** */
		save()
		{
			this.record.titles = this.titleView.getTitleData();
			this.record.description = this.descriptionView.html;
			
			AppContainer.of(this).database.save(this.record);
		}
	}
}
