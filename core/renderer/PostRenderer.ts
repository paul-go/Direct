
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
			readonly blog: Blog,
			readonly isPreview: boolean)
		{ }
		
		/** */
		async render()
		{
			const scenes: any[] = [];
			const classGenerator = new CssClassGenerator();
			const rules: (Css.VirtualCssMediaQuery | Css.VirtualCssRule)[] = [];
			
			for (const scene of this.post.scenes)
			{
				const renderer = SceneRenderer.create(scene, this.isPreview);
				if (!renderer)
					continue;
				
				renderer.classGenerator = classGenerator;
				scenes.push(await renderer.render());
				rules.push(...renderer.cssRules);
			}
			
			const storyElement = Hot.div("story", scenes);
			const cssText = rules.join("\n");
			
			return {
				storyElement,
				cssText,
			};
		}
	}
}
