
namespace Turf
{
	/** */
	export class BladeButtonView
	{
		static readonly auxiliary = "•••";
		
		/** */
		constructor(text: string, options?: { selectable?: boolean; unselectable?: boolean; })
		{
			this.isSelectable = options?.selectable ?? true;
			this.isUnselectable = options?.unselectable ?? true;
			
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
			
			if (this.isSelectable)
			{
				this.root.addEventListener(UI.click, () =>
				{
					this.selected = this.isUnselectable ? !this.selected : true;
				});
			}
			
			Controller.set(this);
		}
		
		readonly root;
		
		private readonly isSelectable: boolean;
		private readonly isUnselectable: boolean;
		
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
		set selected(value: boolean)
		{
			if (this._selected === value)
				return;
			
			const wasSelected = this._selected;
			const siblings = Query.siblings(this.root);
			const siblingButtons = Controller.map(siblings, BladeButtonView);
			siblingButtons.map(button => button._selected = false);
			this._selected = value;
			
			(async () =>
			{
				let indicator = siblings.find(e => e.classList.contains(Class.indicator));
				if (!indicator)
				{
					indicator = Htx.div(
						Class.indicator,
						{
							position: "absolute",
							top: "0",
							height: "3px",
							opacity: "0",
							backgroundColor: "rgb(128, 128, 128)",
							transitionProperty: "left, width, opacity",
							transitionDuration: "0.2s",
						}
					);
					
					this.root.parentElement?.prepend(indicator);
					
					await new Promise<void>(r => setTimeout(() =>
					{
						indicator!.style.opacity = "1";
						r();
					}));
				}
				
				if (!wasSelected && value)
				{
					indicator.style.opacity = "1";
					indicator.style.left = this.root.offsetLeft + "px";
					indicator.style.width = this.root.offsetWidth + "px";
				}
				else if (wasSelected && !value)
				{
					indicator.style.opacity = "0";
				}
			})();
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
