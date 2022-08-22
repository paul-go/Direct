
/** */
namespace App
{
	/** */
	export class CanvasSceneHat extends SceneHat
	{
		/** */
		constructor(readonly record = new CanvasSceneRecord())
		{
			super(record);
			
			this.titleHat = new CanvasTitleSetHat(record);
			this.descriptionHat = new CanvasDescriptionHat(record);
			this.actionManager = new CanvasActionSetHat(record);
			
			Hot.get(this.sceneContainer)(
				Drop.here({
					accept: MimeType.ofClass(MimeClass.image, MimeClass.video),
					dropFn: (files, x, y) => this.handleMediaDrop(files, x, y),
					top: new Text("Add Content Image"),
					bottom: new Text("Add Background"),
				}),
				
				(this.backgroundPreview = new BackgroundPreviewHat(this.record)).head,
				
				this.foregroundPreview = Hot.div(
					e => void new ForegroundMixin(e),
					CssClass.canvasSceneForeground,
					this.islandElement = Hot.div(
						CssClass.canvasSceneIsland,
						this.record.origin,
						this.contentImageContainer = Hot.div(
							"content-image-container",
							Hot.on("click", () =>
							{
								this.sizeButton.selected = true;
								this.handleSelectionChange();
							}),
						),
						this.titleHat.head,
						this.descriptionHat.head,
						this.actionManager.head,
					)
				),
				
				this.createToolsHeader(
					...this.createToolButtons()
				),
				
				When.connected(() => this.setupElementPicker()),
			);
			
			this.setSceneButtons(
				() => this.handleSelectionChange(),
				//this.animationButton,
				this.positionButton,
				this.sizeButton,
				this.weightButton,
				this.colorButton,
				this.backgroundsButton,
			);
			
			this.setContentImageSize(this.record.contentImageWidth);
			this.setDescriptionText(this.record.description);
			this.setDescriptionSize(this.record.descriptionSize);
			this.setContrast(this.record.contrast);
			this.setTwist(this.record.twist);
			
			this.lightnessSwatch = new LightnessSwatchHat(Origin.bottom);
			this.picker = new ElementPickerHat(this.sceneContainer);
		}
		
		private readonly foregroundPreview;
		private readonly islandElement;
		private readonly contentImageContainer;
		private contentImage: HTMLImageElement | null = null;
		private readonly titleHat;
		private readonly descriptionHat;
		private readonly actionManager;
		private readonly backgroundPreview: BackgroundPreviewHat;
		private readonly lightnessSwatch;
		
		private originPicker: OriginPickerHat | null = null;
		
		private readonly animationButton = new SceneButtonHat("Animation");
		private readonly positionButton = new SceneButtonHat("Position");
		private readonly sizeButton = new SceneButtonHat("Size");
		private readonly weightButton = new SceneButtonHat("Bold");
		private readonly colorButton = new SceneButtonHat("Color");
		private readonly backgroundsButton = new SceneButtonHat("Backgrounds");
		
		/** */
		private createToolButtons()
		{
			const imageTool = this.createToolButton("+ Image", async () =>
			{
				const icon = Not.nullable(Query.find(Icon.plus.name, imageTool));
				
				if (this.contentImage !== null)
				{
					this.removeContentImage();
					icon.style.transform = "rotate(0deg)";
				}
				else
				{
					await this.beginAddContentImage();
					if (this.contentImage)
						icon.style.transform = "rotate(45deg)";
				}
			});
			
			const titleTool = this.createToolButton("+ Title", () => this.titleHat.focus());
			const descTool = this.createToolButton("+ Description", () => this.descriptionHat.focus());
			const actionTool = this.createToolButton("+ Button", () => this.actionManager.addAction());
			
			this.titleHat.setHideChangedHandler(hidden => UI.toggle(titleTool, hidden));
			this.descriptionHat.setHideChangedHandler(hidden => UI.toggle(descTool, hidden));
			
			return [
				imageTool,
				titleTool,
				descTool,
				actionTool,
			];
		}
		
