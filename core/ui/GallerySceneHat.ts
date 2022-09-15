
namespace App
{
	/** */
	export class GallerySceneHat extends SceneHat
	{
		/** */
		constructor(readonly record = new GallerySceneRecord())
		{
			super(record);
			
			Hot.get(this.sceneContainer)(
				
				this.galleryContainer = Hot.div(
					"gallery-container",
					{
						height: "100%",
						scrollSnapType: "x mandatory",
						overflowX: "auto",
						overflowY: "hidden",
						whiteSpace: "nowrap",
						borderRadius: "inherit",
					},
					Hot.on("scroll", () => this.updateButtons()),
					
					...this.record.frames.map(f => new FrameHat(f).head)
				),
				
				Drop.here({
					accept: MimeType.ofClass(MimeClass.image, MimeClass.video),
					dropFn: (files, x) => this.importMedia(files, x),
					left: [
						new Text("Add to the left"),
					],
					right: [
						new Text("Add to the right"),
					],
				}),
				
				this.hiddenInput = Hot.input(
					{
						type: "file",
						position: "absolute",
						visibility: "hidden",
					},
					Hot.on("change", async () =>
					{
						const files = await FileLike.fromFiles(this.hiddenInput.files);
						if (files.length)
							this.importMedia(files);
					}),
				),
				
				Hot.div(
					"cue",
					UI.anchor(),
					UI.flexCenter,
					UI.clickable,
					UI.visibleWhenEmpty(this.galleryContainer),
					...UI.cueLabel("Click or drop an image or video here."),
					{ pointerEvents: "none" },
				),
				
				Hot.on("click", () => this.hiddenInput.click()),
			);
			
			this.setSceneButtons(
				() => this.getVisibleFrame()?.setSize(this.coverButton.selected ? "cover" : "contain"),
				this.coverButton,
				this.containButton,
			);
			
			UI.onChildrenChanged(this.galleryContainer, () => this.updateButtons());
			this.updateButtons();
		}
		
		private readonly galleryContainer: HTMLElement;
		private readonly hiddenInput: HTMLInputElement;
		
		/** */
		private readonly coverButton = new SceneButtonHat("Cover", {
			selectable: true,
			unselectable: false,
		});
		
		/** */
		private readonly containButton = new SceneButtonHat("Contain", {
			selectable: true,
			unselectable: false,
		});
		
		/** */
		async importMedia(files: FileLike[], dropOffsetX = 0)
		{
			const mediaRecords = Util.createMediaRecords(files, [MimeClass.image, MimeClass.video]);
			if (mediaRecords.length === 0)
				return;
			
			const visibleFrame = this.getVisibleFrame();
			const newFrames: FrameHat[] = [];
			
			for (const mediaRecord of mediaRecords)
			{
				const frameRecord = new FrameRecord();
				frameRecord.media = mediaRecord;
				const frameHat = new FrameHat(frameRecord);
				newFrames.push(frameHat);
			}
			
			const isLeft = dropOffsetX < window.innerWidth / 2;
			const elements = newFrames.map(f => f.head);
			
			if (visibleFrame && isLeft)
				visibleFrame.head.before(...elements);
			
			else if (visibleFrame && !isLeft)
				visibleFrame.head.after(...elements);
			
			else this.galleryContainer.append(...elements);
			
			await UI.wait();
			
			this.record.frames = Hat
				.map(this.galleryContainer, FrameHat)
				.map(v => v.record);
		}
		
		/** */
		private getVisibleFrame()
		{
			const gc = this.galleryContainer;
			const index = Math.round(gc.scrollLeft / gc.offsetWidth) || 0;
			const frameHats = Hat.map(Query.children(gc), FrameHat);
			return frameHats.length > 0 ? frameHats[index] : null;
		}
		
		/** */
		private updateButtons()
		{
			const visibleFrame = this.getVisibleFrame();
			
			if (visibleFrame === null)
			{
				UI.toggle(this.coverButton.head, false);
				UI.toggle(this.containButton.head, false);
			}
			else
			{
				UI.toggle(this.coverButton.head, true);
				UI.toggle(this.containButton.head, true);
				const cover = visibleFrame.record.size === "cover";
				this.coverButton.selected = cover;
				this.containButton.selected = !cover;
				visibleFrame.setSize(this.coverButton.selected ? "cover" : "contain");
			}
		}
	}
	
	/** */
	class FrameHat
	{
		/** */
		constructor(readonly record: FrameRecord)
		{
			const media = record.media!;
			const isImage = MimeType.getClass(media.type) === MimeClass.image;
			let filler: HTMLElement | null = null;
			
			if (isImage)
			{
				this.mediaElement = Hot.img({
					src: media.getBlobUrl()
				});
				
				const src = media.getBlobCssUrl();
				filler = RenderUtil.createImageFiller(src);
			}
			else
			{
				this.mediaElement = Hot.video({
					src: media.getBlobUrl()
				});
				
				// Add this regardless of whether the video uses the filled object style
				this.mediaElement.classList.add(Player.VideoFiller.fillObjectClass);
				this.mediaElement.controls = true;
			}
			
			const s = this.mediaElement.style;
			s.width = "100%";
			s.height = "100%";
			s.objectFit = "contain";
			
			this.head = Hot.div(
				{
					scrollSnapAlign: "start",
					display: "inline-block",
					overflow: "hidden",
					width: "100%",
					height: "100%",
				},
				filler,
				this.mediaElement,
				
				UI.toolButton(
					UI.anchorTopRight(20),
					...UI.click(ev => 
					{
						this.head.remove();
						ev.stopPropagation();
					}),
					new Text("Delete"),
				)
			);
			
			this.setSize(record.size);
			Hat.wear(this);
		}
		
		readonly head;
		private readonly mediaElement;
		
		/** */
		setSize(sizeMethod: SizeMethod)
		{
			this.record.size = sizeMethod;
			this.mediaElement.style.objectFit = sizeMethod;
		}
	}
}
