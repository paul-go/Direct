
namespace Cover
{
	/** */
	export async function coverPatchesView()
	{
		await Turf.createApp({ shell: true });
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
		Cover.display(new Turf.PatchesView());
	}
}