		/** */
		private async beginAddContentImage()
		{
			if (TAURI)
			{
				const dialogResult = await Tauri.dialog.open({
					recursive: false,
					directory: false,
					multiple: false,
					filters: [{
						name: "Images",
						extensions: ["jpg", "jpeg", "gif", "png", "svg"]
					}]
				});
				
				if (typeof dialogResult !== "string")
					return;
				
				const fileName = Util.getFileName(dialogResult);
				const imageBytes = await Tauri.fs.readBinaryFile(dialogResult);
				const mime = MimeType.fromFileName(fileName);
				const fileLike = new FileLike(fileName, mime, imageBytes);
				const mediaRecord = Util.createMediaRecords([fileLike]);
				await this.addContentImage(mediaRecord[0]);
			}
			else return new Promise<void>(resolve =>
			{
				const input = Hot.input(
					{
						type: "file",
						visibility: "hidden",
						position: "absolute",
						multiple: false,
						accept: [MimeType.gif, MimeType.jpg, MimeType.png, MimeType.svg].join()
					},
					Hot.on("change", async () =>
					{
						input.remove();
						
						if (input.files?.length)
						{
							const nativeFile = input.files[0];
							const fileLike: FileLike = { 
								name: nativeFile.name,
								data: await nativeFile.arrayBuffer(),
								type: Not.nullable(MimeType.from(nativeFile.type))
							};
							
							const mediaRecords = Util.createMediaRecords([fileLike]);
							await this.addContentImage(mediaRecords[0]);
						}
						
						resolve();
					})
				);
				
				document.body.append(input);
				input.click();
			});
		}
		
		/** */
		private handleMediaDrop(files: FileLike[], layerX: number, layerY: number)
		{
			const mediaRecords = Util.createMediaRecords(files, [MimeClass.image, MimeClass.video]);
			if (mediaRecords.length === 0)
				return;
			
			const mediaRecord = mediaRecords[0];
			const isBackground = layerY > this.sceneContainer.offsetHeight / 2;
			
			if (isBackground)
				this.backgroundPreview.addBackground(mediaRecord);
			else
				this.addContentImage(mediaRecord);
		}
		
		/** */
		private async addContentImage(mediaRecord: MediaRecord)
		{
			const src = mediaRecord.getBlobUrl();
			const [width, height] = await RenderUtil.getDimensions(src);
			const existingContentImage = this.contentImage;
			
			this.contentImage = Hot.img(CssClass.canvasSceneContentImage, { src });
			this.contentImage.style.aspectRatio = width + " / " + height;
			
			if (existingContentImage)
				existingContentImage.replaceWith(this.contentImage);
			else
				this.contentImageContainer.prepend(this.contentImage);
			
			this.setContentImageSize(15);
			this.record.contentImage = mediaRecord;
		}
		
		/** */
		private handleSelectionChange()
		{
			if (this.positionButton.selected)
				this.renderPositionConfigurator();
			else
				this.originPicker?.remove();
			
			if (this.sizeButton.selected)
				this.renderSizeConfigurator();
			
			else if (this.weightButton.selected)
				this.renderWeightConfigurator();
			
			else if (this.colorButton.selected)
				this.renderColorConfigurator();
			
			else if (!this.backgroundsButton.selected)
				this.setPickableElements();
			
			if (this.backgroundsButton.selected)
			{
				this.foregroundPreview.style.filter = "blur(3px)";
				this.foregroundPreview.style.pointerEvents = "none";
				this.setSceneConfigurator(this.backgroundPreview.configuratorElement);
			}
			else
			{
				this.foregroundPreview.style.removeProperty("filter");
				this.foregroundPreview.style.removeProperty("pointer-events");
				this.backgroundPreview.configuratorElement.remove();
			}
			
			if (!this.sceneButtons.some(bb => bb.selected))
				this.setSceneConfigurator(null);
		}
		
		/** */
		private setDescriptionText(text: string)
		{
			this.record.description = text;
			this.descriptionHat.text = text;
		}
		
