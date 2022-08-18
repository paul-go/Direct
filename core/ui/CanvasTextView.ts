
namespace App
{
	/**
	 * Base class for text objects that can render on the CanvasScene
	 */
	export abstract class CanvasTextView
	{
		/** */
		constructor(protected record: CanvasSceneRecord)
		{
			this.root = Htx.div(
				{
					width: "fit-content",
				},
				CssClass.inheritMargin,
				Htx.on("focusout", () =>
				{
					if (this.isEmpty)
						this.hide();
					
					this.handleTextChanged();
				}),
				Htx.on("input", () => this.queueTextChanged())
			);
			
			this.hide();
			Cage.set(this);
		}
		
		readonly root;
		
		/** */
		protected abstract get isEmpty(): boolean;
		
		/** */
		protected hide(hide = true)
		{
			if (UI.toggle(this.root, !hide))
				this.hideChangedHandler(hide);
		}
		
		/** */
		setHideChangedHandler(fn: (hidden: boolean) => void)
		{
			this.hideChangedHandler = fn;
		}
		private hideChangedHandler = (hidden: boolean) => {};
		
		/** */
		protected handleTextChanged() { }
		
		/** */
		private queueTextChanged()
		{
			clearTimeout(this.textChangedTimeout);
			setTimeout(() => this.handleTextChanged(), 200);
		}
		private textChangedTimeout: any = 0;
	}
}
