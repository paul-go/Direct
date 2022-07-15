
namespace Cover
{
	/** */
	export async function coverRenderer()
	{
		Turf.appendCss();
		const meta = new Turf.MetaRecord();
		const patch = new Turf.PatchRecord();
		const blade = new Turf.ProseBladeRecord();
		blade.html = `<h2>Hello</h2>`;
		patch.blades.push(blade);
		
		const folder = getExportsFolder("coverRender");
		Turf.Exporter.exportPatch(patch, meta, folder);
	}
}
