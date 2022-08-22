
namespace App
{
	/** */
	export class BackgroundPreviewHat
	{
		/** */
		constructor(private readonly record: CanvasSceneRecord)
		{
			this.root = Hot.div(UI.anchor());
			
			let configurators: HTMLElement;
			const mimeClasses = [MimeClass.image, MimeClass.video];
			
			this.configuratorElement = Hot.div(
				"configurator-element",
				configurators = Hot.div(
					"configurators",
					{
						display: "flex",
						flexDirection: "column-reverse",
						marginBottom: "20px",
					},
				),
				Drop.here({
					accept: MimeType.ofClass(...mimeClasses),
					center: new Text("Add Background"),
					dropFn: files =>
					{
						for (const record of Util.createMediaRecords(files, mimeClasses))
							this.addBackground(record);
					},
				}),
			);
			
			this.previews = new Hat.Array(this.root, BackgroundObjectPreviewHat);
			this.configurators = new Hat.Array(configurators, BackgroundConfiguratorHat);
			
			for (const bg of record.backgrounds)
				if (bg.media)
					this.bindBackground(bg);
			
			this.configurators.observe(() => this.save());
			Hat.wear(this);
		}
		
		readonly root;
		readonly configuratorElement;
		private readonly configurators;
		private readonly previews;
		
		/** */
		private save()
		{
			const records = this.configurators!.map(r => r.record);
			this.record.backgrounds = records;
		}
		
		/**
		 * Creates a new BackgroundRecord around the specified
		 * MediaRecord, saves it, and adds it to the preview surface.
		 */
		addBackground(media: MediaRecord)
		{
			const backgroundRecord = new BackgroundRecord();
			backgroundRecord.media = media;
			this.bindBackground(backgroundRecord);
			this.record.backgrounds.push(backgroundRecord);
		}
		
		/**
		 * Renders a pre-existing background record to the preview surface.
		 */
		private bindBackground(backgroundRecord: BackgroundRecord)
		{
			const preview = BackgroundObjectPreviewHat.new(backgroundRecord);
			const cfg = new BackgroundConfiguratorHat(backgroundRecord, preview);
			this.configurators.insert(cfg);
			this.previews.insert(cfg.preview);
			
			if (preview instanceof BackgroundImagePreviewHat)
				this.manageSelectionBox(cfg, preview);
		}
		
		/** */
		private manageSelectionBox(
			configurator: BackgroundConfiguratorHat,
			preview: BackgroundImagePreviewHat)
		{
			const update = () =>
			{
				const ancestors = Query.ancestors(document.activeElement);
				const visible = 
					ancestors.includes(configurator.root) ||
					ancestors.includes(preview.root);
				
				preview.toggleSelectionBox(visible);
			};
			
			Hot.get(configurator.root, preview.root)(
				{ tabIndex: 0 },
				Hot.on("focusout", () => update()),
				Hot.on("focusin", () => update()),
			);
		}
	}
	
	/** */
	class BackgroundConfiguratorHat
	{
		/** */
		constructor(
			readonly record: BackgroundRecord,
			readonly preview: BackgroundObjectPreviewHat)
		{
			this.root = Hot.div(
				"background-configurator",
				Hot.css(":not(:last-child)", { marginTop: "10px" }),
				{
					display: "flex",
				},
				Hot.div(
					"mini-preview",
					{
						width: "75px",
						height: "75px",
						borderRadius: UI.borderRadius.default
					},
					this.renderMiniPreview(record)
				),
				Hot.div(
					{
						flex: "1 0",
						padding: "0 25px",
					},
					(this.sizeSlider = new Slider(...this.getSizeParams(false))).root
				),
				this.coverButton = UI.clickLabel(
					{
						padding: "20px",
					},
					...this.getSizeParams(true),
					new Text("Cover")
				),
				UI.clickLabel(
					{
						padding: "20px",
					},
					Hot.on(UI.clickEvt, ev => UI.springMenu(ev.target, {
						// These are backwards because the flow of elements is column-reverse
						...(this.root.nextElementSibling ? { "Move Up": () => this.moveUp() } : {}),
						...(this.root.previousElementSibling ? { "Move Down": () => this.moveDown() } : {}),
						"Delete": () => this.delete(),
					})),
					
					new Text("•••"),
				)
			);
			
			if (this.preview instanceof BackgroundImagePreviewHat)
			{
				const bip = this.preview;
				this.sizeSlider.setPlaceChangeFn(() =>
				{
					bip.updateSize(this.sizeSlider.place);
				});
				
				When.connected(this.preview.root, () =>
				{
					this.setUsingCover(record.size < 0);
				});
			}
			
			Hat.wear(this);
		}
		
