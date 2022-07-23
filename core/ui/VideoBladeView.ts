
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
					onFileDrop(files => this.importMedia(files))
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
		private importMedia(files: FileLike[])
		{
			const mediaRecords = this.createMediaRecords(files, [MimeClass.video]);
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
			
			this.videoTag = RenderUtil.createVideo(src, type, this.record.size);
			const videoFillerTag = RenderUtil.createVideoFiller(this.videoTag);
			
			this.videoContainer.append(videoFillerTag, this.videoTag);
			UI.removeTogether(this.videoTag, videoFillerTag);
		}
		
		private videoTag: HTMLVideoElement | null = null;
	}
}
