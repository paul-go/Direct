
namespace Player
{
	/** */
	export class Story
	{
		/** */
		constructor(head: HTMLElement | string)
		{
			// Needs to go through the head and create all the scenes.
			this.head = typeof head === "string" ?
				document.getElementById(head) as HTMLElement :
				head;
			
			const scenes: Scene[] = [];
			
			for (const child of Array.from(this.head.children))
			{
				if (!(child instanceof HTMLElement) || !child.classList.contains(CssClass.scene))
					continue;
				
				const list = child.classList;
				const scene = 
					list.contains(CssClass.canvasScene) ? new CanvasScene(child) :
					list.contains(CssClass.videoScene) ? new VideoScene(child) :
					list.contains(CssClass.proseScene) ? new ProseScene(child) :
					list.contains(CssClass.galleryScene) ? new GalleryScene(child) : null!;
				
				scenes.push(scene);
			}
			
			for (const scene of scenes)
				scene.setup();
		}
		
		/** */
		readonly head;
	}
}
