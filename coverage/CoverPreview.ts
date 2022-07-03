
namespace Cover
{
	/** */
	export async function coverPreview()
	{
		Turf.appendCss();
		
		const meta = new Turf.MetaRecord();
		meta.colorScheme = [
			{ h: 215, s: 70, l: 50 },
			{ h: 325, s: 70, l: 50 },
		];
		
		const patch = new Turf.PatchRecord();
		const blade1 = new Turf.CaptionedBladeRecord();
		
		blade1.titles.push({
			text: "Title1",
			size: 3,
			weight: 500
		});
		
		blade1.titles.push({ 
			text: "Title2",
			size: 5,
			weight: 700
		});
		
		blade1.paragraphs.push("Blade 1 paragraph content.");
		blade1.backgroundColorIndex = Turf.ColorIndex.black;
		
		const blade2 = new Turf.CaptionedBladeRecord();
		
		blade2.titles.push({ 
			text: "Title3",
			size: 3,
			weight: 500
		});
		
		blade2.titles.push({ 
			text: "Title4",
			size: 5,
			weight: 700
		});
		
		blade2.paragraphs.push("Blade 2 paragraph content.");
		blade2.backgroundColorIndex = Turf.ColorIndex.white;
		
		patch.blades.push(blade1, blade2);
		const preview = new Turf.PreviewView();
		document.body.append(preview.root);
		preview.render(patch, meta);
	}
}
