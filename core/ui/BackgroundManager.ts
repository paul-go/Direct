
namespace App
{
	/** */
	export class BackgroundManager
	{
		/** */
		constructor(
			private readonly record: CanvasSceneRecord,
			backgroundsContainer: HTMLElement)
		{
			this.root = backgroundsContainer;
			let imagesConfigurators: HTMLElement;
			
			this.configuratorElement = Htx.div(
				"background-manager",
				imagesConfigurators = Htx.div(
					"background-manager-images",
					{
						marginBottom: "20px",
					}
				),
				new ColorConfigurator(this.record).root
			);
			
			this.previews = new Cage.Array(this.root, BackgroundPreview);
			this.configurators = new Cage.Array(imagesConfigurators, BackgroundConfigurator);
			
			for (const bg of record.backgrounds)
				if (bg.media)
					this.bindBackground(bg);
			
			this.configurators.observe(() =>
			{
				const records = this.configurators!.map(r => r.record);
				this.record.backgrounds = records;
			});
			
			Cage.set(this);
		}
		
		readonly root;
		readonly configuratorElement;
		private readonly configurators;
		private readonly previews;
		
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
			const preview = BackgroundPreview.new(backgroundRecord);
			const cfg = new BackgroundConfigurator(backgroundRecord, preview);
			this.configurators.insert(cfg);
			this.previews.insert(cfg.preview);
			
			if (preview instanceof BackgroundImagePreview)
				this.manageSelectionBox(cfg, preview);
		}
		
		/** */
		private manageSelectionBox(
			configurator: BackgroundConfigurator,
			preview: BackgroundImagePreview)
		{
			const update = () =>
			{
				const ancestors = Query.ancestors(document.activeElement);
				const visible = 
					ancestors.includes(configurator.root) ||
					ancestors.includes(preview.root);
				
				preview.toggleSelectionBox(visible);
			};
			
			Htx.from(configurator.root, preview.root)(
				{ tabIndex: 0 },
				Htx.on("focusout", () => update()),
				Htx.on("focusin", () => update()),
			);
		}
	}
	
	/** */
	class BackgroundConfigurator
	{
		/** */
		constructor(
			readonly record: BackgroundRecord,
			readonly preview: BackgroundPreview)
		{
			this.root = Htx.div(
				"background-configurator",
				Htx.css(" + .background-configurator", { marginTop: "10px" }),
				{
					display: "flex",
				},
				Htx.div(
					"mini-preview",
					{
						width: "75px",
						height: "75px",
						borderRadius: UI.borderRadius.default
					},
					this.renderMiniPreview(record)
				),
				Htx.div(
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
					Htx.on(UI.clickEvt, ev => UI.springMenu(ev.target, {
						"Move Up": () => {},
						"Move Down": () => {},
						"Delete": () => this.delete(),
					})),
					
					new Text("•••"),
				)
			);
			
			if (this.preview instanceof BackgroundImagePreview)
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
			
			Cage.set(this);
		}
		
		readonly root;
		private readonly coverButton;
		private readonly sizeSlider;
		
		/** */
		private renderMiniPreview(record: BackgroundRecord): Htx.Param
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
				Htx.on("pointerdown", () =>
				{
					this.setUsingCover(useCover);
				})
			];
		}
		
		/** */
		private setUsingCover(usingCover: boolean)
		{
			if (!(this.preview instanceof BackgroundImagePreview))
				return;
			
			this.coverButton.style.opacity = usingCover ? "1" : "0.5";
			this.sizeSlider.root.style.opacity = usingCover ? "0.5" : "1";
			
			if (usingCover)
				this.sizeSlider.place = this.sizeSlider.max;
			
			this.record.size = usingCover ? -1 : this.sizeSlider.place;
			this.preview.updateSize();
		}
		
		/** */
		private delete()
		{
			this.root.remove();
			this.preview.root.remove();
		}
	}
	
	/** */
	export abstract class BackgroundPreview
	{
		/** */
		static new(record: BackgroundRecord)
		{
			return Util.getMimeClass(record) === MimeClass.video ?
				new BackgroundVideoPreview(record) :
				new BackgroundImagePreview(record);
		}
		
		/** */
		constructor(readonly record: BackgroundRecord) { }
		
		abstract readonly root: HTMLElement;
	}
	
	/** */
	class BackgroundVideoPreview extends BackgroundPreview
	{
		/** */
		constructor(record: BackgroundRecord)
		{
			super(record);
			
			const blobUrl = record.media?.getBlobUrl() || "";
			const mimeType = record.media?.type || "";
			
			this.root = Htx.div(
				"background-video-preview",
				UI.anchor(),
				RenderUtil.createVideoBackground(blobUrl, mimeType)
			);
			
			Cage.set(this);
		}
		
		readonly root;
	}
	
	/** */
	class BackgroundImagePreview extends BackgroundPreview
	{
		/** */
		constructor(record: BackgroundRecord)
		{
			super(record);
			
			this.root = Htx.div(
				"background-image-preview",
				UI.anchor(),
				Htx.on("pointerdown", () =>
				{
					this.imgContainer.setPointerCapture(1);
				}),
				Htx.on("pointerup", () =>
				{
					this.imgContainer.releasePointerCapture(1);
				}),
				Htx.on("pointermove", ev =>
				{
					if (ev.buttons === 1)
						this.handleImageMove(ev.movementX, ev.movementY);
				}),
				this.imgBoundary = Htx.div(
					"image-boundary",
					this.imgContainer = Htx.div(
						"image-container",
						this.selectionBox = Htx.div(
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
						this.img = Htx.img(
							{
								src: record.media?.getBlobUrl(),
								display: "block",
								userSelect: "none",
								pointerEvents: "none",
							},
							Htx.on("load", async () =>
							{
								[this.imgWidth, this.imgHeight] = await RenderUtil.getDimensions(this.img.src);
								this.updateSize();
							})
						),
					)
				),
				Htx.on(window, "resize", () => window.requestAnimationFrame(() =>
				{
					this.updateSize();
				}))
			);
			
			Cage.set(this);
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
				Htx.from(this.imgBoundary)(
					UI.anchor()
				);
				
				Htx.from(this.imgContainer, this.img)({
					width: "100%",
					height: "100%",
					transform: "none",
				});
				
				Htx.from(this.img)({
					objectFit: "cover",
					objectPosition: "50% 50%",
				});
			}
			else
			{
				Htx.from(this.imgContainer)({
					width: "min-content",
					height: "min-content",
					transform: "translateX(-50%) translateY(-50%)"
				});
				
				const s = this.img.style;
				const sceneContainer = Cage.over(this, BackgroundManager).root;
				
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
				
				Htx.from(this.imgBoundary)(
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
