
namespace App
{
	/** */
	export class BackgroundPreviewHat
	{
		/** */
		constructor(private readonly record: CanvasSceneRecord)
		{
			this.head = Hot.div(UI.anchor());
			
			let configurators: HTMLElement;
			const mimeClasses = [Mime.Class.image, Mime.Class.video];
			
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
					accept: Mime.each(...mimeClasses),
					center: new Text("Add Background"),
					dropFn: files =>
					{
						for (const record of Util.createMediaRecords(files, mimeClasses))
							this.addBackground(record);
					},
				}),
			);
			
			this.previews = new Hat.Array(this.head, BackgroundObjectPreviewHat);
			this.configurators = new Hat.Array(configurators, BackgroundConfiguratorHat);
			
			for (const bg of record.backgrounds)
				if (bg.media)
					this.bindBackground(bg);
			
			this.configurators.observe(() => this.save());
			Hat.wear(this);
		}
		
		readonly head;
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
			this.head = Hot.div(
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
					this.renderMiniPreview(record),
				),
				Hot.div(
					{
						flex: "1 0",
						padding: "0 25px",
					},
					this.sizeSlider = this.createSlider(),
				),
				this.coverButton = UI.clickLabel(
					{
						padding: "20px",
					},
					...this.getSizeParams(true),
					new Text("Cover"),
				),
				UI.clickLabel(
					{
						padding: "20px",
					},
					Hot.on(UI.clickEvt, ev => UI.springMenu(ev.target, {
						// These are backwards because the flow of elements is column-reverse
						...(this.head.nextElementSibling ? { "Move Up": () => this.moveUp() } : {}),
						...(this.head.previousElementSibling ? { "Move Down": () => this.moveDown() } : {}),
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
				
				When.connected(this.preview.head, () =>
				{
					this.setUsingCover(record.size < 0);
				});
			}
			
			Hat.wear(this);
		}
		
		readonly head;
		private readonly coverButton;
		private readonly sizeSlider;
		
		/** */
		private createSlider()
		{
			const slider = new Slider(...this.getSizeParams(false));
			slider.setLeftLabel("Smaller");
			slider.setRightLabel("Bigger");
			return slider;
		}
		
		/** */
		private renderMiniPreview(record: BackgroundRecord): Hot.Param
		{
			const cls = Util.getMimeClass(record);
			
			if (cls === Mime.Class.image)
			{
				return {
					backgroundColor: UI.gray(50),
					backgroundImage: record.media!.getBlobCssUrl(),
					backgroundSize: "contain",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
				};
			}
			
			if (cls === Mime.Class.video)
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
					this.record.size = useCover ? -1 : this.sizeSlider.place;
				})
			];
		}
		
		/** */
		private setUsingCover(usingCover: boolean)
		{
			if (!(this.preview instanceof BackgroundImagePreviewHat))
				return;
			
			this.coverButton.style.opacity = usingCover ? "1" : "0.5";
			this.sizeSlider.head.style.opacity = usingCover ? "0.5" : "1";
			this.sizeSlider.place = usingCover ?
				this.sizeSlider.max :
				this.record.size;
			
			this.preview.updateSize();
		}
		
		/** */
		private moveUp()
		{
			this.head.nextElementSibling?.after(this.head);
			this.preview.head.nextElementSibling?.after(this.preview.head);
		}
		
		/** */
		private moveDown()
		{
			this.head.previousElementSibling?.before(this.head);
			this.preview.head.previousElementSibling?.before(this.preview.head);
		}
		
		/** */
		private delete()
		{
			this.head.remove();
			this.preview.head.remove();
		}
	}
	
	/** */
	export abstract class BackgroundObjectPreviewHat
	{
		/** */
		static new(record: BackgroundRecord)
		{
			return Util.getMimeClass(record) === Mime.Class.video ?
				new BackgroundVideoPreviewHat(record) :
				new BackgroundImagePreviewHat(record);
		}
		
		/** */
		constructor(readonly record: BackgroundRecord) { }
		
		abstract readonly head: HTMLElement;
		abstract readonly object: HTMLElement;
	}
	
	/** */
	export class BackgroundVideoPreviewHat extends BackgroundObjectPreviewHat
	{
		/** */
		constructor(record: BackgroundRecord)
		{
			super(record);
			
			const blobUrl = record.media?.getBlobUrl() || "";
			const mimeType = record.media?.type || "";
			
			this.head = Hot.div(
				UI.anchor(),
				this.object = RenderUtil.createVideoBackground(blobUrl, mimeType)
			);
			
			Hat.wear(this);
		}
		
		readonly head;
		readonly object: HTMLElement;
	}
	
	/** */
	export class BackgroundImagePreviewHat extends BackgroundObjectPreviewHat
	{
		/** */
		constructor(record: BackgroundRecord)
		{
			super(record);
			
			this.head = Hot.div(
				UI.anchor(),
				{
					pointerEvents: "none",
				},
				this.object = Hot.div(
					"background-object-container",
					{
						...UI.unselectable,
						pointerEvents: "all",
						cursor: "move",
					},
					When.rendered(e => this.registerElement(e)),
					this.img = Hot.img(
						{
							...UI.unselectable,
							src: record.media?.getBlobUrl(),
							display: "block",
							pointerEvents: "none",
						},
						Hot.on("load", async () =>
						{
							[this.imgWidth, this.imgHeight] = await RenderUtil.getDimensions(record.media!);
							this.updateSize();
						})
					),
				),
				Hot.on(window, "resize", () => window.requestAnimationFrame(() =>
				{
					this.updateSize();
				})),
			);
			
			Hat.wear(this);
		}
		
		readonly head;
		readonly object;
		private readonly img;
		private imgWidth = 0;
		private imgHeight = 0;
		
		/** */
		private getPicker()
		{
			if (!this.picker)
				this.picker = Not.nullable(Hat.nearest(this, ElementPickerHat));
			
			return this.picker;
		}
		private picker: ElementPickerHat | null = null;
		
		/** */
		private registerElement(e: HTMLElement)
		{
			let lastScreenX = 0;
			let lastScreenY = 0;
			
			const picker = this.getPicker();
			picker.registerElement(e, 0, true);
			
			Hot.get(e)(
				Hot.on(picker.indicator, "pointerdown", ev =>
				{
					if (picker.pickedElement === e)
					{
						this.object.setPointerCapture(ev.pointerId);
						lastScreenX = ev.screenX;
						lastScreenY = ev.screenY;
					}
				}),
				Hot.on(document.body, "pointermove", ev =>
				{
					if (ev.buttons === 1 && picker.pickedElement === e)
					{
						if (this.object.hasPointerCapture(ev.pointerId))
						{
							const deltaX = ev.screenX - lastScreenX;
							const deltaY = ev.screenY - lastScreenY;
							this.handleImageMove(deltaX, deltaY);
							lastScreenX = ev.screenX;
							lastScreenY = ev.screenY;
						}
					}
				}),
			);
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
				Hot.get(this.object, this.img)({
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
				Hot.get(this.object)({
					width: "min-content",
					height: "min-content",
					transform: "translateX(-50%) translateY(-50%)",
				});
				
				const s = this.img.style;
				const sceneContainer = Hat.over(this, BackgroundPreviewHat).head;
				const sceneSize = sceneContainer.offsetWidth; // width + height are equal
				
				if (this.imgWidth > this.imgHeight)
				{
					s.width = (sceneSize * (size / 100)) + "px";
					s.height = "auto";
				}
				else
				{
					s.width = "auto";
					s.height = (sceneSize * (size / 100)) + "px";
				}
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
			
			const boundaryWidth = this.head.offsetWidth;
			const boundaryHeight = this.head.offsetHeight;
			
			let [x, y] = this.record.position;
			
			const xPct = ((deltaX / boundaryWidth) || 0) * 100;
			const yPct = ((deltaY / boundaryHeight) || 0) * 100;
			
			x = Math.max(0, Math.min(100, x + xPct));
			y = Math.max(0, Math.min(100, y + yPct));
			
			this.record.position = [x, y];
			this.updateImagePosition();
		}
		
		/** */
		private updateImagePosition()
		{
			const [x, y] = this.record.position;
			
			if (this.record.size < 0)
			{
				this.object.style.left = "0";
				this.object.style.top = "0";
				this.img.style.objectPosition = `${x}% ${y}%`;
			}
			else
			{
				this.object.style.left = x + "%";
				this.object.style.top = y + "%";
				this.img.style.removeProperty("object-position");
			}
			
			Hat.nearest(this, ElementPickerHat)?.updateIndicator();
		}
	}
}
