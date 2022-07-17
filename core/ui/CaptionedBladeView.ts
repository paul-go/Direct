
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
			this.paragraphView = new CaptionedParagraphView();
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
						this.contentImageContainer = Htx.div("content-image-container"),
						this.titleView.root,
						this.paragraphView.root,
						this.buttonsContainer,
					)
				).root
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
			
			//! Temporary
			Htx.defer(this.root, () =>
			{
				this.titleView.insertTitle("Title");
				this.paragraphView.html = "This is <b>strong</b> text.";
			});
			
			Saver.set(this);
		}
		
		private readonly foregroundContainer;
		private readonly textContainer;
		private readonly contentImageContainer;
		private contentImage: HTMLImageElement | null = null;
		private readonly titleView;
		private readonly paragraphView;
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
				
				this.contentImage = Htx.img({
					src: mediaRecord.getBlobUrl(),
					display: "block",
					margin: "0 auto 30px",
					maxWidth: "70%",
					maxHeight: "100px",
				});
				
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
		private renderSizeConfigurator()
		{
			type TPickable = 
				HTMLImageElement |
				ITitle |
				CaptionedParagraphView;
			
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
			
			if (this.paragraphView.html)
			{
				const e = this.paragraphView.root;
				picker.registerElement(e);
				pickMap.set(e, this.paragraphView);
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
					slider.progress = this.record.descriptionSize;
				}
				else if (pickable instanceof CaptionedParagraphView)
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
					this.contentImage!.style.width = UI.vsize(slider.progress);
					this.record.contentImageWidth = slider.progress;
				}
				else if (pickable instanceof CaptionedParagraphView)
				{
					this.paragraphView.fontSize = slider.progress;
					this.record.descriptionSize = slider.progress;
				}
				else
				{
					const idx = titleDatas.indexOf(pickable);
					if (idx < 0)
						return;
					
					const titleData = titleDatas[idx];
					titleData.size = slider.progress;
					this.titleView.setFontSize(idx, titleData.size);
				}
			});
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
				
				const pickable = pickMap.get(picker.pickedElement);
				if (!pickable)
					return;
				
				const idx = titleDatas.indexOf(pickable);
				if (idx < 0)
					return;
				
				const titleData = titleDatas[idx];
				const weight = Math.round(slider.progress);
				titleData.weight = weight;
				this.titleView.setFontWeight(idx, weight);
				this.record.titles = titleDatas;
			});
		}
		
		/** */
		private renderContrastConfigurator()
		{
			const slider = new Slider();
			slider.max = 100;
			slider.progress = this.record.textContrast;
			this.setBladeConfigurator(slider.root);
			
			slider.setProgressChangeFn(() =>
			{
				const amount = ((slider.progress * 2) - 100) / 100;
				this.setContrast(this.textContainer, amount);
				this.record.textContrast = slider.progress;
			});
		}
		
		/** */
		private renderOriginConfigurator()
		{
			this.originPicker = new OriginPicker({
				backdropFilter: "blur(5px)",
				backgroundColor: UI.black(0.333),
			});
			
			this.originPicker.setSelectedFn(origin =>
			{
				if (origin !== null)
				{
					this.record.origin = origin;
					UI.toggleEnumClass(this.foregroundContainer, Origin, origin);
				}
				
				this.originButton.selected = false;
				this.handleSelectionChange();
			});
			
			this.sceneContainer.append(this.originPicker.root);
		}
		
		/** */
		save()
		{
			this.record.titles = this.titleView.getTitleData();
			this.record.description = this.paragraphView.html;
			
			AppContainer.of(this).database.save(this.record);
		}
	}
}
