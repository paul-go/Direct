
namespace Cover
{
	/** */
	export function coverOmniviewInfinite()
	{
		App.Css.append();
		const omniview = new Player.Omniview<Preview>();
		
		document.body.append(
			Hot.div({ height: "50vh" }),
			omniview.head,
			Hot.div({ height: "50vh" }));
		
		omniview.handlePreviewRequest(async req =>
		{
			const count = req.rangeEnd - req.rangeStart;
			const items: Promise<Preview>[] = [];
			
			for (let i = -1; ++i < count;)
				items.push(Promise.resolve(new Preview("Post " + i)));
			
			return items;
		});
		
		omniview.handleReviewRequest(async preview =>
		{
			const scenery = new Player.Scenery();
			
			scenery.insert(
				Hot.div(
					squareClass,
					{
						backgroundImage: "linear-gradient(orange, crimson)",
						height: "100vh",
					},
					new Text(preview.head.textContent || "")
				),
				Hot.div(
					squareClass,
					{
						background: "linear-gradient(maroon, crimson)",
						height: "100vh",
					},
					new Text("Middle Screen")
				),
				Hot.div(
					squareClass,
					{
						background: "linear-gradient(yellow, crimson)",
						height: "100vh",
					},
					new Text("Last Screen")
				),
			);
			
			return scenery;
		});
		
		omniview.gotoPreviews();
	}
	
	/** */
	export async function coverOmniviewPortal()
	{
		App.Css.append();
		const omniview = new Player.Omniview<Player.Scenery>();
		
		omniview.handlePreviewRequest(async req =>
		{
			const count = req.rangeEnd - req.rangeStart;
			const sceneries: Promise<Player.Scenery>[] = [];
			
			for (let i = -1; ++i < count;)
			{
				const scenery = new Player.Scenery();
				scenery.insert(
					Hot.div(
						squareClass,
						{
							backgroundImage: randomBackground(),
							height: "100vh",
						},
						new Text("Post " + i)
					),
				);
				sceneries.push(Promise.resolve(scenery));
			}
			
			return sceneries;
		});	
		
		omniview.handleReviewRequest(async scenery =>
		{
			scenery.insert(Hot.div(
					squareClass,
					{
						background: "linear-gradient(maroon, crimson)",
						height: "100vh",
					},
					new Text("Middle Screen")
				),
				Hot.div(
					squareClass,
					{
						background: "linear-gradient(yellow, crimson)",
						height: "100vh",
					},
					new Text("Last Screen")
				)
			);
		});
		
		document.body.append(omniview.head);
		omniview.gotoPreviews();
	}
	
	/** */
	class Preview
	{
		constructor(text: string)
		{
			const backgroundImage = randomBackground();
			
			this.head = Hot.div(
				squareClass,
				{
					backgroundImage
				},
				new Text(text + " " + (++idx))
			);
		}
		readonly head;
	}
	
	let idx = 0;
	
	const squareClass = Hot.css({
		display: "flex",
		alignItems: "center",
		alignContent: "center",
		justifyContent: "center",
		textAlign: "center",
		color: "white",
		fontWeight: 900,
		fontSize: "10vw",
		lineHeight: "100vh",
		backgroundSize: "cover",
	});
	
	/** */
	function randomBackground()
	{
		const canvas = Hot.canvas({ width: 10, height: 10 });
		const ctx = canvas.getContext("2d")!;
		
		ctx.fillStyle = randomColor();
		ctx.fillRect(0, 0, 10, 10);
		
		const grad = ctx.createLinearGradient(0, 0, 10, 10);
		grad.addColorStop(0, "rgba(255, 255, 255, 0.5)");
		grad.addColorStop(1, "rgba(0, 0, 0, 0.5)");
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, 10, 10);
		return `url(${canvas.toDataURL()})` ;
	};
	
	/** */
	function randomColor()
	{
		const rnd = () => Math.round(Math.random() * 255);
		return `rgb(${rnd()}, ${rnd()}, ${rnd()})`;
	};
}
