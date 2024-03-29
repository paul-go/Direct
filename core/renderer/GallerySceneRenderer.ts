
namespace App
{
	/**
	 * 
	 */
	export class GallerySceneRenderer extends SceneRenderer<GallerySceneRecord>
	{
		/** */
		protected renderContents()
		{
			return [
				CssClass.galleryScene,
				...this.scene.frames.map(frame => this.renderFrame(frame))
			];
		}
		
		/** */
		private renderFrame(frame: FrameRecord)
		{
			if (!frame.media)
				return null;
			
			const frameDiv = Hot.div(CssClass.galleryFrame);
			const htmlSrc = this.getMediaUrl(frame.media);
			const isImage = Mime.classOf(frame.media.type) === Mime.Class.image;
			
			if (isImage)
			{
				const cssSrc = this.getMediaUrl(frame.media, "css");
				Hot.get(frameDiv)(
					frame.size === "contain" && RenderUtil.createImageFiller(cssSrc),
					Hot.img(
						{ src: htmlSrc },
						frame.size === "cover" ? { objectFit: "cover" } : {}
					)
				);
			}
			else
			{
				const mainVideo = RenderUtil.createVideo(htmlSrc, frame.media.type, frame.size);
				mainVideo.classList.add(Player.VideoFiller.fillObjectClass);
				frameDiv.append(mainVideo);
			}
			
			if (frame.captionLine1 || frame.captionLine2)
			{
				const legend = Hot.div(
					CssClass.galleryFrameLegend,
					frame.captionLine1 && Hot.p(new Text(frame.captionLine1)),
					frame.captionLine2 && Hot.p(new Text(frame.captionLine2)),
				);
				
				if (frame.size === "contain")
				{
					(async () =>
					{
						const [width, height] = await RenderUtil.getDimensions(frame.media!);
						legend.style.aspectRatio = width + " / " + height;
						frameDiv.append(legend);
					})();
				}
				else frameDiv.append(legend);
			}
			
			return frameDiv;
		}
	}
}
