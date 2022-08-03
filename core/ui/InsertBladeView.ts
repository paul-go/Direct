
namespace Turf
{
	/** */
	export class InsertBladeView
	{
		/** */
		constructor(orientation: "v" | "h")
		{
			const renderButton = (label: string, bladeCtor: new() => BladeView) =>
				UI.actionButton("filled",
					{
						margin: "10px 5px",
						fontSize: UI.vsize(2.2),
						flex: "1 0",
					},
					new Text(label),
					...UI.click(() =>
					{
						const blade = new bladeCtor();
						this.insertCallback?.(blade);
					})
				);
			
			this.root = Htx.div(
				"insert-blade-view",
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
				renderButton("+ Captioned", CaptionedBladeView),
				renderButton("+ Images & Videos", GalleryBladeView),
				renderButton("+ Write Up", ProseBladeView),
			);
		}
		
		readonly root;
		
		/** */
		setInsertCallback(fn: (blade: BladeView) => void)
		{
			this.insertCallback = fn;
		}
		private insertCallback?: (blade: BladeView) => void;
		
		/** */
		setCancelCallback(fn: () => void)
		{
			this.cancelCallback = fn;
		}
		private cancelCallback?: () => void;
	}
}
