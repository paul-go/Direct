
namespace Cover
{
	/** */
	export function coverPatchView()
	{
		Turf.startup();
		
		const pv = new Turf.PatchView();
		const bv1 = new Turf.CaptionedBladeView();
		pv.blades.insert(bv1);
		
		const bv2 = new Turf.CaptionedBladeView();
		pv.blades.insert(bv2);
		
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
