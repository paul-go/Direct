
namespace Cover
{
	/** */
	export async function coverDatabase()
	{
		const dbName = "coverDatabase";
		await Turf.Database.delete(dbName);
		const db = await Turf.createDatabase(dbName);
		
		const patch = new Turf.PatchRecord();
		const blade1 = new Turf.CaptionedBladeRecord();
		const blade2 = new Turf.ProseBladeRecord();
		patch.blades.push(blade1, blade2);
		await db.save(patch, blade1, blade2);
		
		const patchOut = await db.get(Turf.PatchRecord, patch.id);
		if (!patchOut)
			return () => "Fail";
		
		return [
			() => patchOut.blades.length === 2,
			() => patchOut.blades[0] instanceof Turf.CaptionedBladeRecord,
			() => patchOut.blades[1] instanceof Turf.ProseBladeRecord,
		];
	}
	
	/** */
	export async function coverInstance()
	{
		const dbName = "coverInstance";
		await Turf.Database.delete(dbName);
		const db = await Turf.createDatabase(dbName);
		
		const media = new Turf.MediaRecord();
		media.name = "media.jpg";
		media.type = Turf.MimeType.jpg;
		media.blob = new Blob([new Uint8Array([1, 2])]);
		
		const bg = new Turf.BackgroundRecord();
		bg.crop = [1, 2, 3, 4];
		bg.position = [5, 6];
		bg.zoom = 1;
		bg.media = media;
		
		await db.save(media, bg);
		
		const bgOut = await db.get(Turf.BackgroundRecord, bg.id);
		if (!bgOut)
			return () => "Fail";
		
		return [
			() => bg.id === bgOut.id,
			() => bg.media && bgOut.media && bg.media.id === bgOut.media.id
		];
	}
	
	/** */
	export async function coverMediaObject()
	{
		const dbName = "coverMediaObject";
		await Turf.Database.delete(dbName);
		const db = await Turf.createDatabase(dbName);
		
		const mo = new Turf.MediaRecord();
		const array = new Uint8Array([0, 1, 2, 3]);
		const blob = new Blob([array]);
		mo.blob = blob;
		await db.save(mo);
		
		const mout1 = await db.get(Turf.MediaRecord, mo.id);
		const mout2 = await db.get(Turf.MediaRecord, mo.id);
		
		return [
			() => mo === mout1,
			() => mout1 === mout2,
		];
	}
}
