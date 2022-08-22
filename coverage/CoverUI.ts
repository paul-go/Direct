
namespace Cover
{
	/** */
	export function coverSlider()
	{
		App.appendCss();
		
		const slider1 = new App.Slider();
		
		const slider2 = new App.Slider();
		slider2.max = 30;
		slider2.place = 10;
		
		const slider3 = new App.Slider();
		slider3.max = 1000;
		slider3.place = 100;
		
		const slider4 = new App.Slider();
		slider4.max = 10;
		slider4.place = 5;
		
		const slider5 = new App.Slider();
		slider5.min = -10;
		slider5.max = 10;
		slider5.place = 0;
		
		const slider6 = new App.Slider();
		slider6.setLeftLabel("Less");
		slider6.setRightLabel("More");
		slider6.min = -100;
		slider6.max = 100;
		slider6.place = 0;
		slider6.decimals = 0;
		
		document.body.style.padding = "30px";
		document.body.append(
			slider1.head,
			Hot.br(),
			slider2.head,
			Hot.br(),
			slider3.head,
			Hot.br(),
			slider4.head,
			Hot.br(),
			slider5.head,
			Hot.br(),
			slider6.head,
			Hot.br(),
			Hot.a(
				Hot.on("click", () =>
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
		App.appendCss();
		
		let element1: HTMLElement;
		let element2: HTMLElement;
		let element3: HTMLElement;
		
		const head = Hot.div(
			{
				backgroundColor: "gray",
			},
			element1 = Hot.div(
				"e1",
				{
					backgroundColor: "red",
					width: "100px",
					height: "3vw",
					margin: "20px",
				},
				Hot.div("inner", App.UI.anchor()),
			),
			element2 = Hot.div(
				"e2",
				{
					backgroundColor: "green",
					width: "200px",
					height: "50px",
					margin: "20px auto",
				},
				Hot.div("inner", App.UI.anchor()),
			),
			element3 = Hot.div(
				"e3",
				{
					backgroundColor: "blue",
					width: "50%",
					height: "100px",
					margin: "20px",
					marginLeft: "100px",
				},
				Hot.div("inner", App.UI.anchor()),
			),
		);
		
		document.body.style.padding = "30px";
		document.body.append(head);
		
		await App.UI.wait();
		
		const picker = new App.ElementPickerHat(head);
		picker.registerElement(element1);
		picker.registerElement(element2);
		picker.registerElement(element3);
	}
	
	/** */
	export async function coverOriginPicker()
	{
		App.appendCss();
		const np = new App.OriginPickerHat();
		document.body.append(np.head);
	}
	
	/** */
	export async function coverSpinner()
	{
		App.appendCss();
		document.body.append(App.UI.spinner());
	}
	
	/** */
	export async function coverSegmentedButton()
	{
		App.appendCss();
		
		const sb = new App.SegmentedButton();
		sb.add("First");
		sb.add("Second");
		sb.add("Third");
		
		document.body.style.backgroundColor = "white";
		document.body.style.padding = "100px";
		document.body.append(sb.head);
	}
	
	/** */
	export async function coverPublishStatusHat()
	{
		App.appendCss();
		const remover = App.PublishStatusHat.show("Local");
		setTimeout(remover, 2500);
	}
	
	/** */
	export async function coverFlipper()
	{
		const flipper = App.createFlipper({
			red: {
				backgroundColor: "red"
			},
			blue: {
				backgroundColor: "blue"
			},
		});
		
		const div = Hot.div(
			flipper.install(),
			{ padding: "100px" },
			Hot.on("click", () =>
			{
				if (flipper.value === flipper.red)
					flipper.blue();
				else
					flipper.red();
			}),
			
			new Text("Click me")
		);
		
		document.body.style.backgroundColor = "white";
		document.body.style.padding = "100px";
		document.body.append(div);
	}
	
	/** */
	export async function coverWhen()
	{
		let nested: HTMLElement;
		
		const root = Hot.div(Hot.div(nested = Hot.div(
			{
				id: "the-element",
			},
			When.connected(div =>
			{
				console.log("Connected (inline): " + div.id);
			}),
			When.disconnected(div =>
			{
				console.log("Disconnected (inline): " + div.id);
			}),
			Hot.on("click", ev =>
			{
				(ev.target as Element).remove();
			}),
			new Text("Click to disconnect")
		)));
		
		When.connected(nested, e =>
		{
			console.log("Connected (non-inline): " + e.id);
		});
		
		When.disconnected(nested, e =>
		{
			console.log("Disconnected (non-inline): " + e.id);
		})
		
		document.body.append(root);
	}
	
	/** */
	export async function coverLoadingModal()
	{
		const s = document.body.style;
		s.fontSize = "80px";
		s.color = "white";
		s.backgroundColor = "black";
		document.body.append("LOREM IPSUM ".repeat(1000));
		const modal = new App.LoadingModal(document.body);
		
		setTimeout(() =>
		{
			modal.terminate();
		},
		3000);
	}
	
	/** */
	export async function coverEditable()
	{
		Hot.get(document.body)(
			{
				padding: "20px",
			},
			Hot.span(
				{
					border: "1px solid red",
					padding: "10px",
					margin: "20px",
				},
				App.Editable.single({ placeholderText: "Enter the value here." }),
			)
		);
	}
	
	/** */
	export async function coverOpenExternal()
	{
		App.appendCss();
		const icon = App.Icon.openExternal();
		document.body.style.padding = "100px";
		document.body.append(icon);
	}
}
