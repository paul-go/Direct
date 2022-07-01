
namespace Cover
{
	/** */
	export async function coverDatabase()
	{
		const dbName = "example";
		await Turf.Database.delete(dbName);
		
		const db = await Turf.Database.new(dbName,
			Turf.MetaRecord,
			Turf.PatchRecord,
			Turf.CaptionedBladeRecord,
			Turf.ProseBladeRecord,
			Turf.VideoBladeRecord,
			Turf.GalleryBladeRecord,
		);
		
		const patch = new Turf.PatchRecord();
		const blade1 = new Turf.CaptionedBladeRecord();
		const blade2 = new Turf.ProseBladeRecord();
		patch.blades.push(blade1, blade2);
		await db.set(patch, blade1, blade2);
		
		const patchOut = await db.get(Turf.PatchRecord, patch.id);
		if (!patchOut)
			return () => "Fail";
		
		return [
			() => patchOut.blades.length === 2,
			() => patchOut.blades[0] instanceof Turf.CaptionedBladeRecord,
			() => patchOut.blades[1] instanceof Turf.ProseBladeRecord,
		];
	}
}
