
namespace Cover
{
	/** */
	export async function coverPreview()
	{
		const { patch, meta } = setup();
		
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
		
		const media = new Turf.MediaRecord();
		media.blob = Cover.readSampleBlob("image-5.jpg");
		
		const background = new Turf.BackgroundRecord();
		background.media = media;
		background.zoom = 1;
		
		blade2.backgrounds.push(background);
		
		const blade3 = new Turf.ProseBladeRecord();
		
		blade3.html = `
			<h2>Heading Level 2</h2>
			<p>
				Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
				Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
				Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
			</p>
			<p>
				Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
				Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
				Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
			</p>
			<h2>Heading Level 2</h2>
			<p>
				Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
				Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
				Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
			</p>
			<p>
				Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
				Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
				Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
			</p>
		`;
		
		patch.blades.push(blade1, blade2, blade3);
		render(patch, meta);
	}
	
	/** */
	export async function coverPreviewCaptionedVariants()
	{
		const { patch, meta } = setup();
		const blade = new Turf.CaptionedBladeRecord();
		const variants: [number, number][] = [
			[3, 300],
			[5, 500],
			[7, 700],
			[9, 900],
		];
		
		for (const title of variants)
		{
			const [size, weight] = title;
			
			blade.titles.push({
				text: "Title: " + size + ", " + weight,
				size,
				weight,
			});
		}
		
		blade.origin = Turf.Ninth.center;
		patch.blades.push(blade);
		render(patch, meta);
	}
	
	/** */
	export async function coverPreviewCaptionedContentAlignment()
	{
		const { patch, meta } = setup();
		
		const origins = [
			Turf.Ninth.topLeft,
			Turf.Ninth.top,
			Turf.Ninth.topRight,
			Turf.Ninth.left,
			Turf.Ninth.center,
			Turf.Ninth.right,
			Turf.Ninth.bottomLeft,
			Turf.Ninth.bottom,
			Turf.Ninth.bottomRight,
		];
		
		for (const origin of origins)
		{
			const blade = new Turf.CaptionedBladeRecord();
			
			blade.titles.push({
				text: "Title1",
				size: 3,
				weight: 400
			});
			
			blade.origin = origin;
			patch.blades.push(blade);
		}
		
		render(patch, meta);
	}
	
	/** */
	export async function coverPreviewCaptionedColoring()
	{
		const { patch, meta } = setup();
		
		const blade1 = new Turf.CaptionedBladeRecord();
		
		blade1.titles.push({
			text: "White On Black",
			size: 10,
			weight: 900
		});
		
		blade1.backgroundColorIndex = Turf.ColorIndex.black;
		
		const blade2 = new Turf.CaptionedBladeRecord();
		
		blade2.titles.push({
			text: "Black On White",
			size: 10,
			weight: 900
		});
		
		blade2.backgroundColorIndex = Turf.ColorIndex.white;
		
		patch.blades.push(blade1, blade2);
		render(patch, meta);
	}
	
	/** */
	export async function coverPreviewCaptionedContent()
	{
		const { patch, meta } = setup();
		const blade = new Turf.CaptionedBladeRecord();
		
		blade.titles.push({
			text: "Title1",
			size: 3,
			weight: 400
		});
		
		blade.titles.push({
			text: "Title2",
			size: 5,
			weight: 700
		});
		
		blade.paragraphs.push(`
			Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
			Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
			Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
		`);
		
		blade.origin = Turf.Ninth.bottom;
		patch.blades.push(blade);
		render(patch, meta);
	}
	
	/** */
	export async function coverPreviewCaptionedBackgroundImage()
	{
		const { patch, meta } = setup();
		const blade = new Turf.CaptionedBladeRecord();
		const background = new Turf.BackgroundRecord();
		const media = new Turf.MediaRecord();
		media.blob = Cover.readSampleBlob("image-5.jpg");
		background.media = media;
		blade.backgrounds.push(background);
		patch.blades.push(blade);
		render(patch, meta);
	}
	
	/** */
	function setup()
	{
		Turf.appendCss();
		
		const meta = new Turf.MetaRecord();
		meta.colorScheme = [
			{ h: 215, s: 70, l: 50 },
			{ h: 325, s: 70, l: 50 },
		];
		
		const patch = new Turf.PatchRecord();
		return { patch, meta };
	}
	
	/** */
	function render(patch: Turf.PatchRecord, meta: Turf.MetaRecord)
	{
		const blade = new Turf.CaptionedBladeRecord();
		blade.titles.push({ text: "Done", size: 4, weight: 700 });
		patch.blades.push(blade);
		
		const preview = new Turf.PreviewView();
		document.body.append(preview.root);
		preview.render(patch, meta);
	}
}
