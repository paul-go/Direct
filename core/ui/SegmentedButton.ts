
namespace App
{
	/** */
	export class SegmentedButton
	{
		/** */
		constructor(...params: Htx.Param[])
		{
			this.root = Htx.div(
				"segmented-button",
				{
					display: "flex",
					borderRadius: UI.borderRadius.large,
					border: "2px solid " + this.fgColor,
					padding: "2px",
				},
				...params
			);
		}
		
		readonly root;
		private readonly titles: string[] = [];
		private readonly fgColor = UI.themeColor;
		
		/** */
		add(...titles: string[])
		{
			for (const [idx, title] of titles.entries())
			{
				this.titles.push(title);
				
				this.root.append(Htx.div(
					{
						flex: "1 0",
						padding: "15px 5px",
						borderRadius: (parseInt(UI.borderRadius.large) - 3) + "px",
						backgroundColor: "transparent",
						color: this.fgColor,
						textAlign: "center",
					},
					...UI.text(title, 22, 600),
					Htx.on("click", () =>
					{
						this.selectedIndex = idx;
					})
				));
				
				if (this._selectedIndex < 0)
					this.updateSelectedIndex(idx);
			}
		}
		
		/** */
		get selectedIndex()
		{
			if (this._selectedIndex < 0 || this._selectedIndex >= this.titles.length)
				return -1;
			
			return this._selectedIndex;
		}
		set selectedIndex(idx: number)
		{
			if (idx === this._selectedIndex)
				return;
			
			this.updateSelectedIndex(idx);
			this.selectedChangedFn(idx);
		}
		
		/** */
		private updateSelectedIndex(idx: number)
		{
			const children = Query.children(this.root);
			for (let i = -1; ++i < children.length;)
			{
				const child = children[i];
				const s = child.style;
				
				if (i === idx)
				{
					s.backgroundColor = this.fgColor;
					s.color = "white";
				}
				else
				{
					s.backgroundColor = "transparent";
					s.color = this.fgColor;
				}
			}
			
			this._selectedIndex = idx;
		}
		
		private _selectedIndex = -1;
		
		/** */
		setSelectedChangedFn(fn: (idx: number) => void)
		{
			this.selectedChangedFn = fn;
		}
		private selectedChangedFn = (idx: number) => {};
	}
}
