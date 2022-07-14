
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
				() =>
				{
					this.updateTextColor();
					Force.watch(this.root, BladeView).backgroundChanged(() =>
					{
						this.updateTextColor();
					});
				},
				...params
			);
		}
		
		readonly root;
		
		/** */
		private updateTextColor()
		{
			const meta = AppContainer.of(this).meta;
			const colorIndex = this.record.backgroundColorIndex;
			const fgColor = RenderUtil.resolveForegroundColor(colorIndex, meta);
			this.root.style.color = UI.color(fgColor);
		}
	}
}
