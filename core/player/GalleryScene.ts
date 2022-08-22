/// <reference path="Scene.ts" />

namespace Player
{
	/** */
	export class GalleryScene extends Scene
	{
		/** */
		constructor(readonly head: HTMLElement)
		{
			super(head);
			
			// Synchronize the videos
			const framesQuery = document.getElementsByClassName(CssClass.galleryFrame);
			const frames = Array.from(framesQuery) as HTMLElement[];
			
			for (const frame of frames)
			{
				const videos = frame.getElementsByTagName("video");
				if (videos.length > 1)
				{
					const fillerVideo = videos.item(0)!;
					const mainVideo = videos.item(1)!;
					Player.synchronizeVideos(mainVideo, fillerVideo);
				}
			}
		}
	}
}
