
namespace App
{
	/**
	 * 
	 */
	export class PostRenderer
	{
		/** */
		constructor(
			readonly post: PostRecord,
			readonly blog: Blog)
		{ }
		
		/** */
		async render(forEditor: boolean)
		{
			const scenes: HTMLElement[] = [];
			const classGenerator = new CssClassGenerator();
			const rules: (Css.VirtualCssMediaQuery | Css.VirtualCssRule)[] = [];
			
			for (const scene of this.post.scenes)
			{
				const renderer = SceneRenderer.new(scene, forEditor);
				renderer.classGenerator = classGenerator;
				scenes.push(await renderer.render());
				rules.push(...renderer.cssRules);
			}
			
			const cssText = rules.join("\n");
			return { scenes, cssText, };
		}
	}
}
