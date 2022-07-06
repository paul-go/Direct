
namespace Cover
{
	/** */
	export function coverPatchViewEmpty()
	{
		Turf.startup();
		const pv = new Turf.PatchView();
		Turf.apex.root.append(pv.root);
	}
	
	/** */
	export function coverPatchViewWithCaptioned()
	{
		Turf.startup();
		const pv = new Turf.PatchView();
		const bv1 = new Turf.CaptionedBladeView();
		const bv2 = new Turf.CaptionedBladeView();
		pv.blades.insert(bv1);
		pv.blades.insert(bv2);
		Turf.apex.root.append(pv.root);
	}
	
	/** */
	export function coverPatchViewWithGallery()
	{
		Turf.startup();
		const pv = new Turf.PatchView();
		const bv = new Turf.GalleryBladeView();
		pv.blades.insert(bv);
		Turf.apex.root.append(pv.root);
	}
	
	/** */
	export function coverPatchViewWithVideo()
	{
		Turf.startup();
		
		const pv = new Turf.PatchView();
		const bv = new Turf.VideoBladeView();
		pv.blades.insert(bv);
		Turf.apex.root.append(pv.root);
	}
	
	/** */
	export function coverPatchViewWithProse()
	{
		Turf.startup();
		const pv = new Turf.PatchView();
		const bv = new Turf.ProseBladeView();
		pv.blades.insert(bv);
		Turf.apex.root.append(pv.root);
	}
	
	/** */
	export function coverDrag()
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
