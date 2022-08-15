
namespace Cover
{
	/** */
	export async function coverDatabaseBasic()
	{
		const [db1, name] = await setup();
		
		const post = new App.PostRecord();
		const scene1 = new App.AttentionSceneRecord();
		const scene2 = new App.ProseSceneRecord();
		post.scenes.push(scene1, scene2);
		await db1.save(post, scene1, scene2);
		
		const db2 = await App.createDatabase({ name });
		const postOut = await db2.get<App.PostRecord>(post.id);
		if (!postOut)
			return () => "Fail";
		
		return [
			() => postOut.scenes.length === 2,
			() => postOut.scenes[0] instanceof App.AttentionSceneRecord,
			() => postOut.scenes[1] instanceof App.ProseSceneRecord,
		];
	}
	
	/** */
	export async function coverDatabaseInstance()
	{
		const [db1, name] = await setup();
		
		const media = new App.MediaRecord();
		media.name = "media.jpg";
		media.type = App.MimeType.jpg;
		media.blob = new Blob([new Uint8Array([1, 2])]);
		
		const bg = new App.BackgroundRecord();
		bg.size = 10;
		bg.position = [5, 6];
		bg.zoom = 1;
		bg.media = media;
		
		await db1.save(media, bg);
		
		const db2 = await App.createDatabase({ name });
		const bgOut = await db2.get<App.BackgroundRecord>(bg.id);
		if (!bgOut)
			return () => "Fail";
		
		return [
			() => bg.id === bgOut.id,
			() => bg.media && bgOut.media && bg.media.id === bgOut.media.id
		];
	}
	
	/** */
	export async function coverDatabaseMediaObject()
	{
		const [db] = await setup();
		
		const mo = new App.MediaRecord();
		const array = new Uint8Array([0, 1, 2, 3]);
		const blob = new Blob([array]);
		mo.blob = blob;
		await db.save(mo);
		
		const mout1 = await db.get<App.MediaRecord>(mo.id);
		const mout2 = await db.get<App.MediaRecord>(mo.id);
		
		return [
			() => mo === mout1,
			() => mout1 === mout2,
		];
	}
	
	/** */
	export async function coverDatabaseArrayReassignment()
	{
		const [db1, name] = await setup();
		
		const frame1 = new App.FrameRecord();
		const gallery = new App.GallerySceneRecord();
		gallery.frames.push(frame1);
		
		await db1.save(gallery);
		
		const frame2 = new App.FrameRecord();
		gallery.frames = [frame2];
		
		await db1.save(gallery);
		
		const db2 = await App.createDatabase({ name });
		const galleryOut = await db2.get<App.GallerySceneRecord>(gallery.id);
		
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
	export async function coverDatabaseIteration()
	{
		const [db1, name] = await setup();
		
		const media = new App.MediaRecord();
		
		const frame1 = new App.FrameRecord();
		frame1.captionLine1 = "Frame1";
		
		const frame2 = new App.FrameRecord();
		frame2.captionLine1 = "Frame2";
		
		const frame3 = new App.FrameRecord();
		frame3.captionLine1 = "Frame3";
		
		await db1.save(media, frame1, frame2, frame3);
		
		const db2 = await App.createDatabase({ name });
		const frames: App.FrameRecord[] = [];
		
		for await (const record of db2.each(App.FrameRecord, "peek"))
			frames.push(record);
		
		return [
			() => frames.length === 3,
			() => frames[0].captionLine1 === frame1.captionLine1,
			() => frames[1].captionLine1 === frame2.captionLine1,
			() => frames[2].captionLine1 === frame3.captionLine1,
		];
	}
	
	/** */
	export async function coverDatabaseAssignUnretainedToRetained()
	{
		const [db] = await setup();
		
		const post = new App.PostRecord();
		await db.save(post);
		
		const gallery = new App.GallerySceneRecord();
		const frame = new App.FrameRecord();
		const media = new App.MediaRecord();
		frame.media = media;
		gallery.frames.push(frame);
		post.scenes.push(gallery);
		
		return [
			() => !!post.id,
			() => !!gallery.id,
			() => !!frame.id,
			() => !!media.id
		];
	}
	
	/** */
	export async function coverDatabaseAutosaveAssignment()
	{
		const [db] = await setup();
		
		const post = new App.PostRecord();
		await db.save(post);
		
		const gallery = new App.GallerySceneRecord();
		post.scenes.push(gallery);
		
		await App.UI.wait(100);
		gallery.transition = "x";
		await App.UI.wait(100);
	}
	
	/** */
	export async function coverDatabaseAutosaveReassignment()
	{
		const [db] = await setup();
		
		const post = new App.PostRecord();
		await db.save(post);
		
		const prose1 = new App.ProseSceneRecord();
		const prose2 = new App.ProseSceneRecord();
		post.scenes.push(prose1, prose2);
		await App.UI.wait(100);
		const prose3 = new App.ProseSceneRecord();
		await App.UI.wait(100);
		
		console.log("Post1: " + post.id);
		console.log("Prose1: " + prose1.id);
		console.log("Prose2: " + prose2.id);
		console.log("Prose3: " + prose3.id);
		
		post.scenes = [prose2, prose3];
		
		await App.UI.wait(200);
		
		const allProseRecords: App.Record[] = [];
		
		for await (const record of db.each(App.ProseSceneRecord, "get"))
			allProseRecords.push(record);
		
		return [
			() => allProseRecords.length === 2,
			() => allProseRecords[0] === prose2,
			() => allProseRecords[1] === prose3,
		];
	}
	
	/** */
	export async function coverExport()
	{
		const [db] = await setup();
		
		const media = Cover.readMedia("image-5.jpg");
		const mediaSize = media.blob.size;
		
		const frame = new App.FrameRecord();
		frame.media = media;
		
		await db.save(media, frame);
		
		const exported = await db.export();
		exported.id = "new" + exported.id;
		exported.name = "new" + Math.random().toString().slice(-10);
		
		const blogBytesOut = await App.BlogFile.create(exported);
		
		const path = Electron.path.join(
			process.cwd(),
			ConstS.debugExportsFolderName,
			"database.zip");
		
		Electron.fs.writeFileSync(path, blogBytesOut);
		
		const blogBytesIn = new Uint8Array(Electron.fs.readFileSync(path));
		const databaseAbout = await App.BlogFile.parse(blogBytesIn);
		if (!databaseAbout)
			throw "Invalid .zip file";
		
		const newDatabase = await App.createDatabase(databaseAbout);
		const frameNew = await newDatabase.get(frame.id);
		const mediaNew = await newDatabase.get(media.id);
		
		return [
			() => frameNew instanceof App.FrameRecord,
			() => mediaNew instanceof App.MediaRecord,
			() => (mediaNew as App.MediaRecord).blob instanceof Blob,
			() => (mediaNew as App.MediaRecord).blob.size === mediaSize,
		];
	}
	
	/** */
	async function setup()
	{
		const name = Moduless.getRunningFunctionName();
		await App.Database.delete(name);
		const db = await App.createDatabase({ name });
		return [db, name] as [App.Database, string];
	}
}