		readonly root;
		private readonly coverButton;
		private readonly sizeSlider;
		
		/** */
		private renderMiniPreview(record: BackgroundRecord): Hot.Param
		{
			const cls = Util.getMimeClass(record);
			
			if (cls === MimeClass.image)
			{
				return {
					backgroundColor: UI.gray(50),
					backgroundImage: record.media!.getBlobCssUrl(),
					backgroundSize: "contain",
				};
			}
			
			if (cls === MimeClass.video)
			{
				return RenderUtil.createVideoBackground(
					record.media!.getBlobUrl(),
					record.media!.type);
			}
			
			return false;
		}
		
		/** */
		private getSizeParams(useCover: boolean)
		{
			return [
				{
					transitionProperty: "opacity",
					transitionDuration: "0.2s",
				},
				Hot.on("pointerdown", () =>
				{
					this.setUsingCover(useCover);
				})
			];
		}
		
		/** */
		private setUsingCover(usingCover: boolean)
		{
			if (!(this.preview instanceof BackgroundImagePreviewHat))
				return;
			
			this.coverButton.style.opacity = usingCover ? "1" : "0.5";
			this.sizeSlider.root.style.opacity = usingCover ? "0.5" : "1";
			
			if (usingCover)
				this.sizeSlider.place = this.sizeSlider.max;
			
			this.record.size = usingCover ? -1 : this.sizeSlider.place;
			this.preview.updateSize();
		}
		
		/** */
		private moveUp()
		{
			this.root.nextElementSibling?.after(this.root);
			this.preview.root.nextElementSibling?.after(this.preview.root);
		}
		
		/** */
		private moveDown()
		{
			this.root.previousElementSibling?.before(this.root);
			this.preview.root.previousElementSibling?.before(this.preview.root);
		}
		
		/** */
		private delete()
		{
			this.root.remove();
			this.preview.root.remove();
		}
	}
	
	/** */
	export abstract class BackgroundObjectPreviewHat
	{
		/** */
		static new(record: BackgroundRecord)
		{
			return Util.getMimeClass(record) === MimeClass.video ?
				new BackgroundVideoPreviewHat(record) :
				new BackgroundImagePreviewHat(record);
		}
		
		/** */
		constructor(readonly record: BackgroundRecord) { }
		
		abstract readonly root: HTMLElement;
	}
	
	/** */
	class BackgroundVideoPreviewHat extends BackgroundObjectPreviewHat
	{
		/** */
		constructor(record: BackgroundRecord)
		{
			super(record);
			
			const blobUrl = record.media?.getBlobUrl() || "";
			const mimeType = record.media?.type || "";
			
			this.root = Hot.div(
				"background-video-preview",
				UI.anchor(),
				RenderUtil.createVideoBackground(blobUrl, mimeType)
			);
			
			Hat.wear(this);
		}
		
		readonly root;
	}
	
