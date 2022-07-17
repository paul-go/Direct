
namespace Turf
{
	/** */
	export class GalleryBladeView extends BladeView
	{
		/** */
		constructor(readonly record = new GalleryBladeRecord())
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
					Htx.on("drop", ev => this.importMedia(ev.dataTransfer?.files, ev.offsetX)),
				),
				
				UI.getMediaDropCue(
					"Click or drop an image here.",
					files => this.importMedia(files),
					UI.visibleWhenEmpty(this.galleryContainer),
				),
			);
			
			this.setBladeButtons(
				() =>
				{
					this.getVisibleFrame()?.setSize(this.coverButton.selected ? "cover" : "contain");
				},
				this.coverButton,
				this.containButton,
			);
			
			this.updateButtons();
			UI.onChildrenChanged(this.galleryContainer, () => this.updateButtons());
		}
		
		private readonly galleryContainer: HTMLElement;
		
		/** */
		private readonly coverButton = new BladeButtonView("Cover", {
			selectable: true,
			unselectable: false,
		});
		
		/** */
		private readonly containButton = new BladeButtonView("Contain", {
			selectable: true,
			unselectable: false,
		});
		
		/** */
		private async importMedia(files: FileList | undefined, dropOffsetX = 0)
		{
			const mediaRecords = this.createMediaRecords(files, [MimeClass.image]);
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
			
			if (visibleFrame)
			{
				if (isLeft)
					visibleFrame.root.before(...newFrames.map(f => f.root));
				else
					visibleFrame.root.after(...newFrames.map(f => f.root));
			}
			else
				this.galleryContainer.append(...newFrames.map(f => f.root));
			
			await UI.wait();
			
			this.record.frames = Controller
				.map(this.galleryContainer, FrameView)
				.map(v => v.record);
		}
		
		/** */
		private getVisibleFrame()
		{
			const gc = this.galleryContainer;
			const index = Math.round(gc.scrollLeft / gc.offsetWidth);
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
		
		/** */
		save()
		{
			
		}
	}
	
	/** */
	class FrameView
	{
		/** */
		constructor(readonly record: FrameRecord)
		{
			const media = record.media!;
			
			this.root = Htx.div(
				{
					scrollSnapAlign: "start",
					display: "inline-block",
					overflow: "hidden",
					width: "100%",
					height: "100%",
				},
				RenderUtil.createImageFiller(media.getBlobCssUrl()),
				this.imageElement = Htx.img(
					{
						src: media.getBlobUrl(),
						width: "100%",
						height: "100%",
						objectFit: "contain",
					}
				),
				
				UI.toolButton(
					UI.anchorTopRight(20),
					...UI.click(() => this.root.remove()),
					new Text("Delete"),
				)
			);
			
			this.setSize(record.size);
			Controller.set(this);
		}
		
		readonly root;
		private readonly imageElement;
		
		/** */
		setSize(sizeMethod: SizeMethod)
		{
			this.record.size = sizeMethod;
			this.imageElement.style.objectFit = sizeMethod;
		}
	}
	
	/** */
	const enum Class
	{
		imageContainer = "image-container",
	}
}
