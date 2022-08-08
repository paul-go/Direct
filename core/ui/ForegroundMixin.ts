
namespace App
{
	/** */
	export class ForegroundMixin
	{
		/** */
		constructor(
			readonly root: HTMLElement,
			private readonly record: SceneRecord)
		{
			Htx.from(this.root)(
				"foreground-view",
				When.connected(() => this.updateTextColor()),
			);
			
			Controller.set(this);
		}
		
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
