
namespace Cover
{
	/** */
	export async function coverPatchesView()
	{
		Turf.startup();
		
		const db = await Turf.createDatabase("coverPatchesView");
		
		const patches: Turf.PatchRecord[] = [];
		
		for (let i = -1; ++i < 20;)
		{
			const patch = new Turf.PatchRecord();
			
			if (i % 4 !== 0)
				patch.datePublished = Date.now();
			
			patches.push(patch);
		}
		
		await db.save(...patches);
		const patchesView = new Turf.PatchesView(db);
		
		Turf.apex.root.append(patchesView.root);
	}
}
