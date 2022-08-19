
/** */
namespace App
{
	/** */
	export class CanvasSceneView extends SceneView
	{
		/** */
		constructor(readonly record = new CanvasSceneRecord())
		{
			super(record);
			
			this.titleView = new CanvasTitleView(record);
			this.descriptionView = new CanvasDescriptionView(record);
			this.actionManager = new CanvasActionManager(record);
			
			Htx.from(this.sceneContainer)(
				Drop.here({
					accept: MimeType.ofClass(MimeClass.image, MimeClass.video),
					dropFn: (files, x, y) => this.handleMediaDrop(files, x, y),
					top: new Text("Add Content Image"),
					bottom: new Text("Add Background"),
				}),
				
				this.backgroundsContainer = Htx.div(
					"backgrounds-container",
					UI.anchor()
				),
				this.foregroundContainer = Htx.div(
					e => void new ForegroundMixin(e, this.record),
					CssClass.canvasSceneForeground,
					this.islandElement = Htx.div(
						CssClass.canvasSceneIsland,
						this.record.origin,
						this.contentImageContainer = Htx.div(
							"content-image-container",
							Htx.on("click", () =>
							{
								this.sizeButton.selected = true;
								this.handleSelectionChange();
							}),
						),
						this.titleView.root,
						this.descriptionView.root,
						this.actionManager.root,
					)
				),
				
				this.createToolsHeader(
					...this.createToolButtons()
				)
			);
			
			this.setSceneButtons(
				() => this.handleSelectionChange(),
				//this.animationButton,
				this.positionButton,
				this.sizeButton,
				this.weightButton,
				this.contrastButton,
				this.backgroundsButton,
			);
			
			this.backgroundManager = new BackgroundManager(
				this.record,
				this.backgroundsContainer);
			
			this.setContentImageSize(this.record.contentImageWidth);
			
			this.titleView.setTitles(this.record.titles);
			this.setDescriptionText(this.record.description);
			this.setDescriptionSize(this.record.descriptionSize);
			this.setContrast(this.record.textContrast);
			this.setTwist(this.record.twist);
		}
		
		private readonly foregroundContainer;
		private readonly islandElement;
		private readonly contentImageContainer;
		private contentImage: HTMLImageElement | null = null;
		private readonly titleView;
		private readonly descriptionView;
		private readonly actionManager;
		private readonly backgroundsContainer;
		private readonly backgroundManager: BackgroundManager;
		
		private sizePicker: ElementPicker | null = null;
		private weightPicker: ElementPicker | null = null;
		private originPicker: OriginPicker | null = null;
		
