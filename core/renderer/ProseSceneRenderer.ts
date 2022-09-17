
namespace App
{
	/**
	 * 
	 */
	export class ProseSceneRenderer extends SceneRenderer<ProseSceneRecord>
	{
		/** */
		protected renderContents()
		{
			const proseElements = RenderUtil.renderTrixDocument(this.scene.content);
			
			if (this.scene.hasColorAccents)
			{
				const colors = RenderUtil.resolveColors(this.scene);
				proseElements
					.filter(e => e instanceof HTMLHeadingElement)
					.map(e => e.style.color = colors.foregroundColored);
			}
			
			return [
				CssClass.proseScene,
				Hot.div(
					CssClass.proseSceneForeground,
					proseElements
				)
			];
		}
	}
}
