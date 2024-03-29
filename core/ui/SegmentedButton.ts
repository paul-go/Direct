
namespace App
{
	/** */
	export class SegmentedButton
	{
		/** */
		constructor(...params: Hot.Param[])
		{
			this.head = Hot.div(
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
		
		readonly head;
		private readonly titles: string[] = [];
		private readonly fgColor = UI.themeColor;
		
		/** */
		add(...titles: string[])
		{
			for (const [idx, title] of titles.entries())
			{
				this.titles.push(title);
				
				this.head.append(Hot.div(
					{
						flex: "1 0",
						padding: "15px 5px",
						borderRadius: (parseInt(UI.borderRadius.large) - 3) + "px",
						backgroundColor: "transparent",
						color: this.fgColor,
						textAlign: "center",
					},
					...UI.text(title, 22, 600),
					Hot.on("click", () =>
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
			const children = Query.children(this.head);
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