		private readonly animationButton = new SceneButtonView("Animation");
		private readonly positionButton = new SceneButtonView("Position");
		private readonly sizeButton = new SceneButtonView("Size");
		private readonly weightButton = new SceneButtonView("Bold");
		private readonly contrastButton = new SceneButtonView("Contrast");
		private readonly backgroundsButton = new SceneButtonView("Backgrounds");
		
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
					{
						icon.classList.add("asidyuaosidfyauisfd");
						icon.style.transform = "rotate(45deg)";
					}
				}
			});
			
			const titleTool = this.createToolButton("+ Title", () => this.titleView.focus());
			const descTool = this.createToolButton("+ Description", () => this.descriptionView.focus());
			const actionTool = this.createToolButton("+ Button", () => this.actionManager.addAction());
			
			this.titleView.setHideChangedHandler(hidden => UI.toggle(titleTool, hidden));
			this.descriptionView.setHideChangedHandler(hidden => UI.toggle(descTool, hidden));
			
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
				const mediaRecord = this.createMediaRecords([fileLike]);
				await this.addContentImage(mediaRecord[0]);
			}
			else return new Promise<void>(resolve =>
			{
				const input = Htx.input(
					{
						type: "file",
						visibility: "hidden",
						position: "absolute",
						multiple: false,
						accept: [MimeType.gif, MimeType.jpg, MimeType.png, MimeType.svg].join()
					},
					Htx.on("change", async () =>
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
							
							const mediaRecords = this.createMediaRecords([fileLike]);
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
			const mediaRecords = this.createMediaRecords(files, [MimeClass.image, MimeClass.video]);
			if (mediaRecords.length === 0)
				return;
			
			const mediaRecord = mediaRecords[0];
			const isBackground = layerY > this.sceneContainer.offsetHeight / 2;
			
			if (isBackground)
				this.backgroundManager.addBackground(mediaRecord);
			else
				this.addContentImage(mediaRecord);
		}
		
		/** */
		private async addContentImage(mediaRecord: MediaRecord)
		{
			const src = mediaRecord.getBlobUrl();
			const [width, height] = await RenderUtil.getDimensions(src);
			const existingContentImage = this.contentImage;
			
			this.contentImage = Htx.img(CssClass.canvasSceneContentImage, { src });
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
			
			if (this.positionButton.selected)
			{
				this.renderPositionConfigurator();
			}
			else this.originPicker?.remove();
			
			if (this.backgroundsButton.selected)
			{
				this.foregroundContainer.style.filter = "blur(3px)";
				this.foregroundContainer.style.pointerEvents = "none";
				this.setSceneConfigurator(this.backgroundManager.configuratorElement);
			}
			else
			{
				this.foregroundContainer.style.removeProperty("filter");
				this.foregroundContainer.style.removeProperty("pointer-events");
				this.backgroundManager.configuratorElement.remove();
			}
			
			if (!this.sceneButtons.some(bb => bb.selected))
				this.setSceneConfigurator(null);
		}
		
		/** */
		private setDescriptionText(text: string)
		{
			this.record.description = text;
			this.descriptionView.text = text;
		}
		
		/** */
		private renderSizeConfigurator()
		{
			type TPickable = 
				HTMLImageElement |
				ITitle |
				CanvasDescriptionView;
			
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
			
			if (this.descriptionView.text)
			{
				const e = this.descriptionView.root;
				picker.registerElement(e);
				pickMap.set(e, this.descriptionView);
			}
			
			const slider = new Slider();
			this.setSceneConfigurator(slider.root);
			
			const updatePick = () =>
			{
				if (!picker.pickedElement)
					return;
				
				const pickable = pickMap.get(picker.pickedElement);
				if (!pickable)
					return;
				
				if (pickable instanceof HTMLImageElement)
				{
					slider.place = this.record.contentImageWidth;
				}
				else if (pickable instanceof CanvasDescriptionView)
				{
					slider.place = this.record.descriptionSize;
					slider.max = 10;
				}
				else
				{
					const idx = titleDatas.indexOf(pickable);
					if (idx < 0)
						return;
					
					const titleData = titleDatas[idx];
					slider.max = 50;
					slider.place = titleData.size;
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
					this.setContentImageSize(slider.place);
				}
				else if (pickable instanceof CanvasDescriptionView)
				{
					this.setDescriptionSize(slider.place);
				}
				else
				{
					const idx = titleDatas.indexOf(pickable);
					if (idx >= 0)
						this.setTitleSize(idx, slider.place);
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
		private setTitleSize(titleIdx: number, size: number)
		{
			const titleDatas = this.titleView.getTitleData();
			const titleData = titleDatas[titleIdx];
			titleData.size = size;
			this.titleView.setFontSize(titleIdx, size);
			this.record.titles = titleDatas;
		}
		
		/** */
		private setDescriptionSize(size: number)
		{
			this.descriptionView.fontSize = size;
			this.actionManager.setFontSize(size);
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
			this.setSceneConfigurator(slider.root);
			
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
				slider.place = titleData.weight;
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
				
				this.setTitleWeight(idx, slider.place);
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
			slider.place = this.record.textContrast;
			this.setSceneConfigurator(slider.root);
			slider.setProgressChangeFn(() => this.setContrast(slider.place));
		}
		
		/** */
		private setContrast(amount: number)
		{
			RenderUtil.setContrast(this.islandElement, amount);
			this.record.textContrast = amount;
		}
		
		/** */
		private renderPositionConfigurator()
		{
			const picker = this.originPicker = new OriginPicker({
				...UI.backdropBlur(5),
				backgroundColor: UI.black(0.333),
			});
			
			this.originPicker.setSelectedFn(origin => this.setOrigin(origin));
			this.sceneContainer.append(this.originPicker.root);
			
			const slider = new Slider();
			slider.setLeftLabel("Twist Left");
			slider.setRightLabel("Twist Right");
			slider.min = -45;
			slider.max = 45;
			slider.place = this.record.twist;
			this.setSceneConfigurator(slider.root);
			slider.setProgressChangeFn(() => this.setTwist(slider.place));
			slider.setDraggingChangedFn(dragging =>
			{
				UI.toggle(picker.root, !dragging);
			});
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
	}
}
