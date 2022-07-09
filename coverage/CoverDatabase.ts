
namespace Cover
{
	/** */
	export async function coverDatabase()
	{
		const dbName = "coverDatabase";
		await Turf.Back.delete(dbName);
		const db1 = await Turf.createDatabase(dbName);
		
		const patch = new Turf.PatchRecord();
		const blade1 = new Turf.CaptionedBladeRecord();
		const blade2 = new Turf.ProseBladeRecord();
		patch.blades.push(blade1, blade2);
		await db1.save(patch, blade1, blade2);
		
		const db2 = await Turf.createDatabase(dbName);
		const patchOut = await db2.get<Turf.PatchRecord>(patch.id);
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
		await Turf.Back.delete(dbName);
		const db1 = await Turf.createDatabase(dbName);
		
		const media = new Turf.MediaRecord();
		media.name = "media.jpg";
		media.type = Turf.MimeType.jpg;
		media.blob = new Blob([new Uint8Array([1, 2])]);
		
		const bg = new Turf.BackgroundRecord();
		bg.crop = [1, 2, 3, 4];
		bg.position = [5, 6];
		bg.zoom = 1;
		bg.media = media;
		
		await db1.save(media, bg);
		
		const db2 = await Turf.createDatabase(dbName);
		const bgOut = await db2.get<Turf.BackgroundRecord>(bg.id);
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
		await Turf.Back.delete(dbName);
		const db = await Turf.createDatabase(dbName);
		
		const mo = new Turf.MediaRecord();
		const array = new Uint8Array([0, 1, 2, 3]);
		const blob = new Blob([array]);
		mo.blob = blob;
		await db.save(mo);
		
		const mout1 = await db.get<Turf.MediaRecord>(mo.id);
		const mout2 = await db.get<Turf.MediaRecord>(mo.id);
		
		return [
			() => mo === mout1,
			() => mout1 === mout2,
		];
	}
	
	/** */
	export async function coverArrayReassignment()
	{
		const dbName = "coverArrayReassignment";
		await Turf.Back.delete(dbName);
		const db1 = await Turf.createDatabase(dbName);
		
		const frame1 = new Turf.FrameRecord();
		const gallery = new Turf.GalleryBladeRecord();
		gallery.frames.push(frame1);
		
		await db1.save(gallery);
		
		const frame2 = new Turf.FrameRecord();
		gallery.frames = [frame2];
		
		await db1.save(gallery);
		
		const db2 = await Turf.createDatabase(dbName);
		const galleryOut = await db2.get<Turf.GalleryBladeRecord>(gallery.id);
		
		if (!galleryOut)
			return () => !"Fail";
		
		const f0 = gallery.frames[0];
		const outF0 = galleryOut.frames[0];
		
		return [
			() => gallery.frames.length === 1,
			() => galleryOut.frames.length === 1,
			() => f0.id === outF0.id,
		];
	}
	
	/** */
	export async function coverIteration()
	{
		const dbName = "coverIteration";
		await Turf.Back.delete(dbName);
		const db1 = await Turf.createDatabase(dbName);
		
		const media = new Turf.MediaRecord();
		
		const frame1 = new Turf.FrameRecord();
		frame1.captionLine1 = "Frame1";
		
		const frame2 = new Turf.FrameRecord();
		frame2.captionLine1 = "Frame2";
		
		const frame3 = new Turf.FrameRecord();
		frame3.captionLine1 = "Frame3";
		
		await db1.save(media, frame1, frame2, frame3);
		
		const db2 = await Turf.createDatabase(dbName);
		const frames: Turf.FrameRecord[] = [];
		
		for await (const record of db2.each(Turf.FrameRecord, "peek"))
			frames.push(record);
		
		return [
			() => frames.length === 3,
			() => frames[0].captionLine1 === frame1.captionLine1,
			() => frames[1].captionLine1 === frame2.captionLine1,
			() => frames[2].captionLine1 === frame3.captionLine1,
		];
	}
}
