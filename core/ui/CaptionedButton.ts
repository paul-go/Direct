
namespace App
{
	/** */
	export class CaptionedButton
	{
		/** */
		constructor(
			text = "",
			href = "",
			cls = CaptionedButtonClass.pillOutline,
		)
		{
			this.root = Htx.div(
				"captioned-button",
				{
					marginTop: "20px",
				}
			);
			this.button = new TextBox();
			this.button.isMultiLine = true;
			
			{
				const s = this.button.root.style;
				s.flex = "1 0";
				s.padding = "10px";
				s.fontSize = "1.5em";
			}
			
			this.root.append(this.button.root);
			this.text = text;
			this.href = href;
			this.class = cls;
			
			this.root.append(
				this.hrefButton = Htx.a(Htx.on(UI.clickEvt, async () =>
				{
					const href = await Dialog.prompt("Where do you want this link to go?", this.href);
					if (href !== null)
						this.href = href;
				})),
				this.deleteButton = Htx.a(Htx.on(UI.clickEvt, () =>
				{
					this.root.remove();
				})),
				this.sortButton = Htx.a(Htx.on(UI.clickEvt, () =>
				{
					
				}))
			);
			
			// Lame
			this.button.root.classList.add(CaptionedButtonClass.all);
			this.class = this.class;
			
			Controller.set(this);
		}
		
		readonly root;

		private readonly button: TextBox;
		private readonly hrefButton: HTMLElement;
		private readonly deleteButton: HTMLElement;
		private readonly sortButton: HTMLElement;
		
		/** */
		get text()
		{
			return this.button.text;
		}
		set text(text: string)
		{
			this.button.html = text;
		}
		
		/** */
		href = "";
		
		/** */
		get class()
		{
			return this._class;
		}
		set class(cls: CaptionedButtonClass)
		{
			this.button.root.classList.remove(this._class);
			this._class = cls;
			this.button.root.classList.add(cls);
		}
		private _class = CaptionedButtonClass.pillOutline;
		
		/** */
		focus()
		{
			this.button.focus();
		}
	}
}
