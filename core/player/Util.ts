
namespace Player
{
	/**
	 * Causes the playback of the two videos to be synchronized.
	 */
	export function synchronizeVideos(
		mainVideo: HTMLVideoElement,
		fillerVideo: HTMLVideoElement)
	{
		mainVideo.onplay = () =>
		{
			fillerVideo.play();
		};
		
		mainVideo.onpause = () => fillerVideo.pause();
		mainVideo.onstalled = () => fillerVideo.pause();
		mainVideo.onended = () => fillerVideo.pause();
		
		mainVideo.onseeked = () =>
		{
			fillerVideo.currentTime = mainVideo.currentTime || 0;
		};
		
		mainVideo.onseeking = () =>
		{
			fillerVideo.currentTime = mainVideo.currentTime || 0;
		}
	}
}
