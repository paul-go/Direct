
namespace Turf
{
	/** */
	export class GalleryBladeView extends BladeView
	{
		/** */
		constructor(readonly record = new VideoBladeRecord())
		{
			super(record);
			
			const dripperStyle: Htx.Style = {
				pointerEvents: "none",
				width: "50%",
				...UI.flexCenter,
			};
			
			Htx.from(this.sceneContainer)(
				
				...UI.dripper(
					Htx.div(
						UI.anchorLeft(),
						dripperStyle,
						new Text("Left"),
					),
					Htx.div(
						UI.anchorRight(),
						dripperStyle,
						new Text("Right"),
					),
					Htx.on("drop", ev =>
					{
						const dt = ev.dataTransfer!;
						
						const imageFiles = Array.from(dt.files)
							.filter(f => MimeType.getClass(f.type) === MimeClass.image);
						
						if (imageFiles.length === 0)
							return;
						
						const isLeft = ev.offsetX < window.innerWidth / 2;
						const ms = this.apex.currentMediaStore;
						const mediaObjects = imageFiles.map(file => ms.add(file));
						const visibleImage = this.getVisibleImage();
						
						const newImages = mediaObjects.map(mediaObject =>
						{
							const newImage: HTMLElement = Htx.div(
									Class.imageContainer,
									{
										scrollSnapAlign: "start",
										display: "inline-block",
										width: "100%",
										height: "100%",
										background: "black",
									},
									Htx.img(
										{
											src: mediaObject.url,
											width: "100%",
											height: "100%",
											objectFit: "contain",
										}
									),
									Htx.div(
										UI.anchor(),
										UI.clickable,
										{
											margin: "auto",
											padding: "20px",
											backgroundColor: UI.black(0.75),
											color: "white",
											maxWidth: "max-content",
											maxHeight: "max-content",
											borderRadius: UI.borderRadius.default
										},
										new Text("Delete"),
										Htx.on("click", ev => newImage.remove())
									)
								);
							
							return newImage;
						});
						
						if (!visibleImage)
						{
							this.galleryContainer.append(...newImages);
						}
						else
						{
							if (isLeft)
								newImages.reverse();
							
							const pos: InsertPosition = isLeft ? "beforebegin" : "afterend";
							
							for (const e of newImages)
								visibleImage.insertAdjacentElement(pos, e);
						}
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
					Htx.div(
						UI.visibleWhenAlone(),
						UI.flexCenter,
						new Text("Drop an image here"),
					),
				)
			);
			
			this.setBladeButtons(
				this.coverButton,
				this.containButton,
			);
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
		private getVisibleImage()
		{
			const gc = this.galleryContainer;
			const index = Math.round(gc.scrollLeft / gc.offsetWidth);
			const imageContainers = Query.find(Class.imageContainer, gc);
			return imageContainers.length > 0 ? imageContainers[index] : null;
		}
		
		/** */
		save()
		{
			
		}
	}
	
	/** */
	const enum Class
	{
		imageContainer = "image-container",
	}
}
