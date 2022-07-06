
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
	
	/** */
	export function getAspectRatio(src: string)
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
}
