
namespace Cover
{
	/** */
	export async function coverPreview()
	{
		const { post, meta } = setup();
		
		const scene1 = new App.AttentionSceneRecord();
		
		scene1.titles.push({
			text: "Title1",
			size: 3,
			weight: 500
		});
		
		scene1.titles.push({
			text: "Title2",
			size: 5,
			weight: 700
		});
		
		scene1.description = "Scene 1 paragraph content.";
		scene1.backgroundColorIndex = App.ColorScheme.blackIndex;
		
		const scene2 = new App.AttentionSceneRecord();
		
		scene2.titles.push({ 
			text: "Title3",
			size: 3,
			weight: 500
		});
		
		scene2.titles.push({ 
			text: "Title4",
			size: 5,
			weight: 700
		});
		
		scene2.description = "Scene 2 paragraph content.";
		scene2.backgroundColorIndex = App.ColorScheme.whiteIndex;
		
		const background = new App.BackgroundRecord();
		background.media = Cover.readMedia("image-5.jpg");
		background.zoom = 1;
		
		scene2.backgrounds.push(background);
		
		const scene3 = new App.ProseSceneRecord();
		
		post.scenes.push(scene1, scene2, scene3);
		render(post, meta);
	}
	
	/** */
	export async function coverPreviewAttentionVariants()
	{
		const { post, meta } = setup();
		const scene = new App.AttentionSceneRecord();
		const variants: [number, number][] = [
			[3, 300],
			[5, 500],
			[7, 700],
			[9, 900],
		];
		
		for (const title of variants)
		{
			const [size, weight] = title;
			
			scene.titles.push({
				text: "Title: " + size + ", " + weight,
				size,
				weight,
			});
		}
		
		scene.origin = Origin.center;
		post.scenes.push(scene);
		render(post, meta);
	}
	
	/** */
	export async function coverPreviewAttentionContentAlignment()
	{
		const { post, meta } = setup();
		
		const origins = [
			Origin.topLeft,
			Origin.top,
			Origin.topRight,
			Origin.left,
			Origin.center,
			Origin.right,
			Origin.bottomLeft,
			Origin.bottom,
			Origin.bottomRight,
		];
		
		for (const origin of origins)
		{
			const scene = new App.AttentionSceneRecord();
			
			scene.titles.push({
				text: "Title1",
				size: 3,
				weight: 400
			});
			
			scene.origin = origin;
			post.scenes.push(scene);
		}
		
		render(post, meta);
	}
	
	/** */
	export async function coverPreviewAttentionColoring()
	{
		const { post, meta } = setup();
		
		const scene1 = new App.AttentionSceneRecord();
		
		scene1.titles.push({
			text: "White On Black",
			size: 10,
			weight: 900
		});
		
		scene1.backgroundColorIndex = App.ColorScheme.blackIndex;
		
		const scene2 = new App.AttentionSceneRecord();
		
		scene2.titles.push({
			text: "Black On White",
			size: 10,
			weight: 900
		});
		
		scene2.backgroundColorIndex = App.ColorScheme.whiteIndex;
		
		post.scenes.push(scene1, scene2);
		render(post, meta);
	}
	
	/** */
	export async function coverPreviewAttentionContent()
	{
		const { post, meta } = setup();
		const scene = new App.AttentionSceneRecord();
		
		scene.titles.push({
			text: "Title1",
			size: 3,
			weight: 400
		});
		
		scene.titles.push({
			text: "Title2",
			size: 5,
			weight: 700
		});
		
		scene.description = `
			Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
			Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
			Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
		`;
		
		scene.origin = Origin.bottom;
		post.scenes.push(scene);
		render(post, meta);
	}
	
	/** */
	export function coverPreviewAttentionBackgroundImage()
	{
		const { post, meta } = setup();
		const scene = new App.AttentionSceneRecord();
		const background = new App.BackgroundRecord();
		background.media = Cover.readMedia("image-5.jpg");
		scene.backgrounds.push(background);
		post.scenes.push(scene);
		render(post, meta);
	}
	
