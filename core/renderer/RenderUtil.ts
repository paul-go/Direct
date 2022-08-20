/// <reference path="../ui/UI.ts" />

/**
 * Stores a namespace of functions that handle the functionality
 * that is shared between the renderer and the editor.
 */
namespace App.RenderUtil
{
	/**
	 * Returns the aspect ratio of the specified image.
	 */
	export function getDimensions(src: string)
	{
		return new Promise<[number, number]>(r =>
		{
			document.body.append(Hot.img(
				{
					src,
					position: "absolute",
					left: "-1000000px",
				},
				Hot.on("load", ev =>
				{
					const img = ev.target as HTMLImageElement;
					const [w, h] = [img.clientWidth, img.clientHeight];
					img.remove();
					r([w, h]);
				})
			));
		});
	}
	
	/**
	 * 
	 */
	export function resolveColors(record: SceneRecord)
	{
		const contrast = record.contrast;
		const hasColor = record.hasColor;
		const [darkHsl, lightHsl] = record.colorPair;
		
		const darkColor = hasColor ?
			UI.color({ h: darkHsl[0], s: darkHsl[1], l: darkHsl[2] }) :
			black;
		
		const lightColor = hasColor ?
			UI.color({ h: lightHsl[0], s: lightHsl[1], l: lightHsl[2] }) :
			white;
		
		return {
			/** Used for the background. */
			back: contrast < 0 ? lightColor : darkColor,
			/** Used for colored objects. */
			fore: contrast < 0 ? darkColor : lightColor,
			/** Used for uncolored text. */
			default: contrast < 0 ? black : white,
		};
	}
	
	const black = UI.color({ h: 0, s: 0, l: 0 });
	const white = UI.color({ h: 0, s: 0, l: 100 });
	
	/**
	 * A number between 0 (fully black) and 100 (fully white) that
	 * indicates the amount of contrast to render with.
	 * A value of 50 removes the text contrast from the element.
	 */
	export function setContrast(e: HTMLElement, amount: number)
	{
		e.classList.remove(
			CssClass.textContrast,
			CssClass.textContrastDark,
			CssClass.textContrastLight);
		
		e.style.removeProperty(ConstS.contrastProperty);
		
		if (amount !== 0)
		{
			amount /= 100;
			
			e.classList.add(
				CssClass.textContrast,
				amount > 0 ?
					CssClass.textContrastDark : 
					CssClass.textContrastLight);
			
			e.style.setProperty(ConstS.contrastProperty, Math.abs(amount).toString());
		}
		
		return e;
	}
	
	/**
	 * 
	 */
	export function createImageFiller(src: string)
	{
		return Hot.div(
			UI.anchor(-ConstN.fillerContentBlur),
			{
				backgroundImage: src,
				backgroundSize: "100% 100%",
				filter: `blur(${ConstN.fillerContentBlur}px)`,
			}
		);
	}
	
	/**
	 * 
	 */
	export function createVideo(
		src: string,
		mimeType: MimeType,
		size: SizeMethod = "contain")
	{
		return Hot.video({
			src,
			type: mimeType,
			playsInline: true,
			controls: true,
			width: "100%",
			height: "100%",
			objectFit: size,
		});
	}
	
	/**
	 * 
	 */
	export function createVideoFiller(src: string, srcVideo: HTMLVideoElement)
	{
		const type = srcVideo.getAttribute("type") || "";
		let fillerVideo: HTMLVideoElement;
		
		const container = Hot.div(
			"video-filler",
			UI.anchor(),
			{
				overflow: "hidden",
				zIndex: "-1",
			},
			fillerVideo = Hot.video({
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
			})
		);
		
		Player.synchronizeVideos(srcVideo, fillerVideo);
		return container;
	}
	
	/**
	 * 
	 */
	export function createVideoBackground(src: string, mimeType: string)
	{
		return Hot.video({
			src,
			type: mimeType,
			playsInline: true,
			controls: false,
			autoplay: true,
			muted: true,
			loop: true,
			width: "100%",
			height: "100%",
			objectFit: "cover",
			...UI.anchor()
		});
	}
}
