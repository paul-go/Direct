
/**
 * Stores a namespace of functions that handle the functionality
 * that is shared between the renderer and the editor.
 */
namespace Turf.RenderUtil
{
	/** */
	export function getCaptionSceneParams()
	{
		
	}
	
	/**
	 * Returns the aspect ratio of the specified image.
	 */
	export function getDimensions(src: string)
	{
		return new Promise<[number, number]>(r =>
		{
			document.body.append(Htx.img(
				{
					src,
					position: "absolute",
					left: "-1000000px",
				},
				Htx.on("load", ev =>
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
	export function resolveForegroundColor(colorIndex: number, meta: MetaRecord): UI.IColor
	{
		if (colorIndex < 0 || colorIndex >= meta.colorScheme.length)
			throw "Unknown color: " + colorIndex;
		
		const lightness = meta.colorScheme[colorIndex].l;
		return lightness < 80 ? white : black;
	}
	
	const black = { h: 0, s: 0, l: 0 };
	const white = { h: 0, s: 0, l: 100 };
	
	/**
	 * 
	 */
	export function resolveBackgroundColor(colorIndex: number, meta: MetaRecord): UI.IColor
	{
		if (colorIndex < 0 || colorIndex >= meta.colorScheme.length)
			throw "Unknown color: " + colorIndex;
		
		return meta.colorScheme[colorIndex];
	}
	
	/**
	 * 
	 */
	export function createImageFiller(src: string)
	{
		return Htx.div(
			UI.anchor(-ConstN.fillerContentBlur),
			{
				backgroundImage: src,
				backgroundSize: "100% 100%",
				filter: `blur(${ConstN.fillerContentBlur}px)`,
			}
		)
	}
	
	/**
	 * 
	 */
	export function createVideoFiller()
	{
		
	}
}
