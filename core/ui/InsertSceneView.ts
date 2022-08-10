
namespace App
{
	/** */
	export class InsertSceneView
	{
		/** */
		constructor(orientation: "v" | "h")
		{
			const renderButton = (label: string, sceneCtor: new() => SceneView) =>
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
						
						setTimeout(() => scene.root.scrollIntoView({
							behavior: "smooth",
							block: "nearest",
							inline: "nearest"
						}));
					})
				);
			
			this.root = Htx.div(
				"insert-scene-view",
				{
					display: orientation === "v" ? "block" : "flex",
					margin: "auto",
					maxWidth: "650px",
					width: orientation === "v" ? "500px" : "auto"
				},
				Htx.on(document.body, "keydown", ev =>
				{
					if (ev.key === "Escape")
					{
						ev.preventDefault();
						this.cancelCallback?.();
					}
				}),
				Htx.on(document.body, "click", ev =>
				{
					if (!Query.ancestors(ev.target).includes(this.root))
						this.cancelCallback?.();
				}),
				renderButton("Canvas", AttentionSceneView),
				renderButton("Gallery", GallerySceneView),
				renderButton("Prose", ProseSceneView),
			);
		}
		
		readonly root;
		
		/** */
		setInsertCallback(fn: (scene: SceneView) => void)
		{
			this.insertCallback = fn;
		}
		private insertCallback?: (scene: SceneView) => void;
		
		/** */
		setCancelCallback(fn: () => void)
		{
			this.cancelCallback = fn;
		}
		private cancelCallback?: () => void;
	}
}
