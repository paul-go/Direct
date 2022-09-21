
namespace Cover
{
	/** */
	export async function coverSceneryNewStructure()
	{
		App.Css.append();
		
		const scenery = new Player.Scenery({
			height: "100vh",
			fontSize: "20vw",
			fontWeight: 700,
			textAlign: "center",
			color: "white"
		});
		
		scenery.insert(
			Hot.section(
				"scene-1",
				{
					lineHeight: "100vh",
					height: "100vh",
					zIndex: -1,
					background: "linear-gradient(black, white)",
				},
				new Text("100vh")
			),
			Hot.section(
				"scene-2",
				{
					lineHeight: "101vh",
					height: "101vh",
					zIndex: -1,
					background: "linear-gradient(orange, crimson)",
					outline: "20px solid blue",
					outlineOffset: "-20px",
				},
				new Text("101vh")
			),
			Hot.section(
				"scene-3",
				{
					lineHeight: "120vh",
					height: "120vh",
					zIndex: -1,
					background: "linear-gradient(green, aqua)",
				},
				new Text("120vh")
			),
			Hot.section(
				"scene-4",
				{
					lineHeight: "150vh",
					height: "150vh",
					zIndex: -1,
					background: "linear-gradient(red, pink)",
				},
				new Text("150vh")
			),
			Hot.section(
				"scene-5",
				{
					lineHeight: "200vh",
					height: "200vh",
					zIndex: -1,
					background: "linear-gradient(blue, black)",
				},
				new Text("200vh")
			),
			Hot.section(
				"scene-6",
				{
					lineHeight: "201vh",
					height: "201vh",
					zIndex: -1,
					background: "linear-gradient(gold, violet)",
				},
				new Text("201vh")
			),
		);
		
		document.body.append(scenery.head);
	}
	
	/** */
	export async function coverSceneryAsWorkingInsidePurview()
	{
		App.Css.append();
		
		const scenery = new Player.Scenery({
			height: "100vh",
			fontSize: "20vw",
			fontWeight: 700,
			textAlign: "center",
			color: "white"
		});
		
		let exitUp: HTMLElement;
		let scene: HTMLElement;
		let exitDown: HTMLElement;
		
		scenery.insert(
			exitUp = Hot.section(
				"scene-exit-up",
				{
					lineHeight: "50vh",
					height: "50vh",
					zIndex: -1,
					background: "linear-gradient(black, white)",
				},
				new Text("Exit Up")
			),
			scene = Hot.section(
				"scene-content",
				{
					lineHeight: "150vh",
					height: "150vh",
					zIndex: 0,
					background: "linear-gradient(orange, crimson)",
				},
				new Text("Scene")
			),
			exitDown = Hot.section(
				"scene-exit-down",
				{
					lineHeight: "50vh",
					height: "50vh",
					zIndex: -1,
					background: "linear-gradient(white, black)",
				},
				new Text("Exit Down")
			),
		);
		
		Hot.get(scenery)(
			{
				tabIndex: 0
			},
			Hot.on("keydown", ev =>
			{
				if (ev.key === "=")
					scene.style.height = (parseInt(scene.style.height) + 50) + "vh";
				
				else if (ev.key === "-")
					scene.style.height = (parseInt(scene.style.height) - 50) + "vh";
			})
		);
		
		document.body.append(scenery.head);
		
		scenery.addScrollComputer(s =>
		{
			if (s.element === scene)
			{
				if (s.elementTopRatio >= 0)
					return 0;
				
				if (s.elementBottomRatio <= 1)
					return Math.max(window.innerHeight - s.elementHeight, s.elementTop);
			}
		});
	}
}
