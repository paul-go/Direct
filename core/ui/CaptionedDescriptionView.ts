/// <reference path="CaptionedTextView.ts" />

namespace App
{
	/** */
	export class CaptionedDescriptionView extends CaptionedTextView
	{
		/** */
		constructor()
		{
			super();
			this.root.classList.add("captioned-description-view");
			
			this.textBox = new TextBox();
			this.textBox.acceptedCommands.add(InputCommand.formatBold);
			this.root.append(this.textBox.root);
			
			this.fontSize = 4;
			this.fontWeight = 400;
			this.textBox.root.style.lineHeight = "1.5";
		}
		
		private readonly textBox;
		
		/** */
		protected get isEmpty()
		{
			return !this.html;
		}
		
		/** */
		async focus()
		{
			this.hide(false);
			await UI.wait();
			this.textBox.focus();
		}
		
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
			this.hide(!html);
			this.textBox.html = html;
		}
	}
}
