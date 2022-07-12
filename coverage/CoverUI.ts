
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
}