	/** */
	class BackgroundImagePreviewHat extends BackgroundObjectPreviewHat
	{
		/** */
		constructor(record: BackgroundRecord)
		{
			super(record);
			
			this.root = Hot.div(
				"background-image-preview",
				UI.anchor(),
				{
					pointerEvents: "none",
				},
				this.imgBoundary = Hot.div(
					"image-boundary",
					this.imgContainer = Hot.div(
						"image-container",
						{
							pointerEvents: "all",
						},
						Hot.on("pointerdown", () =>
						{
							this.imgContainer.setPointerCapture(1);
						}),
						Hot.on("pointerup", () =>
						{
							this.imgContainer.releasePointerCapture(1);
						}),
						Hot.on("pointermove", ev =>
						{
							if (ev.buttons === 1)
								this.handleImageMove(ev.movementX, ev.movementY);
						}),
						this.selectionBox = Hot.div(
							"selection-box",
							{
								...UI.anchor(-4),
								border: "3px dashed white",
								borderRadius: UI.borderRadius.default,
								pointerEvents: "none"
							}
						),
						{
							userSelect: "none",
							cursor: "move",
						},
						this.img = Hot.img(
							{
								src: record.media?.getBlobUrl(),
								display: "block",
								userSelect: "none",
								pointerEvents: "none",
							},
							Hot.on("load", async () =>
							{
								[this.imgWidth, this.imgHeight] = await RenderUtil.getDimensions(this.img.src);
								this.updateSize();
							})
						),
					)
				),
				Hot.on(window, "resize", () => window.requestAnimationFrame(() =>
				{
					this.updateSize();
				}))
			);
			
			Hat.wear(this);
		}
		
		readonly root;
		private readonly imgContainer;
		private readonly imgBoundary;
		private readonly img;
		private readonly selectionBox;
		
		private imgWidth = 0;
		private imgHeight = 0;
		
		/** */
		toggleSelectionBox(visible: boolean)
		{
			const s = this.selectionBox.style;
			
			if (!visible)
				s.display = "none";
			else
				s.removeProperty("display");
		}
		
		/** */
		async updateSize(size?: number)
		{
			if (size === undefined)
				size = this.record.size;
			else
				this.record.size = size;
			
			if (size < 0)
			{
				Hot.get(this.imgBoundary)(
					UI.anchor()
				);
				
				Hot.get(this.imgContainer, this.img)({
					width: "100%",
					height: "100%",
					transform: "none",
				});
				
				Hot.get(this.img)({
					objectFit: "cover",
					objectPosition: "50% 50%",
				});
			}
			else
			{
				Hot.get(this.imgContainer)({
					width: "min-content",
					height: "min-content",
					transform: "translateX(-50%) translateY(-50%)"
				});
				
				const s = this.img.style;
				const sceneContainer = Hat.over(this, BackgroundPreviewHat).root;
				
				if (this.imgWidth > this.imgHeight)
				{
					const sceneWidth = sceneContainer.offsetWidth;
					s.width = (sceneWidth * (size / 100)) + "px";
					s.height = "auto";
				}
				else
				{
					const sceneHeight = sceneContainer.offsetHeight;
					s.width = "auto";
					s.height = (sceneHeight * (size / 100)) + "px";
				}
				
				await UI.wait();
				
				Hot.get(this.imgBoundary)(
					UI.anchor(this.img.offsetHeight / 2, this.img.offsetWidth / 2),
					{
						width: "auto",
						height: "auto",
					}
				);
				
				await UI.wait();
			}
			
			this.updateImagePosition();
		}
		
		/** */
		private handleImageMove(deltaX: number, deltaY: number)
		{
			if (this.record.size < 0)
			{
				deltaX *= -1;
				deltaY *= -1;
			}
			
			const boundaryWidth = this.imgBoundary.offsetWidth;
			const boundaryHeight = this.imgBoundary.offsetHeight;
			
			let [x, y] = this.record.position;
			
			const xPct = ((deltaX / boundaryWidth) || 0) * 100;
			const yPct = ((deltaY / boundaryHeight) || 0) * 100;
			
			x = Math.max(0, Math.min(100, x + xPct));
			y = Math.max(0, Math.min(100, y + yPct));
			
			this.record.position = [x, y];
			this.record.save();
			this.updateImagePosition();
		}
		
		/** */
		private updateImagePosition()
		{
			const [x, y] = this.record.position;
			
			if (this.record.size < 0)
			{
				this.imgContainer.style.left = "0";
				this.imgContainer.style.top = "0";
				this.img.style.objectPosition = `${x}% ${y}%`;
			}
			else
			{
				this.imgContainer.style.left = x + "%";
				this.imgContainer.style.top = y + "%";
				this.img.style.removeProperty("object-position");
			}
		}
	}
}
