
namespace Turf
{
	/** */
	export class SegmentedButton
	{
		/** */
		constructor()
		{
			this.root = Htx.div(
				{
					display: "flex",
					borderRadius: UI.borderRadius.large,
					border: "2px solid " + this.fgColor,
					padding: "2px",
				}
			);
		}
		
		readonly root;
		private readonly titles: string[] = [];
		private readonly fgColor = UI.black(0.5);
		
		/** */
		add(title: string)
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
					this.selected = title;
				})
			));
		}
		
		/** */
		get selected()
		{
			if (this._selected < 0 || this._selected >= this.titles.length)
				return "";
			
			return this.titles[this._selected];
		}
		set selected(title: string)
		{
			const titleIndex = this.titles.findIndex(t => t === title);
			if (titleIndex < 0)
				throw "Title not found: " + title;
			
			if (titleIndex === this._selected)
				return;
			
			const children = Query.children(this.root);
			for (let i = -1; ++i < children.length;)
			{
				const child = children[i];
				const s = child.style;
				
				if (i === titleIndex)
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
			
			this._selected = titleIndex;
			this.selectedChangedFn();
		}
		private _selected = -1;
		
		/** */
		setSelectedChangedFn(fn: () => void)
		{
			this.selectedChangedFn = fn;
		}
		private selectedChangedFn = () => {};
	}
}
