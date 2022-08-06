
namespace App
{
	/** */
	export class GallerySceneView extends SceneView
	{
		/** */
		constructor(readonly record = new GallerySceneRecord())
		{
			super(record);
			
			Htx.from(this.sceneContainer)(
				
				this.galleryContainer = Htx.div(
					"gallery-container",
					{
						height: "100%",
						scrollSnapType: "x mandatory",
						overflowX: "auto",
						overflowY: "hidden",
						whiteSpace: "nowrap",
						borderRadius: "inherit",
					},
					Htx.on("scroll", () => this.updateButtons()),
					
					...this.record.frames.map(f => new FrameView(f).root)
				),
				...UI.dripper(
					
					// Empty Dripper
					Htx.div(
						UI.visibleWhenEmpty(this.galleryContainer),
						new Text("Drop"),
					),
					
					// Non-Empty Dripper
					Htx.div(
						UI.visibleWhenNotEmpty(this.galleryContainer),
						UI.dripperStyle("left"),
						new Text("Add to the left"),
					),
					Htx.div(
						UI.visibleWhenNotEmpty(this.galleryContainer),
						UI.anchorRight(),
						UI.dripperStyle("right"),
						new Text("Add to the right"),
					),
					onFileDrop((files, x, y) => this.importMedia(files, x))
				),
				
				UI.getMediaDropCue(
					"Click or drop an image or video here.",
					files => this.importMedia(files),
					UI.visibleWhenEmpty(this.galleryContainer),
				),
			);
			
			this.setSceneButtons(
				() =>
				{
					this.getVisibleFrame()?.setSize(this.coverButton.selected ? "cover" : "contain");
				},
				this.coverButton,
				this.containButton,
			);
			
			UI.onChildrenChanged(this.galleryContainer, () => this.updateButtons());
			this.updateButtons();
		}
		
		private readonly galleryContainer: HTMLElement;
		
		/** */
		private readonly coverButton = new SceneButtonView("Cover", {
			selectable: true,
			unselectable: false,
		});
		
		/** */
		private readonly containButton = new SceneButtonView("Contain", {
			selectable: true,
			unselectable: false,
		});
		
		/** */
		private async importMedia(files: FileLike[], dropOffsetX = 0)
		{
			const mediaRecords = this.createMediaRecords(files, [MimeClass.image, MimeClass.video]);
			if (mediaRecords.length === 0)
				return;
			
			const visibleFrame = this.getVisibleFrame();
			const newFrames: FrameView[] = [];
			
			for (const mediaRecord of mediaRecords)
			{
				const frameRecord = new FrameRecord();
				frameRecord.media = mediaRecord;
				const frameView = new FrameView(frameRecord);
				newFrames.push(frameView);
			}
			
			const isLeft = dropOffsetX < window.innerWidth / 2;
			const elements = newFrames.map(f => f.root);
			
			if (visibleFrame && isLeft)
				visibleFrame.root.before(...elements);
			
			else if (visibleFrame && !isLeft)
				visibleFrame.root.after(...elements);
			
			else this.galleryContainer.append(...elements);
			
			await UI.wait();
			
			this.record.frames = Controller
				.map(this.galleryContainer, FrameView)
				.map(v => v.record);
		}
		
		/** */
		private getVisibleFrame()
		{
			const gc = this.galleryContainer;
			const index = Math.round(gc.scrollLeft / gc.offsetWidth) || 0;
			const frameViews = Controller.map(Query.children(gc), FrameView);
			return frameViews.length > 0 ? frameViews[index] : null;
		}
		
		/** */
		private updateButtons()
		{
			const currentVisibleFrame = this.getVisibleFrame();
			
			if (currentVisibleFrame === null)
			{
				this.coverButton.enabled = false;
				this.containButton.enabled = false;
			}
			else
			{
				this.coverButton.enabled = true;
				this.containButton.enabled = true;
				const cover = currentVisibleFrame.record.size === "cover";
				this.coverButton.selected = cover;
				this.containButton.selected = !cover;
			}
		}
	}
	
	/** */
	class FrameView
	{
		/** */
		constructor(readonly record: FrameRecord)
		{
			const media = record.media!;
			const isImage = MimeType.getClass(media.type) === MimeClass.image;
			let filler: HTMLElement;
			
			if (isImage)
			{
				this.mediaElement = Htx.img({
					src: media.getBlobUrl()
				});
				
				filler = RenderUtil.createImageFiller(media.getBlobCssUrl());
			}
			else
			{
				this.mediaElement = Htx.video({
					src: media.getBlobUrl()
				});
				
				this.mediaElement.controls = true;
				filler = RenderUtil.createVideoFiller(this.mediaElement);
			}
			
			const s = this.mediaElement.style;
			s.width = "100%";
			s.height = "100%";
			s.objectFit = "contain";
			
			this.root = Htx.div(
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
					...UI.click(() => this.root.remove()),
					new Text("Delete"),
				)
			);
			
			this.setSize(record.size)
			Controller.set(this);
		}
		
		readonly root;
		private readonly mediaElement;
		
		/** */
		setSize(sizeMethod: SizeMethod)
		{
			this.record.size = sizeMethod;
			this.mediaElement.style.objectFit = sizeMethod;
		}
	}
}
