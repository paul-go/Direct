
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
						margin: "10px 5px",
						fontSize: UI.vsize(2.2),
						flex: "1 0",
					},
					new Text(label),
					...UI.click(() =>
					{
						const scene = new sceneCtor();
						this.insertCallback?.(scene);
					})
				);
			
			this.root = Htx.div(
				"insert-scene-view",
				{
					display: orientation === "v" ? "block" : "flex",
					margin: "auto",
					padding: "20 25px",
					maxWidth: "1000px",
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
				renderButton("+ Attention Grabber", AttentionSceneView),
				renderButton("+ Images & Videos", GallerySceneView),
				renderButton("+ Prose", ProseSceneView),
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
