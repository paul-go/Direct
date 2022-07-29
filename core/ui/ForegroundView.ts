
namespace Turf
{
	/** */
	export class ForegroundView
	{
		/** */
		constructor(
			private readonly record: BladeRecord,
			...params: Htx.Param[])
		{
			this.root = Htx.div(
				When.connected(() => this.updateTextColor()),
				...params
			);
			
			Controller.set(this);
		}
		
		readonly root;
		
		/** */
		updateTextColor()
		{
			const meta = AppContainer.of(this).meta;
			const colorIndex = this.record.backgroundColorIndex;
			const fgColor = RenderUtil.resolveForegroundColor(colorIndex, meta);
			this.root.style.color = UI.color(fgColor);
		}
	}
}
