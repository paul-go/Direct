
namespace Turf
{
	/** */
	export class NinthPicker
	{
		/** */
		constructor(...params: Htx.Param[])
		{
			const renderSlice = (ninth: Ninth) => Htx.div(
				"ninth-picker",
				UI.clickable,
				{
					width: "33.333%",
					height: "33.333%",
					display: "inline-block",
					borderRadius: UI.borderRadius.default,
				},
				Htx.css(`:hover { background-color: ${UI.white(0.1)}; }`),
				Htx.on(UI.click, async () =>
				{
					await UI.removeWithFade(this.root);
					this.selectedFn(ninth);
				}),
				Htx.div(
					UI.anchorCenter("30px"),
					UI.chevron(ninth),
				)
			);
			
			this.root = Htx.div(
				UI.anchor(),
				renderSlice(Ninth.topLeft),
				renderSlice(Ninth.top),
				renderSlice(Ninth.topRight),
				renderSlice(Ninth.left),
				renderSlice(Ninth.center),
				renderSlice(Ninth.right),
				renderSlice(Ninth.bottomLeft),
				renderSlice(Ninth.bottom),
				renderSlice(Ninth.bottomRight),
				...params,
				
				() => this.root.focus(),
				...UI.removeOnEscape(() => this.selectedFn(null))
			);
		}
		
		readonly root;
		
		/** */
		setSelectedFn(fn: (ninth: Ninth | null) => void)
		{
			this.selectedFn = fn;
		}
		private selectedFn = (ninth: Ninth | null) => {};
		
		/** */
		remove()
		{
			return UI.removeWithFade(this.root);
		}
	}
}
