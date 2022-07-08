
namespace Turf
{
	/** */
	export class CaptionedParagraphView
	{
		/** */
		constructor()
		{
			this.root = Htx.div("captioned-paragraph-view");
			
			this.textBox = new TextBox();
			this.textBox.placeholder = "Write a paragraph, if you feel like it.";
			this.textBox.acceptedCommands.add(InputCommand.formatBold);
			this.root.append(this.textBox.root);
			
			this.fontSize = 4;
			this.fontWeight = 400;
			
			Controller.set(this);
		}
		
		readonly root;
		private readonly textBox;
		
		/** */
		get fontSize()
		{
			return this._fontSize;
		}
		set fontSize(size: number)
		{
			this._fontSize = size;
			this.textBox.root.style.fontSize = UI.vsize(size);
		}
		private _fontSize = 0;
		
		/** */
		get fontWeight()
		{
			return Number(this.textBox.root.style.fontWeight) || 400;
		}
		set fontWeight(weight: number)
		{
			this.textBox.root.style.fontVariationSettings = "'wght' " + weight;
		}
		
		/** */
		createLink(href: string)
		{
			if (document.activeElement !== this.textBox.root)
				return;
			
			document.execCommand(InputCommand.createLink, false, href);
		}
		
		/** */
		updateLink(href: string)
		{
			const sel = window.getSelection();
			if (!sel)
				return;
			
			if (sel.focusNode !== sel.anchorNode || sel.focusOffset !== sel.anchorOffset)
				return;
			
			const a = Query.ancestor(sel.focusNode, HTMLAnchorElement);
			if (!a)
				return;
			
			a.setAttribute("href", href);
		}
		
		/** */
		get html()
		{
			return this.textBox.html;
		}
		set html(html: string)
		{
			this.textBox.html = html;
		}
	}
}
