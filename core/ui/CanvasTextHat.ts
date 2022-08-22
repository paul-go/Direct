
namespace App
{
	/**
	 * Base class for text objects that can render on the CanvasScene
	 */
	export abstract class CanvasTextHat
	{
		/** */
		constructor(readonly record: CanvasSceneRecord)
		{
			this.head = Hot.div(
				{
					width: "fit-content",
				},
				CssClass.inheritMargin,
				Hot.on("focusout", () =>
				{
					if (this.isEmpty)
						this.hide();
					
					this.handleTextChanged();
				}),
				Hot.on("input", () => this.queueTextChanged())
			);
			
			this.hide();
			Hat.wear(this);
		}
		
		readonly head;
		
		/** */
		protected abstract get isEmpty(): boolean;
		
		/** */
		protected hide(hide = true)
		{
			if (UI.toggle(this.head, !hide))
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
