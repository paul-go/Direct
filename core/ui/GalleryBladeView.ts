
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
				
				...UI.dripper(
					Htx.div(
						UI.dripperStyle("left"),
						new Text("Left"),
					),
					Htx.div(
						UI.anchorRight(),
						UI.dripperStyle("right"),
						new Text("Right"),
					),
					Htx.on("drop", ev =>
					{
						const mediaRecords = this.createMediaRecords(ev);
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
						
						const isLeft = ev.offsetX < window.innerWidth / 2;
						
						if (visibleFrame)
						{
							if (isLeft)
								visibleFrame.root.before(...newFrames.map(f => f.root));
							else
								visibleFrame.root.after(...newFrames.map(f => f.root));
						}
						else
							this.galleryContainer.append(...newFrames.map(f => f.root));
					})
				),
				
				this.galleryContainer = Htx.div(
					{
						height: "100%",
						scrollSnapType: "x mandatory",
						overflowX: "auto",
						overflowY: "hidden",
						whiteSpace: "nowrap",
						borderRadius: "inherit",
					},
					Htx.on("scroll", () => this.updateButtons()),
					Htx.div(
						UI.visibleWhenAlone(),
						UI.flexCenter,
						{
							height: "100%",
						},
						...UI.cueLabel("Drop an image here.")
					),
					...this.record.frames.map(f => new FrameView(f).root)
				)
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
				Htx.div(
					UI.anchor(-40),
					{
						backgroundImage: media.getBlobCssUrl(),
						backgroundSize: "100% 100%",
						filter: "blur(40px)",
					}
				),
				this.imageElement = Htx.img(
					{
						src: media.getBlobUrl(),
						width: "100%",
						height: "100%",
						objectFit: "contain",
					}
				),
				UI.clickLabel(
					UI.anchorTopRight(20),
					{
						padding: "20px 30px",
						backgroundColor: UI.black(0.5),
						backdropFilter: "blur(5px)",
						borderRadius: UI.borderRadius.large,
					},
					new Text("Delete"),
					Htx.on("click", () => this.root.remove())
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
