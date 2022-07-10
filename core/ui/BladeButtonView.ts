
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
					tabIndex: 0,
					display: "inline-block",
					whiteSpace: "nowrap",
					padding: "30px 20px",
					fontWeight: "600",
					fontSize: "20px",
					transitionDuration: "0.2s",
					transitionProperty: "opacity",
				},
			);
			
			this.text = text;
			
			if (this.isSelectable)
			{
				this.root.addEventListener(UI.click, ev =>
				{
					ev.preventDefault();
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
		get enabled()
		{
			return this._enabled;
		}
		set enabled(value: boolean)
		{
			this._enabled = value;
			const s = this.root.style;
			s.pointerEvents = value ? "all" : "none";
			s.opacity = value ? "1" : "0.33";
			
			if (this.indicator)
				this.indicator.style.opacity = value ? "1" : "0";
		}
		private _enabled = true;
		
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
				if (!this.indicator)
				{
					this.indicator = siblings.find(e => e.classList.contains(Class.indicator)) || null;
					if (!this.indicator)
					{
						this.indicator = Htx.div(
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
					}
					
					this.root.parentElement?.prepend(this.indicator);
					
					await new Promise<void>(r => setTimeout(() =>
					{
						this.indicator!.style.opacity = "1";
						r();
					}));
				}
				
				if (!wasSelected && value)
				{
					this.indicator.style.opacity = "1";
					this.indicator.style.left = this.root.offsetLeft + "px";
					this.indicator.style.width = this.root.offsetWidth + "px";
					
					for (const fn of this.selectedHandlers)
						fn();
				}
				else if (wasSelected && !value)
				{
					this.indicator.style.opacity = "0";
				}
			})();
		}
		private _selected = false;
		
		private indicator: HTMLElement | null = null;
		
		/** */
		setAction(fn: () => void)
		{
			
		}
		
		/** */
		onSelected(fn: () => void)
		{
			this.selectedHandlers.push(fn);
		}
		private readonly selectedHandlers: (() => void)[] = [];
	}
	
	/** */
	const enum Class
	{
		indicator = "indicator"
	}
}
