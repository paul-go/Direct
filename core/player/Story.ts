
namespace Player
{
	/** */
	export class Story
	{
		/** */
		constructor(root: HTMLElement | string)
		{
			// Needs to go through the root and create all the scenes.
			
			if (root instanceof HTMLElement)
				this.root = root;
			else
				this.root = document.getElementById(root) as HTMLElement;
			
			const scenes: Scene[] = [];
			
			for (const child of Array.from(this.root.children))
			{
				if (!(child instanceof HTMLElement) || !child.classList.contains(CssClass.scene))
					continue;
				
				const list = child.classList;
				const scene = 
					list.contains(CssClass.attentionScene) ? new AttentionScene(child) :
					list.contains(CssClass.videoScene) ? new VideoScene(child) :
					list.contains(CssClass.proseScene) ? new ProseScene(child) :
					list.contains(CssClass.galleryScene) ? new GalleryScene(child) : null!;
				
				scenes.push(scene);
			}
			
			for (const scene of scenes)
				scene.setup();
		}
		
		/** */
		readonly root: HTMLElement;
	}
}
