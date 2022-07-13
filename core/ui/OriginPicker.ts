
namespace Turf
{
	/** */
	export class OriginPicker
	{
		/** */
		constructor(...params: Htx.Param[])
		{
			const renderSlice = (origin: Origin) => Htx.div(
				"origin-picker",
				UI.clickable,
				{
					width: "33.333%",
					height: "33.333%",
					display: "inline-block",
					borderRadius: UI.borderRadius.default,
				},
				Htx.css(`:hover { background-color: ${UI.white(0.1)}; }`),
				Htx.on(UI.click, () =>
				{
					this.selectedFn(origin);
					UI.removeWithFade(this.root);
				}),
				Htx.div(
					UI.anchorCenter("30px"),
					UI.chevron(origin),
				)
			);
			
			this.root = Htx.div(
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
				
				() => this.root.focus(),
				...UI.removeOnEscape(() => this.selectedFn(null))
			);
		}
		
		readonly root;
		
		/** */
		setSelectedFn(fn: (origin: Origin | null) => void)
		{
			this.selectedFn = fn;
		}
		private selectedFn = (origin: Origin | null) => {};
		
		/** */
		remove()
		{
			return UI.removeWithFade(this.root);
		}
	}
}
