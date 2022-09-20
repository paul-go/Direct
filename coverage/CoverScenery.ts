
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
				new Text("Scene 1")
			),
			Hot.section(
				"scene-2",
				{
					lineHeight: "150vh",
					height: "150vh",
					zIndex: -1,
					background: "linear-gradient(orange, crimson)",
				},
				new Text("Scene 2")
			),
			Hot.section(
				"scene-3",
				{
					lineHeight: "100vh",
					height: "100vh",
					zIndex: -1,
					background: "linear-gradient(green, aqua)",
				},
				new Text("Scene 3")
			),
			Hot.section(
				"scene-4",
				{
					lineHeight: "100vh",
					height: "100vh",
					zIndex: -1,
					background: "linear-gradient(gold, violet)",
				},
				new Text("Scene 4")
			),
		);
		
		document.body.append(scenery.head);
		
		scenery.addScrollComputer(s =>
		{
			// Snap to bottom
			if (s.element.classList.contains("scene-2"))
				return Math.max(window.innerHeight - s.elementHeight, s.elementTop);
		});
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
		
		document.body.append(scenery.head);
		
		scenery.addScrollComputer(s =>
		{
			if (s.element === scene)
			{
				if (s.elementTopRatio > 0 && s.elementTopRatio <= 0.5)
					return 0;
				
				if (s.elementBottomRatio <= 1)
					return Math.max(window.innerHeight - s.elementHeight, s.elementTop);
			}
		});
	}
}
