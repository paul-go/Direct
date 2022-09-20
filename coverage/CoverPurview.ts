
namespace Cover
{
	/** */
	export function coverPurview()
	{
		App.Css.append();
		
		const purview = new Player.Purview<Preview>();
		document.body.append(purview.head);
		
		purview.handlePreviewRequest(async info =>
		{
			const count = info.rangeEnd - info.rangeStart;
			const prefix = info.rangeStart < 0 ? "Pre" : "Post";
			const items: Promise<Preview>[] = [];
			
			for (let i = -1; ++i < count;)
				items.push(Promise.resolve(new Preview(prefix)));
			
			return items;
		});
		
		purview.handleReviewRequest(async preview =>
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
					new Text("Next Screen")
				),
			);
			
			return scenery;
		});
		
		purview.gotoPreviews();
	}
	
	/** */
	class Preview
	{
		constructor(text: string)
		{
			const backgroundImage = (() =>
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
			})();
			
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
	const randomColor = () =>
	{
		const rnd = () => Math.round(Math.random() * 255);
		return `rgb(${rnd()}, ${rnd()}, ${rnd()})`;
	};
}
