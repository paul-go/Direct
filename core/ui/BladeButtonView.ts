
namespace Turf
{
	/** */
	export class BladeButtonView
	{
		/** */
		constructor(text: string)
		{
			this.root = Htx.div(
				UI.clickable,
				{
					display: "inline-block",
					whiteSpace: "nowrap",
					padding: "30px 20px",
					fontWeight: "600",
					fontSize: "20px",
				},
			);
			
			this.text = text;
			Controller.set(this);
		}
		
		readonly root;
		
		/** */
		get text()
		{
			return this.root.textContent || "";
		}
		set text(value: string)
		{
			this.root.textContent = value;
		}
		
		/** */
		get visible()
		{
			return this.root.style.display !== "none";
		}
		set visible(visible: boolean)
		{
			this.root.style.display = visible ? "block" : "none";
		}
		
		/** */
		get selected()
		{
			return this._selected;
		}
		
		/** */
		selectable()
		{
			this.root.addEventListener(UI.click, () => this.select());
			return this;
		}
		
		/** */
		select()
		{
			const siblings = Query.siblings(this.root);
			const siblingButtons = Controller.map(siblings, BladeButtonView);
			siblingButtons.map(button => button._selected = false);
			
			let indicator = siblings.find(e => e.classList.contains(Class.indicator));
			if (!indicator)
			{
				indicator = Htx.div(
					{
						position: "absolute",
						top: "0",
						height: "3px",
						backgroundColor: "rgb(128, 128, 128)",
						transitionProperty: "left, width",
						transitionDuration: "0.2s",
					}
				);
				
				this.root.parentElement?.prepend(indicator);
			}
			
			indicator.style.left = this.root.offsetLeft + "px";
			indicator.style.width = this.root.offsetWidth + "px";
			this._selected = true;
		}
		
		private _selected = false;
		
		/** */
		setAction(fn: () => void)
		{
			
		}
	}
	
	/** */
	const enum Class
	{
		indicator = "indicator"
	}
}
