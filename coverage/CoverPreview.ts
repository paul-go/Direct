
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
		
		const background = new Turf.BackgroundRecord();
		background.media = Cover.readMedia("image-5.jpg");
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
	export function coverPreviewCaptionedBackgroundImage()
	{
		const { patch, meta } = setup();
		const blade = new Turf.CaptionedBladeRecord();
		const background = new Turf.BackgroundRecord();
		background.media = Cover.readMedia("image-5.jpg");
		blade.backgrounds.push(background);
		patch.blades.push(blade);
		render(patch, meta);
	}
	
	/** */
	export function coverPreviewCaptionedBackgroundVideo()
	{
		const { patch, meta } = setup();
		const blade = new Turf.CaptionedBladeRecord();
		blade.titles.push({ text: "Video", size: 20, weight: 900 });
		const background = new Turf.BackgroundRecord();
		background.media = Cover.readMedia("video-1.mp4");
		blade.backgrounds.push(background);
		patch.blades.push(blade);
		render(patch, meta);
	}
	
	/** */
	export function coverPreviewGallery()
	{
		const { patch, meta } = setup();
		
		const blade = new Turf.GalleryBladeRecord();
		
		const frame1 = new Turf.FrameRecord();
		frame1.media = Cover.readMedia("image-1.jpg");
		frame1.captionLine1 = "Caption Line 1";
		frame1.size = "cover";
		
		const frame2 = new Turf.FrameRecord();
		frame2.media = Cover.readMedia("image-2.jpg");
		
		const frame3 = new Turf.FrameRecord();
		frame3.media = Cover.readMedia("image-3.jpg");
		frame3.captionLine1 = "Caption Line 1";
		frame3.captionLine2 = "Caption Line 2";
		
		blade.frames.push(frame1, frame2, frame3);
		patch.blades.push(blade);
		render(patch, meta);
	}
	
	/** */
	export function coverPreviewProse()
	{
		const { patch, meta } = setup();
		
		const html = (n: number) => `
			<h2>Heading ${n}</h2>
			<p>
				Social media platforms have done great work in facilitating new connections between people. However, they are increasingly transforming into parasitic entities. Their primary goal is to enrich the platforms themselves, as well as their direct corporate and buerocratic stakeholders, oftentimes at the expense of the users they are purported to serve.
			</p>
			<p>
				Numerous solutions have been tabled to purportedly "fix social media". However, they range from complete technological digressions (blockchain-centric solutions), attempts to move the problem around rather than actually solve it (alternative social networks), and unscalable designs with unsolvable user experience issues (federated models).
			</p>
		`;
		
		const blade1 = new Turf.ProseBladeRecord();
		blade1.html = html(1) + html(2) + html(3) + html(4) + html(5);
		blade1.backgroundColorIndex = Turf.ColorIndex.white;
		
		const blade2 = new Turf.ProseBladeRecord();
		blade2.html = html(1) + html(2) + html(3) + html(4) + html(5);
		blade2.backgroundColorIndex = Turf.ColorIndex.black;
		
		const blade3 = new Turf.ProseBladeRecord();
		blade3.html = html(1);
		blade3.backgroundColorIndex = 1;
		
		patch.blades.push(blade1, blade2, blade3);
		render(patch, meta);
	}
	
	/** */
	export function coverPreviewVideo()
	{
		const { patch, meta } = setup();
		
		const blade1 = new Turf.VideoBladeRecord();
		blade1.media = Cover.readMedia("video-1.mp4");
		blade1.size = "contain";
		
		const blade2 = new Turf.VideoBladeRecord();
		blade2.media = Cover.readMedia("video-1.mp4");
		blade2.size = "cover";
		
		patch.blades.push(blade1, blade2);
		render(patch, meta);
	}
	
	/** */
	function setup()
	{
		Turf.appendCss();
		
		const meta = new Turf.MetaRecord();
		meta.colorScheme = [
			{ h: 215, s: 70, l: 30 },
			{ h: 325, s: 70, l: 30 },
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
