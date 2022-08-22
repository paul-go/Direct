
namespace App
{
	/** */
	export class OriginPickerHat
	{
		/** */
		constructor(...params: Hot.Param[])
		{
			const renderSlice = (origin: Origin) => Hot.div(
				"origin-picker",
				UI.clickable,
				{
					width: "33.333%",
					height: "33.333%",
					display: "inline-block",
					borderRadius: UI.borderRadius.default,
				},
				Hot.css(":hover", { backgroundColor: UI.white(0.1) }),
				Hot.on(UI.clickEvt, () =>
				{
					this.selectedFn(origin);
					UI.removeWithFade(this.head);
				}),
				Hot.div(
					UI.anchorCenter("30px"),
					Icon.chevron(origin),
				)
			);
			
			this.head = Hot.div(
				UI.anchor(),
				renderSlice(Origin.topLeft),
				renderSlice(Origin.top),
				renderSlice(Origin.topRight),
				renderSlice(Origin.left),
				renderSlice(Origin.center),
				renderSlice(Origin.right),
				renderSlice(Origin.bottomLeft),
				renderSlice(Origin.bottom),
				renderSlice(Origin.bottomRight),
				...params,
				
				...UI.removeOnEscape(() => this.selectedFn(null))
			);
			
			Hat.wear(this);
		}
		
		readonly head;
		
		/** */
		setSelectedFn(fn: (origin: Origin | null) => void)
		{
			this.selectedFn = fn;
		}
		private selectedFn = (origin: Origin | null) => {};
		
		/** */
		remove()
		{
			return UI.removeWithFade(this.head);
		}
	}
}
