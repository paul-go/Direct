
namespace Cover
{
	/** */
	export function coverSlider()
	{
		Turf.appendCss();
		
		const slider1 = new Turf.Slider();
		
		const slider2 = new Turf.Slider();
		slider2.max = 30;
		slider2.progress = 10;
		
		const slider3 = new Turf.Slider();
		slider3.max = 1000;
		slider3.progress = 100;
		
		const slider4 = new Turf.Slider();
		slider4.max = 10;
		slider4.progress = 5;
		
		document.body.style.padding = "30px";
		document.body.append(
			slider1.root,
			Htx.br(),
			slider2.root,
			Htx.br(),
			slider3.root,
			Htx.br(),
			slider4.root,
			Htx.br(),
			Htx.a(
				Htx.on("click", () =>
				{
					slider4.max = 60;
				}),
				new Text("Change")
			)
		);
	}
	
	/** */
	export async function coverElementPicker()
	{
		Turf.appendCss();
		
		let element1: HTMLElement;
		let element2: HTMLElement;
		let element3: HTMLElement;
		
		const root = Htx.div(
			{
				backgroundColor: "gray",
			},
			element1 = Htx.div(
				"e1",
				{
					backgroundColor: "red",
					width: "100px",
					height: "3vw",
					margin: "20px",
				},
				Htx.div("inner", Turf.UI.anchor()),
			),
			element2 = Htx.div(
				"e2",
				{
					backgroundColor: "green",
					width: "200px",
					height: "50px",
					margin: "20px auto",
				},
				Htx.div("inner", Turf.UI.anchor()),
			),
			element3 = Htx.div(
				"e3",
				{
					backgroundColor: "blue",
					width: "50%",
					height: "100px",
					margin: "20px",
					marginLeft: "100px",
				},
				Htx.div("inner", Turf.UI.anchor()),
			),
		);
		
		document.body.style.padding = "30px";
		document.body.append(root);
		
		await Turf.UI.wait();
		
		const picker = new Turf.ElementPicker(root);
		picker.registerElement(element1);
		picker.registerElement(element2);
		picker.registerElement(element3);
	}
	
	/** */
	export async function coverOriginPicker()
	{
		Turf.appendCss();
		const np = new Turf.OriginPicker();
		document.body.append(np.root);
	}
	
	/** */
	export async function coverSpinner()
	{
		Turf.appendCss();
		document.body.append(Turf.UI.spinner());
	}
	
	/** */
	export async function coverPublishStatusView()
	{
		Turf.appendCss();
		const remover = Turf.PublishStatusView.show("Local");
		setTimeout(remover, 2500);
	}
}
