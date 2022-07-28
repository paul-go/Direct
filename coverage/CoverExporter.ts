
namespace Cover
{
	/** */
	export async function coverExporter()
	{
		Turf.appendCss();
		const meta = new Turf.MetaRecord();
		const patch = new Turf.PatchRecord();
		patch.slug = "slug";
		const blade = new Turf.CaptionedBladeRecord();
		blade.titles.push({ text: "Title", weight: 700, size: 10 });
		
		const background = new Turf.BackgroundRecord();
		background.media = readMedia("image-1.jpg");
		blade.backgrounds.push(background);
		
		patch.blades.push(blade);
		
		const folder = getExportsFolder();
		const publisher = new Turf.LocalPublisher(patch, meta);
		publisher.folder = folder;
		await publisher.publish();
		
		console.log("Done");
	}
}
