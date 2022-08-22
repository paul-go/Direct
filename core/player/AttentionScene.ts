/// <reference path="Scene.ts" />

namespace Player
{
	/** */
	export class CanvasScene extends Scene
	{
		/** */
		constructor(readonly head: HTMLElement)
		{
			super(head);
		}
	}
}
