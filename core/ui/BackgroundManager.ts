
namespace Turf
{
	/** */
	export class BackgroundManager
	{
		/** */
		constructor(private readonly options: {
			record: CaptionedBladeRecord,
			renderTarget: HTMLElement,
		})
		{
			let imagesConfigurators: HTMLElement;
			
			this.configuratorElement = Htx.div(
				"background-manager",
				imagesConfigurators = Htx.div(
					"background-manager-images",
					{
						marginBottom: "20px",
					}
				),
				new ColorConfigurator(options.record, options.renderTarget).root
			);
			
			this.configurators = new Controller.Array(imagesConfigurators, BackgroundConfigurator);
			this.configurators.observe(() =>
			{
				const records = this.configurators!.toArray().map(r => r.record);
				this.options.record.backgrounds = records;
			});
			
			this.previews = new Controller.Array(options.renderTarget, BackgroundPreview);
			this.previews.insert(...this.configurators.toArray().map(c => c.preview));
		}
		
		readonly configuratorElement;
		private readonly configurators;
		private readonly previews;
		
		/** */
		addBackground(media: MediaRecord)
		{
			const backgroundRecord = new BackgroundRecord();
			backgroundRecord.media = media;
			this.options.record.backgrounds.push(backgroundRecord);
			this.updateOutput();
			
			const cfg = new BackgroundConfigurator(backgroundRecord);
			const idx = this.configurators.insert(cfg);
			this.previews.insert(idx, cfg.preview);
		}
		
		/** */
		private updateOutput()
		{
			Util.clear(this.options.renderTarget);
			
			for (const backgroundRecord of this.options.record.backgrounds)
			{
				if (!backgroundRecord.media)
					continue;
				
				this.options.renderTarget.append();
			}
		}
	}
	
	/** */
	class BackgroundConfigurator
	{
		/** */
		constructor(readonly record: BackgroundRecord)
		{
			this.preview = new BackgroundPreview(record);
			this.root = Htx.div(
				"background-configurator",
				Htx.css(" + .background-configurator { margin-top: 10px }"),
				{
					display: "flex",
				},
				Htx.div(
					"mini-preview",
					{
						width: "75px",
						height: "75px",
						backgroundImage: record.media?.getBlobCssUrl(),
						backgroundSize: "contain",
						backgroundColor: UI.gray(50),
						borderRadius: UI.borderRadius.default
					}
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
					
					Htx.on(UI.click, ev => UI.springMenu(ev.target, {
						"Move Up": () => {},
						"Move Down": () => {},
						"Delete": () => this.root.remove(),
					})),
					
					new Text("•••"),
				),
			);
			
			this.sizeSlider.setProgressChangeFn(() =>
			{
				this.preview.setSize(this.sizeSlider.progress);
			});
			
			this.setUsingCover(record.size < 0);
			UI.removeTogether(this.root, this.preview.root);
		}
		
		readonly root;
		readonly preview;
		private readonly coverButton;
		private readonly sizeSlider;
		
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
			this.coverButton.style.opacity = usingCover ? "1" : "0.5";
			this.sizeSlider.root.style.opacity = usingCover ? "0.5" : "1";
			
			if (usingCover)
				this.sizeSlider.progress = this.sizeSlider.max;
			
			this.record.size = usingCover ? -1 : this.sizeSlider.progress;
			this.preview.setSize(this.record.size);
		}
	}
	
	/** */
	class BackgroundPreview
	{
		/** */
		constructor(readonly record: BackgroundRecord)
		{
			this.root = Htx.div(
				"background-preview",
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
						Htx.css(`:before {
							content: "";
							position: absolute;
							top: -4px;
							left: -4px;
							right: -4px;
							bottom: -4px;
							border: 3px dashed white;
							border-radius: ${UI.borderRadius.default}
						}`),
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
								this.setSize(this.size);
							})
						),
					)
				)
			);
			
			this.size = record.size;
		}
		
		readonly root;
		private readonly imgContainer;
		private readonly imgBoundary;
		private readonly img;
		
		private imgWidth = 0;
		private imgHeight = 0;
		
		/** */
		async setSize(size: number)
		{
			this.size = size;
			
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
				if (this.imgWidth > this.imgHeight)
				{
					s.width = size + "vmin";
					s.height = "auto";
				}
				else
				{
					s.width = "auto";
					s.height = size + "vmin";
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
		private size = -1;
		
		/** */
		private handleImageMove(deltaX: number, deltaY: number)
		{
			const boundaryWidth = this.imgBoundary.offsetWidth;
			const boundaryHeight = this.imgBoundary.offsetHeight;
			
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
			
			if (this.size < 0)
			{
				this.imgContainer.style.left = "0";
				this.imgContainer.style.top = "0";
				this.img.style.objectPosition = `${100 - x}% ${100 - y}%`;
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
