
namespace App
{
	/** */
	export class ColorToggleView
	{
		/** */
		constructor()
		{
			this.root = UI.toolButton(
				UI.anchorCenter(),
				{
					top: "auto",
					bottom: "10px",
					zIndex: "1",
				},
				UI.click(() =>
				{
					this.hasColor = !this.hasColor;
				})
			);
			
			this.hasColor = false;
			Hat.wear(this);
		}
		
		readonly root;
		
		/** */
		get hasColor()
		{
			return this._hasColor;
		}
		set hasColor(hasColor: boolean)
		{
			const label = hasColor ? "Uncolor" : "Color";
			this.root.textContent = label;
			this._hasColor = hasColor;
			this.changedFn();
		}
		private _hasColor = false;
		
		/** */
		setChangedFn(fn: () => void)
		{
			this.changedFn = fn;
		}
		private changedFn = () => {};
	}
}
