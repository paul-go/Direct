
namespace Cover
{
	/** */
	export async function coverPatchViewEmpty()
	{
		await Turf.createApp({ shell: true });
		const pv = new Turf.PatchView();
		Cover.display(pv);
	}
	
	/** */
	export async function coverPatchViewWithCaptioned()
	{
		await Turf.createApp({ shell: true });
		const pv = new Turf.PatchView();
		const bv1 = new Turf.CaptionedBladeView();
		const bv2 = new Turf.CaptionedBladeView();
		pv.blades.insert(bv1);
		pv.blades.insert(bv2);
		Cover.display(pv);
	}
	
	/** */
	export async function coverPatchViewWithGallery()
	{
		await Turf.createApp({ shell: true });
		const pv = new Turf.PatchView();
		const bv = new Turf.GalleryBladeView();
		pv.blades.insert(bv);
		Cover.display(pv);
	}
	
	/** */
	export async function coverPatchViewWithVideo()
	{
		await Turf.createApp({ shell: true });
		const pv = new Turf.PatchView();
		const bv = new Turf.VideoBladeView();
		pv.blades.insert(bv);
		Cover.display(pv);
	}
	
	/** */
	export async function coverPatchViewWithProse()
	{
		await Turf.createApp({ shell: true });
		const pv = new Turf.PatchView();
		const bv = new Turf.ProseBladeView();
		pv.blades.insert(bv);
		Cover.display(pv);
	}
	
	/** */
	export async function coverDrag()
	{
		document.body.append(
			Htx.div(
				"parent",
				{
					...Turf.UI.anchorTopRight(20, 20),
					width: "200px",
					height: "200px",
					backgroundColor: "rgba(0, 0, 0, 0.3)",
				},
				
				Htx.on("dragenter", ev =>
				{
					ev.preventDefault();
				},
				{ capture: true }),
				
				Htx.on("dragleave", ev =>
				{
					ev.preventDefault();
				},
				{ capture: true }),
				
				Htx.div(
					"child",
					{
						width: "100px",
						height: "100px",
						backgroundColor: "rgba(0, 0, 0, 0.3)",
					}
				)
			)
		);
	}
}
