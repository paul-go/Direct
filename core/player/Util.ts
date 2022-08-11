
namespace Player
{
	/**
	 * Causes the playback of the two videos to be synchronized.
	 */
	export function synchronizeVideos(
		srcVideo: HTMLVideoElement,
		fillerVideo: HTMLVideoElement)
	{
		srcVideo.onplay = () =>
		{
			fillerVideo.play();
		};
		
		srcVideo.onpause = () => fillerVideo.pause();
		srcVideo.onstalled = () => fillerVideo.pause();
		srcVideo.onended = () => fillerVideo.pause();
		
		srcVideo.onseeked = () =>
		{
			fillerVideo.currentTime = srcVideo.currentTime || 0;
		};
		
		srcVideo.onseeking = () =>
		{
			fillerVideo.currentTime = srcVideo.currentTime || 0;
		}
	}
}
