/// <reference path="./ui/ApexView.ts" />

namespace Turf
{
	if (DEBUG && typeof module === "object")
	{
		Object.assign(module.exports, { Turf });
		global["Turf"] = Turf;
	}
	
	/** */
	export function startup()
	{
		Turf.appendCss();
		
		Htx.from(document.body)({
			margin: "0",
			padding: "0",
			color: "white",
			backgroundColor: "black",
		});
		
		document.body.append(apex.root);
	}
	
	/** */
	export function createDatabase(name: string)
	{
		return Turf.Back.new(name,
			{ ctor: Turf.MetaRecord, stable: 1 },
			{ ctor: Turf.PatchRecord, stable: 2 },
			{ ctor: Turf.CaptionedBladeRecord, stable: 3 },
			{ ctor: Turf.ProseBladeRecord, stable: 4 },
			{ ctor: Turf.VideoBladeRecord, stable: 5 },
			{ ctor: Turf.GalleryBladeRecord, stable: 6 },
			{ ctor: Turf.FrameRecord, stable: 7 },
			{ ctor: Turf.MediaRecord, stable: 8 },
			{ ctor: Turf.BackgroundRecord, stable: 9 },
		);
	}
	
	export const apex = new ApexView();
}

// Temporary startup function
if (DEBUG && !ELECTRON)
{
	setTimeout(() =>
	{
		Turf.startup();
			
		const pv = new Turf.PatchView();
		const bv1 = new Turf.CaptionedBladeView();
		pv.blades.insert(bv1);
		
		const bv2 = new Turf.CaptionedBladeView();
		pv.blades.insert(bv2);
		
		Turf.apex.root.append(pv.root);
	});
}
