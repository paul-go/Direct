
namespace Cover
{
	/** */
	export async function coverPreview()
	{
		const { post, blog } = await setup();
		
		const scene1 = new App.CanvasSceneRecord();
		
		scene1.titles.push({
			text: "Title1",
			size: 3,
			weight: 500,
			hasColor: false,
		});
		
		scene1.titles.push({
			text: "Title2",
			size: 5,
			weight: 700,
			hasColor: false,
		});
		
		scene1.description = "Scene 1 paragraph content.";
		
		const scene2 = new App.CanvasSceneRecord();
		
		scene2.titles.push({ 
			text: "Title3",
			size: 3,
			weight: 500,
			hasColor: false,
		});
		
		scene2.titles.push({ 
			text: "Title4",
			size: 5,
			weight: 700,
			hasColor: false,
		});
		
		scene2.description = "Scene 2 paragraph content.";
		
		const background = new App.BackgroundRecord();
		background.media = Cover.readMedia("image-5.jpg");
		background.zoom = 1;
		
		scene2.backgrounds.push(background);
		
		const scene3 = new App.ProseSceneRecord();
		
		post.scenes.push(scene1, scene2, scene3);
		render(post, blog);
	}
	
	/** */
	export async function coverPreviewCanvasVariants()
	{
		const { post, blog } = await setup();
		const scene = new App.CanvasSceneRecord();
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
				hasColor: false,
			});
		}
		
		scene.origin = Origin.center;
		post.scenes.push(scene);
		render(post, blog);
	}
	
	/** */
	export async function coverPreviewCanvasContentAlignment()
	{
		const { post, blog } = await setup();
		
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
			const scene = new App.CanvasSceneRecord();
			
			scene.titles.push({
				text: "Title1",
				size: 3,
				weight: 400,
				hasColor: false,
			});
			
			scene.origin = origin;
			post.scenes.push(scene);
		}
		
		render(post, blog);
	}
	
	/** */
	export async function coverPreviewCanvasContent()
	{
		const { post, blog } = await setup();
		const scene = new App.CanvasSceneRecord();
		
		scene.titles.push({
			text: "Title1",
			size: 3,
			weight: 400,
			hasColor: false,
		});
		
		scene.titles.push({
			text: "Title2",
			size: 5,
			weight: 700,
			hasColor: false,
		});
		
		scene.description = `
			Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
			Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
			Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
		`;
		
		scene.origin = Origin.bottom;
		post.scenes.push(scene);
		render(post, blog);
	}
	
	/** */
	export async function coverPreviewCanvasBackgroundImage()
	{
		const { post, blog } = await setup();
		const scene = new App.CanvasSceneRecord();
		const background = new App.BackgroundRecord();
		background.media = Cover.readMedia("image-5.jpg");
		scene.backgrounds.push(background);
		post.scenes.push(scene);
		render(post, blog);
	}
	
	/** */
	export async function coverPreviewCanvasBackgroundVideo()
	{
		const { post, blog } = await setup();
		const scene = new App.CanvasSceneRecord();
		scene.titles.push({ text: "Video", size: 20, weight: 900, hasColor: false });
		const background = new App.BackgroundRecord();
		background.media = Cover.readMedia("video-1.mp4");
		scene.backgrounds.push(background);
		post.scenes.push(scene);
		render(post, blog);
	}
	
	/** */
	export async function coverPreviewGallery()
	{
		const { post, blog } = await setup();
		
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
		render(post, blog);
	}
	
	/** */
	export async function coverPreviewProse()
	{
		const { post, blog } = await setup();
		
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
		
		const scene2 = new App.ProseSceneRecord();
		scene2.content = getContent(5);
		
		const scene3 = new App.ProseSceneRecord();
		scene3.content = getContent(1);
		
		post.scenes.push(scene1, scene2, scene3);
		render(post, blog);
	}
	
	/** */
	async function setup()
	{
		App.Css.append();
		const [blog] = await Cover.createBlog();
		const post = new App.PostRecord();
		return { post, blog };
	}
	
	/** */
	function render(post: App.PostRecord, blog: App.Blog)
	{
		const scene = new App.CanvasSceneRecord();
		scene.titles.push({ text: "Done", size: 4, weight: 700, hasColor: false });
		post.scenes.push(scene);
		new App.PreviewHat(post, blog);
	}
}
