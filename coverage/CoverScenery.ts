
namespace Cover
{
	/** */
	export async function coverScenery()
	{
		App.Css.append();
		
		const scenery = new Player.Scenery({
			height: "100vh",
			fontSize: "20vw",
			textAlign: "center",
			color: "white",
		}).insert(
			Hot.div(
				{
					height: "100%",
					background: "linear-gradient(black, white)",
				},
				new Text("100%"),
			),
			Hot.div(
				{
					height: "150%",
					background: "linear-gradient(red, blue)",
				},
				new Text("150%"),
			),
			Hot.div(
				{
					height: "190%",
					background: "linear-gradient(green, yellow)",
				},
				new Text("190%"),
			),
			Hot.div(
				{
					height: "100%",
					background: "linear-gradient(white, black)",
				},
				new Text("100%"),
			),
		);
		
		scenery.scrollFn(visibles =>
		{
			for (const visible of visibles)
			{
				console.log(visible.element);
				console.log("Element Height: " + visible.elementHeight);
				console.log("Viewport Top Ratio: " + visible.elementTopRatio);
				console.log("Viewport Bottom Ratio: " + visible.elementBottomRatio);
			}
			console.log("");
		});
		
		Hot.get(document.body)(
			scenery,
			{
				tabIndex: 0,
				height: "auto",
				backgroundImage: "linear-gradient(#666, #DDD)",
			},
		);
	}
	
	/** */
	export async function coverSceneryInsertingSections()
	{
		App.Css.append();
		
		const scenery = new Player.Scenery({
			height: "100vh",
			fontSize: "20vw",
			textAlign: "center",
			color: "white",
		});
		
		const insert = (at: number) =>
		{
			scenery.insert(at, Hot.div(
				{
					height: "100%",
					background: "linear-gradient(black, white)",
				},
				new Text(at.toString()),
			));
		};
		
		insert(-1);
		insert(-2);
		insert(10);
		
		document.body.append(scenery.head);
	}
	
	/** */
	export async function coverSceneryStickySections()
	{
		App.Css.append();
		
		let enter: HTMLElement;
		let first: HTMLElement;
		let mid: HTMLElement;
		let last: HTMLElement;
		let exit: HTMLElement;
		
		const scenery = new Player.Scenery({
			height: "100vh",
			fontSize: "20vw",
			textAlign: "center",
			color: "gray",
		}).insert(
			enter = Hot.div(
				{
					height: "100%",
					background: "linear-gradient(black, white)",
					zIndex: -1,
				},
			),
			first = Hot.div(
				{
					position: "sticky",
					bottom: 0,
					height: "100%",
					backgroundColor: "red",
				},
			),
			mid = Hot.div(
				{
					height: "100%",
					backgroundColor: "green",
				},
			),
			last = Hot.div(
				{
					position: "sticky",
					top: 0,
					height: "100%",
					backgroundColor: "blue",
				},
			),
			exit = Hot.div(
				{
					height: "100%",
					background: "gray",
					zIndex: -1,
				},
			),
		);
		
		scenery.scrollFn(states =>
		{
			const enterState = states.find(st => st.element === enter);
			if (enterState)
			{
				const amount = enterState.elementBottomRatio;
				first.style.filter = `brightness(${1 - amount})`;
			}
			else
			{
				first.style.removeProperty("filter");
			}
			
			const exitState = states.find(st => st.element === exit);
			if (exitState)
			{
				console.log(exitState.elementTopRatio);
				const amount = exitState.elementTopRatio;
				last.style.filter = `brightness(${amount})`;
			}
			else
			{
				last.style.removeProperty("filter");
			}
		});
		
		Hot.get(document.body)(
			scenery,
		);
		
		setTimeout(() =>
		{
			scenery.getSection(1).anchor.scrollIntoView({ block: "start", behavior: "auto" });
		});
	}
	
	/** */
	export async function coverSceneryOneStickySection()
	{
		App.Css.append();
		
		let enter: HTMLElement;
		let section: HTMLElement;
		let exit: HTMLElement;
		
		const scenery = new Player.Scenery({
			height: "100vh",
			fontSize: "20vw",
			textAlign: "center",
			color: "gray",
		}).insert(
			enter = Hot.div(
				{
					height: "100%",
					background: "linear-gradient(black, white)",
					zIndex: -1,
				},
			),
			section = Hot.div(
				{
					position: "sticky",
					top: 0,
					bottom: 0,
					height: "100%",
					backgroundColor: "red",
				},
			),
			exit = Hot.div(
				{
					height: "100%",
					background: "gray",
					zIndex: -1,
				},
			),
		);
		
		scenery.scrollFn(states =>
		{
			const enterState = states.find(st => st.element === enter);
			const exitState = states.find(st => st.element === exit);
			
			if (enterState)
			{
				const amount = enterState.elementBottomRatio;
				section.style.filter = `brightness(${1 - amount})`;
			}
			else if (exitState)
			{
				console.log(exitState.elementTopRatio);
				const amount = exitState.elementTopRatio;
				section.style.filter = `brightness(${amount})`;
			}
			else
			{
				section.style.removeProperty("filter");
			}
		});
		
		Hot.get(document.body)(
			scenery,
		);
		
		setTimeout(() =>
		{
			scenery.getSection(1).anchor.scrollIntoView({ block: "start", behavior: "auto" });
		});
	}
}
