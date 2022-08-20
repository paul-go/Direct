/// <reference path="CanvasTextHat.ts" />

namespace App
{
	/** */
	export class CanvasDescriptionHat extends CanvasTextHat
	{
		/** */
		constructor(record: CanvasSceneRecord)
		{
			super(record);
			this.root.classList.add("canvas-description-hat");
			
			this.textArea = Htx.div(
				Editable.multi(),
				{
					width: "100%",
					minWidth: "0.1em",
					lineHeight: ConstN.descriptionLineHeight.toString(),
					whiteSpace: "pre-wrap"
				}
			);
			
			this.root.append(this.textArea);
			this.fontSize = 4;
			this.fontWeight = ConstN.descriptionFontWeight;
		}
		
		private readonly textArea;
		
		/** */
		protected handleTextChanged()
		{
			this.record.description = this.text;
		}
		
		/** */
		protected get isEmpty()
		{
			return !this.text;
		}
		
		/** */
		async focus()
		{
			this.hide(false);
			await UI.wait();
			this.textArea.focus();
		}
		
		/** */
		get fontSize()
		{
			return this._fontSize;
		}
		set fontSize(size: number)
		{
			this._fontSize = size;
			this.textArea.style.fontSize = UI.vsize(size);
		}
		private _fontSize = 0;
		
		/** */
		get fontWeight()
		{
			return Number(this.textArea.style.fontWeight) || 400;
		}
		set fontWeight(weight: number)
		{
			Htx.get(this.textArea)(UI.specificWeight(weight));
		}
		
		/** */
		createLink(href: string)
		{
			if (document.activeElement !== this.textArea)
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
		get text()
		{
			return this.textArea.textContent || "";
		}
		set text(text: string)
		{
			this.hide(!text);
			this.textArea.textContent = text;
		}
	}
}
