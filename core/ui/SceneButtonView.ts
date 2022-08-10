
namespace App
{
	/** */
	export interface ISceneButtonViewOptions
	{
		selectable?: boolean;
		unselectable?: boolean;
		independent?: boolean;
	}
	
	/** */
	export class SceneButtonView
	{
		/** */
		constructor(text: string, options?: ISceneButtonViewOptions)
		{
			this.isSelectable = options?.selectable ?? true;
			this.isUnselectable = options?.unselectable ?? true;
			this.isIndependent = options?.independent ?? false;
			
			this.root = UI.clickLabel(
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
				this.root.addEventListener(UI.clickEvt, ev =>
				{
					ev.preventDefault();
					const wasSelected = this.selected;
					this.selected = this.isUnselectable ? !this.selected : true;
					
					if (this.selected !== wasSelected)
						this.selectedChangedFn();
				});
			}
			
			Cage.set(this);
		}
		
		readonly root;
		
		private readonly isSelectable: boolean;
		private readonly isUnselectable: boolean;
		private readonly isIndependent: boolean;
		
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
			
			const siblings = Query.siblings(this.root);
			
			for (const b of Cage.map(siblings, SceneButtonView))
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
				const left = this.isIndependent ? 0 : this.root.offsetLeft;
				const width = this.root.offsetWidth;
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
				this.root.append(this._indicator = this.createIndicator());
			}
			else
			{
				const siblings = Query.siblings(this.root);
				this._indicator = siblings.find(e => e.classList.contains(Class.indicator)) || null;
				if (!this._indicator)
					this.root.parentElement!.prepend(this._indicator = this.createIndicator());
			}
			
			return this._indicator;
		}
		
		/** */
		private createIndicator()
		{
			return Htx.div(
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
