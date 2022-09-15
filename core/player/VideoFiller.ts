
namespace Player
{
	/**
	 * A service that runs in the background, watching for HTML video tags
	 *  to be added to the DOM that have the filler class assigned.
	 */
	export namespace VideoFiller
	{
		/**
		 * The class to add to <video> elements to instruct that they should
		 * be displayed with the filled style.
		 */
		export const fillObjectClass = "fill-object";
		
		/**
		 * THIS FUNCTION IS PERFORMANCE CRITICAL.
		 * Don't do anything unnecessary in this function,
		 * it is called every time an element is inserted into the DOM.
		 */
		function findVideos()
		{
			const videos = document.getElementsByClassName(fillObjectClass);
			if (videos.length === 0)
				return;
			
			for (let i = videos.length; i-- > 0;)
			{
				const video = videos.item(i);
				
				if (video)
					video.classList.remove(fillObjectClass);
				
				if (video instanceof HTMLVideoElement)
					fillVideo(video);
			}
		}
		
		/** */
		function fillVideo(video: HTMLVideoElement)
		{
			const filler = document.createElement("video");
			video.setAttribute("type", video.getAttribute("type") || "");
			filler.src = video.src;
			filler.controls = false;
			filler.playsInline = true;
			
			{
				const s = filler.style;
				s.objectFit = "fill";
				s.position = "absolute";
				s.top = -(ConstN.fillerContentBlur * 4) + "px";
				s.left = -(ConstN.fillerContentBlur * 4) + "px";
				s.width = `calc(100% + ${ConstN.fillerContentBlur * 8}px)`;
				s.height = `calc(100% + ${ConstN.fillerContentBlur * 8}px)`;
				s.filter = `blur(${ConstN.fillerContentBlur}px)`;
			}
			
			const container = document.createElement("div");
			{
				const s = container.style;
				s.position = "absolute";
				s.zIndex = "-1";
				s.overflow = "hidden";
				container.append(filler);
			}
			
			video.before(container);
			video.onplay = () => filler.play();
			video.onpause = () => filler.pause();
			video.onstalled = () => filler.pause();
			video.onended = () => filler.pause();
			
			video.onseeked = () =>
			{
				filler.currentTime = video.currentTime || 0;
			};
			
			video.onseeking = () =>
			{
				filler.currentTime = video.currentTime || 0;
			}
			
			setTimeout(() =>
			{
				container.style.width = filler.offsetWidth + "px";
				container.style.height = filler.offsetHeight + "px";
				
				Player.observeResize(video, rect =>
				{
					container.style.width = rect.width + "px";
					container.style.height = rect.height + "px";
				});
			});
		}
		
		const mo = new MutationObserver(findVideos);
		mo.observe(document.body, { childList: true, subtree: true });
		findVideos();
	}
}
