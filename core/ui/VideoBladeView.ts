
namespace Turf
{
	/** */
	export class VideoBladeView extends BladeView
	{
		/** */
		constructor(readonly record = new VideoBladeRecord())
		{
			super();
			
			Htx.from(this.sceneContainer)(
				UI.flexCenter,
				UI.clickable,
				...UI.dripper(
					new Text("Drop video here"),
					Htx.on("drop", ev =>
					{
						const dt = ev.dataTransfer!;
						if (dt.files.length === 0)
							return;
						
						const file = dt.files[0];
						const mediaObject = this.apex.currentMediaStore.add(file);
						this.setMedia(mediaObject);
					})
				),
				Htx.on("click", () =>
				{
					
				}),
				
				this.videoContainer = Htx.div(
					{
						width: "100%",
						height: "100%",
						overflow: "hidden",
						borderRadius: "inherit",
						backgroundColor: "rgb(70, 70, 70)",
					},
					Htx.div(
						"no-media-label",
						UI.anchor(),
						UI.flexCenter,
						UI.visibleWhenAlone(),
						new Text("Click to add a video."),
					)
				)
			);
			
			this.setBladeButtons(
				this.coverButton,
				this.containButton,
			);
			
			this.size = record.size;
		}
		
		private readonly videoContainer: HTMLElement;
		private readonly coverButton = new BladeButtonView("Cover").selectable();
		private readonly containButton = new BladeButtonView("Contain").selectable();
				
		/** */
		get size()
		{
			return this.containButton.selected ? "contain" : "cover";
		}
		set size(value: SizeMethod)
		{
			if (value === "contain")
				this.containButton.select();
		}
		
		/** */
		setMedia(mediaObject: IMediaObject)
		{
			this.videoTag?.remove();
			this.videoTag = Htx.video(
				{
					src: mediaObject.url,
					type: mediaObject.type,
					playsInline: true,
					controls: true,
					width: "100%",
					height: "100%",
					objectFit: "contain",
				}
			);
			
			const blur = 40;
			
			const fillerVideoTag = Htx.video(
				{
					src: mediaObject.url,
					type: mediaObject.type,
					controls: false,
					playsInline: true,
					
					objectFit: "fill",
					position: "absolute",
					top: -(blur * 4) + "px",
					left: -(blur * 4) + "px",
					width: `calc(100% + ${blur * 8}px)`,
					height: `calc(100% + ${blur * 8}px)`,
					filter: `blur(${blur}px)`,
					zIndex: "-1",
				}
			);
			
			this.videoTag.onplay = () =>
			{
				fillerVideoTag.play();
			};
			
			this.videoTag.onpause = () => fillerVideoTag.pause();
			this.videoTag.onstalled = () => fillerVideoTag.pause();
			this.videoTag.onended = () => fillerVideoTag.pause();
			
			this.videoTag.onseeked = () =>
			{
				fillerVideoTag.currentTime = this.videoTag?.currentTime || 0;
			};
			
			this.videoTag.onseeking = () =>
			{
				fillerVideoTag.currentTime = this.videoTag?.currentTime || 0;
			}
			
			this.videoContainer.append(fillerVideoTag, this.videoTag);
		}
		
		private videoTag: HTMLVideoElement | null = null;
	}
}
