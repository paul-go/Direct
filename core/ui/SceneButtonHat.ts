
namespace App
{
	/** */
	export interface ISceneButtonHatOptions
	{
		selectable?: boolean;
		unselectable?: boolean;
		independent?: boolean;
	}
	
	/** */
	export class SceneButtonHat
	{
		/** */
		constructor(text: string, options?: ISceneButtonHatOptions)
		{
			this.isSelectable = options?.selectable ?? true;
			this.isUnselectable = options?.unselectable ?? true;
			this.isIndependent = options?.independent ?? false;
			
			this.head = UI.clickLabel(
				{
					tabIndex: 0,
					display: "inline-block",
					whiteSpace: "nowrap",
					padding: "30px 20px",
					transitionDuration: "0.2s",
					transitionProperty: "opacity",
				},
			);
			
			this.text = text;
			
			if (this.isSelectable)
			{
				this.head.addEventListener(UI.clickEvt, ev =>
				{
					ev.preventDefault();
					const wasSelected = this.selected;
					this.selected = this.isUnselectable ? !this.selected : true;
					
					if (this.selected !== wasSelected)
						this.selectedChangedFn();
				});
			}
			
			Hat.wear(this);
		}
		
		readonly head;
		
		private readonly isSelectable: boolean;
		private readonly isUnselectable: boolean;
		private readonly isIndependent: boolean;
		
		/** */
		get text()
		{
			return this.head.textContent || "";
		}
		set text(value: string)
		{
			this.head.textContent = value;
		}
		
		/** */
		get enabled()
		{
			return this._enabled;
		}
		set enabled(value: boolean)
		{
			this._enabled = value;
			const s = this.head.style;
			s.pointerEvents = value ? "all" : "none";
			s.opacity = value ? "1" : "0.33";
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
			
			const siblings = Query.siblings(this.head);
			
			for (const b of Hat.map(siblings, SceneButtonHat))
				if (b !== this)
					b._selected = false;
			
			this._selected = value;
			this.updateIndicator();
		}
		private _selected = false;
		
		/** */
		updateIndicator()
		{
			const indicator = this.getIndicator();
			const s = indicator.style;
			
			if (this.selected)
			{
				const left = this.isIndependent ? 0 : this.head.offsetLeft;
				const width = this.head.offsetWidth;
				s.left = left + "px";
				s.width = width + "px";
				s.opacity = "1";
			}
			else
			{
				s.opacity = "0";
			}
		}
		
		/** */
		private getIndicator()
		{
			if (this._indicator)
				return this._indicator;
			
			if (this.isIndependent)
			{
				this.head.append(this._indicator = this.createIndicator());
			}
			else
			{
				const siblings = Query.siblings(this.head);
				this._indicator = siblings.find(e => e.classList.contains(Class.indicator)) || null;
				if (!this._indicator)
					this.head.parentElement!.prepend(this._indicator = this.createIndicator());
			}
			
			return this._indicator;
		}
		
		/** */
		private createIndicator()
		{
			return Hot.div(
				Class.indicator,
				{
					position: "absolute",
					top: 0,
					height: "3px",
					opacity: 0,
					backgroundColor: "rgb(128, 128, 128)",
					transitionProperty: "left, width, opacity",
					transitionDuration: "0.2s",
				}
			);
		}
		
		private _indicator: HTMLElement | null = null;
		
		/** */
		setSelectedChangedFn(fn: () => void)
		{
			this.selectedChangedFn = fn;
		}
		private selectedChangedFn = () => {};
	}
	
	/** */
	const enum Class
	{
		indicator = "indicator"
	}
}
