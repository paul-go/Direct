
namespace Turf
{
	/** */
	export class VideoBladeView extends BladeView
	{
		/** */
		constructor(readonly record = new VideoBladeRecord())
		{
			super(record);
			
			Htx.from(this.sceneContainer)(
				UI.flexCenter,
				UI.clickable,
				
				this.videoContainer = Htx.div(
					{
						width: "100%",
						height: "100%",
						overflow: "hidden",
						borderRadius: "inherit",
					},
				),
				
				...UI.dripper(
					new Text("Drop video here"),
					Htx.on("drop", ev => this.importMedia(ev.dataTransfer?.files))
				),
				
				UI.getMediaDropCue(
					"Click or drop a video here.",
					files => this.importMedia(files),
					UI.visibleWhenEmpty(this.videoContainer))
			);
			
			this.setBladeButtons(
				() =>
				{
					this.record.size = this.containButton.selected ? "contain" : "cover";
					this.updateButtons();
				},
				this.coverButton,
				this.containButton,
			);
			
			this.updateMedia();
			this.updateButtons();
		}
		
		private readonly videoContainer: HTMLElement;
		
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
		private importMedia(fileList?: FileList)
		{
			const mediaRecords = this.createMediaRecords(fileList, [MimeClass.video]);
			if (mediaRecords.length === 0)
				return;
			
			this.record.media = mediaRecords[0];
			this.updateMedia();
			this.updateButtons();
		}
		
		/** */
		private updateButtons()
		{
			const hasMedia = !!this.record.media;
			this.containButton.enabled = hasMedia;
			this.coverButton.enabled = hasMedia;
			
			if (hasMedia)
			{
				if (this.record.size === "contain")
					this.containButton.selected = true;
				
				else if (this.record.size === "cover")
					this.coverButton.selected = true;
			}
			
			if (this.videoTag)
				this.videoTag.style.objectFit = this.record.size;
		}
		
		/** */
		private updateMedia()
		{
			this.videoTag?.remove();
			
			if (!this.record.media)
				return;
			
			const src = this.record.media.getBlobUrl();
			const type = this.record.media.type;
			
			this.videoTag = Htx.video({
				src,
				type,
				playsInline: true,
				controls: true,
				width: "100%",
				height: "100%",
				objectFit: "contain",
			});
			
			const fillerVideoTag = Htx.video({
				src,
				type,
				controls: false,
				playsInline: true,
				
				objectFit: "fill",
				position: "absolute",
				top: -(ConstN.fillerContentBlur * 4) + "px",
				left: -(ConstN.fillerContentBlur * 4) + "px",
				width: `calc(100% + ${ConstN.fillerContentBlur * 8}px)`,
				height: `calc(100% + ${ConstN.fillerContentBlur * 8}px)`,
				filter: `blur(${ConstN.fillerContentBlur}px)`,
				zIndex: "-1",
			});
			
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
			UI.removeTogether(this.videoTag, fillerVideoTag);
		}
		
		private videoTag: HTMLVideoElement | null = null;
		
		/** */
		save()
		{
			
		}
	}
}
