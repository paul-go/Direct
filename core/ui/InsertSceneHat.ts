
namespace App
{
	/** */
	export class InsertSceneHat
	{
		/** */
		constructor(orientation: "v" | "h")
		{
			const renderButton = (label: string, sceneCtor: new() => SceneHat) =>
				UI.actionButton("filled",
					{
						margin: "10px " + UI.vw(0.5),
						paddingLeft: UI.vw(2.5),
						paddingRight: UI.vw(2.5),
						fontSize: UI.vw(2.2),
						flex: "1 0",
					},
					new Text(label),
					...UI.click(() =>
					{
						const scene = new sceneCtor();
						this.insertCallback?.(scene);
						
						setTimeout(() => scene.head.scrollIntoView({
							behavior: "smooth",
							block: "nearest",
							inline: "nearest"
						}));
					})
				);
			
			this.head = Hot.div(
				"insert-scene-hat",
				{
					display: orientation === "v" ? "block" : "flex",
					margin: "auto",
					maxWidth: "650px",
					width: orientation === "v" ? "500px" : "auto"
				},
				Hot.on(document.body, "keydown", ev =>
				{
					if (ev.key === "Escape")
					{
						ev.preventDefault();
						this.cancelCallback?.();
					}
				}),
				Hot.on(document.body, "click", ev =>
				{
					if (!Query.ancestors(ev.target).includes(this.head))
						this.cancelCallback?.();
				}),
				renderButton("Canvas", CanvasSceneHat),
				renderButton("Gallery", GallerySceneHat),
				renderButton("Prose", ProseSceneHat),
			);
			
			Hat.wear(this);
		}
		
		readonly head;
		
		/** */
		setInsertCallback(fn: (scene: SceneHat) => void)
		{
			this.insertCallback = fn;
		}
		private insertCallback?: (scene: SceneHat) => void;
		
		/** */
		setCancelCallback(fn: () => void)
		{
			this.cancelCallback = fn;
		}
		private cancelCallback?: () => void;
	}
}