	/** */
	export function coverPreviewAttentionBackgroundVideo()
	{
		const { post, meta } = setup();
		const scene = new App.AttentionSceneRecord();
		scene.titles.push({ text: "Video", size: 20, weight: 900 });
		const background = new App.BackgroundRecord();
		background.media = Cover.readMedia("video-1.mp4");
		scene.backgrounds.push(background);
		post.scenes.push(scene);
		render(post, meta);
	}
	
	/** */
	export function coverPreviewGallery()
	{
		const { post, meta } = setup();
		
		const scene = new App.GallerySceneRecord();
		
		const frame0 = new App.FrameRecord();
		frame0.media = Cover.readMedia("video-1.mp4");
		
		const frame1 = new App.FrameRecord();
		frame1.media = Cover.readMedia("image-1.jpg");
		frame1.captionLine1 = "Caption Line 1";
		frame1.size = "cover";
		
		const frame2 = new App.FrameRecord();
		frame2.media = Cover.readMedia("image-2.jpg");
		
		const frame3 = new App.FrameRecord();
		frame3.media = Cover.readMedia("image-3.jpg");
		frame3.captionLine1 = "Caption Line 1";
		frame3.captionLine2 = "Caption Line 2";
		
		scene.frames.push(frame0, frame1, frame2, frame3);
		post.scenes.push(scene);
		render(post, meta);
	}
	
	/** */
	export function coverPreviewProse()
	{
		const { post, meta } = setup();
		
		const createBlocks = (n: number): ITrixSerializedBlock[] => [
			{
				text: [
					{
						type: "string",
						attributes: {},
						string: "Heading " + n
					},
				],
				attributes: [
					"heading1"
				]
			},
			{
				text: [
					{
						type: "string",
						attributes: {},
						string: "Social media platforms have done great work in facilitating new connections between people. However, they are increasingly transforming into parasitic entities. Their primary goal is to enrich the platforms themselves, as well as their direct corporate and buerocratic stakeholders, oftentimes at the expense of the users they are purported to serve."
					},
					{
						type: "string",
						attributes: {
							blockBreak: true
						},
						string: "\n"
					},
					{
						type: "string",
						attributes: {},
						string: `Numerous solutions have been tabled to purportedly "fix social media". However, they range from complete technological digressions (blockchain-centric solutions), attempts to move the problem around rather than actually solve it (alternative social networks), and unscalable designs with unsolvable user experience issues (federated models).`
					}
				],
				attributes: []
			}
		];
		
		const getContent = (count: number): ITrixSerializedObject =>
		{
			const document: ITrixSerializedBlock[] = [];
			
			for (let i = -1; ++i < count;)
				document.push(...createBlocks(i));
			
			return {
				document,
				selectedRange: [0, 0]
			}
		};
		
		const scene1 = new App.ProseSceneRecord();
		scene1.content = getContent(5);
		scene1.backgroundColorIndex = App.ColorScheme.whiteIndex;
		
		const scene2 = new App.ProseSceneRecord();
		scene2.content = getContent(5);
		scene2.backgroundColorIndex = App.ColorScheme.blackIndex;
		
		const scene3 = new App.ProseSceneRecord();
		scene3.content = getContent(1);
		scene3.backgroundColorIndex = 1;
		
		post.scenes.push(scene1, scene2, scene3);
		render(post, meta);
	}
	
	/** */
	function setup()
	{
		App.appendCss();
		
		const meta = new App.MetaRecord();
		meta.colorScheme = [
			{ h: 215, s: 70, l: 30 },
			{ h: 325, s: 70, l: 30 },
		];
		
		const post = new App.PostRecord();
		return { post, meta };
	}
	
	/** */
	function render(post: App.PostRecord, meta: App.MetaRecord)
	{
		const scene = new App.AttentionSceneRecord();
		scene.titles.push({ text: "Done", size: 4, weight: 700 });
		post.scenes.push(scene);
		new App.PreviewView(post, meta);
	}
}
