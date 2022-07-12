
namespace Cover
{
	/** */
	export function coverSlider()
	{
		Turf.appendCss();
		const slider = new Turf.Slider();
		document.body.append(slider.root);
		document.body.style.padding = "30px";
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
}