		/** */
		private renderSizeConfigurator()
		{
			this.setPickableElements(
				Pickable.images,
				Pickable.titles,
				Pickable.descriptions);
			
			const slider = new Slider();
			slider.setLeftLabel("Smaller");
			slider.setRightLabel("Larger");
			this.setSceneConfigurator(slider.head);
			
			const updatePick = () =>
			{
				const picked = this.getPicked();
				
				if (picked instanceof HTMLImageElement)
				{
					slider.place = this.record.contentImageWidth;
				}
				else if (picked instanceof CanvasTitleHat)
				{
					slider.max = 50;
					slider.place = picked.size;
				}
				else if (picked instanceof CanvasDescriptionHat)
				{
					slider.place = this.record.descriptionSize;
					slider.max = 10;
				}
			};
			
			this.picker.setPickChangedFn(updatePick);
			updatePick();
			
			slider.setPlaceChangeFn(() =>
			{
				const picked = this.getPicked();
				if (!picked)
					return;
				
				if (picked instanceof HTMLImageElement)
				{
					this.setContentImageSize(slider.place);
				}
				else if (picked instanceof CanvasTitleHat)
				{
					picked.size = slider.place;
				}
				else if (picked instanceof CanvasDescriptionHat)
				{
					this.setDescriptionSize(slider.place);
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
		private removeContentImage()
		{
			if (this.contentImage)
			{
				this.contentImage.remove();
				this.contentImage = null;
			}
		}
		
		/** */
		private setDescriptionSize(size: number)
		{
			this.descriptionHat.fontSize = size;
			this.actionManager.setFontSize(size);
			this.record.descriptionSize = size;
		}
		
		/** */
		private renderWeightConfigurator()
		{
			this.setPickableElements(Pickable.titles);
			
			const slider = new Slider();
			slider.setLeftLabel("Thinner");
			slider.setRightLabel("Thicker");
			
			const updatePick = () =>
			{
				const picked = this.getPicked();
				if (!(picked instanceof CanvasTitleHat))
					return;
				
				slider.decimals = 0;
				slider.min = 100;
				slider.max = 900;
				slider.place = picked.weight;
			};
			
			this.picker.setPickChangedFn(updatePick);
			updatePick();
			
			slider.setPlaceChangeFn(() =>
			{
				const picked = this.getPicked();
				if (picked instanceof CanvasTitleHat)
					picked.weight = slider.place;
			});
			
			this.setSceneConfigurator(slider.head);
		}
		
		/** */
		private renderColorConfigurator()
		{
			this.setPickableElements(
				Pickable.titles,
				Pickable.actions,
				Pickable.scene);
			
			const slider = new Slider(
				When.disconnected(() =>
				{
					this.lightnessSwatch.head.remove();
				})
			);
			
			slider.setLeftLabel("Dark on light");
			slider.setRightLabel("Light on dark");
			slider.skipZero = true;
			slider.abs = true;
			slider.decimals = 0;
			slider.min = -100;
			slider.max = 100;
			slider.place = this.record.contrast;
			slider.setPlaceChangeFn(() => this.setContrast(slider.place));
			
			const configurator = Hot.div(
				new HueSwatchHat(this.record).head,
				slider.head);
			
			const updatePick = () =>
			{
				const picked = this.getPicked();
				const rec = this.record;
				const dol = rec.getDarkOnLight();
				const sw = this.lightnessSwatch;
				sw.targetsBackground = picked instanceof SceneHat;
				
				if (picked instanceof CanvasTitleHat || picked instanceof CanvasActionHat)
				{
					sw.isColorSelected = picked.hasColor;
					sw.isDarkSelected = dol;
				}
				else if (picked instanceof SceneHat)
				{
					sw.isColorSelected = rec.hasColor
					sw.isDarkSelected = !dol;
				}
			};
			
			updatePick();
			this.picker.setPickChangedFn(updatePick);
			this.sceneContainer.append(this.lightnessSwatch.head);
			this.setSceneConfigurator(configurator);
		}
		
		/** */
		updateLightness()
		{
			const picked = this.getPicked();
				
			if (picked instanceof CanvasTitleHat ||
				picked instanceof CanvasActionHat ||
				picked instanceof SceneHat)
				picked.hasColor = this.lightnessSwatch.isColorSelected;
			
			super.updateLightness();
		}
		
		/** */
		private setContrast(amount: number)
		{
			RenderUtil.setContrast(this.islandElement, amount);
			this.record.contrast = amount;
			super.updateLightness();
		}
		
		/** */
		private renderPositionConfigurator()
		{
			const picker = this.originPicker = new OriginPickerHat({
				...UI.backdropBlur(5),
				backgroundColor: UI.black(0.333),
			});
			
			this.originPicker.setSelectedFn(origin => this.setOrigin(origin));
			this.sceneContainer.append(this.originPicker.head);
			
			const slider = new Slider();
			slider.setLeftLabel("Twist Left");
			slider.setRightLabel("Twist Right");
			slider.min = -45;
			slider.max = 45;
			slider.place = this.record.twist;
			slider.setPlaceChangeFn(() => this.setTwist(slider.place));
			slider.setDraggingChangedFn(dragging =>
			{
				UI.toggle(picker.head, !dragging);
			});
			this.setSceneConfigurator(slider.head);
		}
		
		/** */
		private setTwist(amount: number)
		{
			this.record.twist = amount;
			this.islandElement.style.transform = "rotate(" + amount + "deg)";
		}
		
		/** */
		private setOrigin(origin: Origin | null)
		{
			if (origin !== null)
			{
				this.record.origin = origin;
				UI.toggleEnumClass(this.islandElement, Origin, origin);
			}
			
			this.positionButton.selected = false;
			this.handleSelectionChange();
		}
		
		//# Element Picker
		
		private readonly picker: ElementPickerHat;
		private readonly pickerDataMap = new Map<HTMLElement, TPickable>();
		
		/** */
		private setupElementPicker()
		{
			this.picker.setCancelFn(() =>
			{
				this.sizeButton.selected = false;
				this.weightButton.selected = false;
				this.colorButton.selected = false;
				this.backgroundsButton.selected = false;
				this.handleSelectionChange();
			});
		}
		
		/** */
		private getPicked()
		{
			if (!this.picker.pickedElement)
				return null;
			
			const pickable = this.pickerDataMap.get(this.picker.pickedElement);
			if (!pickable)
				return null;
			
			return pickable;
		}
		
		/** */
		private setPickableElements(...pickableTypes: Pickable[])
		{
			this.picker.unregisterElements();
			this.pickerDataMap.clear();
			this.picker.toggle(pickableTypes.length > 0);
			
			if (pickableTypes.includes(Pickable.images))
			{
				if (this.contentImage)
				{
					this.picker.registerElement(this.contentImage);
					this.pickerDataMap.set(this.contentImage, this.contentImage);
				}
			}
			
			if (pickableTypes.includes(Pickable.titles))
			{
				for (const canvasTitle of this.titleHat.getCanvasTitles())
				{
					this.picker.registerElement(canvasTitle.head);
					this.pickerDataMap.set(canvasTitle.head, canvasTitle);
				}
			}
			
			if (pickableTypes.includes(Pickable.descriptions))
			{
				if (this.descriptionHat.text)
				{
					const e = this.descriptionHat.head;
					this.picker.registerElement(e);
					this.pickerDataMap.set(e, this.descriptionHat);
				}
			}
			
			if (pickableTypes.includes(Pickable.actions))
			{
				for (const action of Hat.under(this, CanvasActionHat))
				{
					this.picker.registerElement(action.head);
					this.pickerDataMap.set(action.head, action);
				}
			}
			
			if (pickableTypes.includes(Pickable.backgroundObjects))
			{
				for (const bg of Hat.under(this, BackgroundObjectPreviewHat))
				{
					this.picker.registerElement(bg.head);
					this.pickerDataMap.set(bg.head, bg);
				}
			}
			
			if (pickableTypes.includes(Pickable.scene))
			{
				this.picker.registerElement(this.sceneContainer, -20);
				this.pickerDataMap.set(this.sceneContainer, this);
			}
		}
	}
	
	/** */
	const enum Pickable
	{
		images,
		titles,
		descriptions,
		actions,
		backgroundObjects,
		scene,
	}
	
	/** */
	type TPickable = 
		HTMLImageElement |
		CanvasTitleHat |
		CanvasDescriptionHat |
		CanvasActionHat |
		BackgroundObjectPreviewHat |
		SceneHat;
}
