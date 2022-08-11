/// <reference path="Scene.ts" />

namespace Player
{
	/** */
	export class GalleryScene extends Scene
	{
		/** */
		constructor(readonly root: HTMLElement)
		{
			super(root);
			
			// Synchronize the videos
			const framesQuery = document.getElementsByClassName(CssClass.galleryFrame);
			const frames = Array.from(framesQuery) as HTMLElement[];
			
			for (const frame of frames)
			{
				const videos = frame.getElementsByTagName("video");
				const fillerVideo = videos.item(0)!;
				const mainVideo = videos.item(1)!;
				Player.synchronizeVideos(mainVideo, fillerVideo);
			}
		}
	}
}
