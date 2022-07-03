
namespace Player
{
	/** */
	export class Story
	{
		/** */
		constructor(readonly root: HTMLElement)
		{
			// Needs to go through the root and create all the scenes.
			
			const scenes: Scene[] = [];
			
			for (const child of Array.from(root.children))
				if (child instanceof HTMLElement)
					scenes.push(new Scene(child));
			
			for (const scene of scenes)
				scene.setup();
			
			
		}
	}
}
