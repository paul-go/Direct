
namespace Grassroots
{
	/** */
	export class CaptionedTitleView
	{
		/** */
		constructor()
		{
			this.root = Htx.div("title-block");
			Controller.set(this);
		}
		
		readonly root: HTMLElement;
		
		/** */
		insertTitle(titleText: string, before: TextBox | null = null)
		{
			const textbox = new TextBox();
			textbox.isMultiLine = false;
			textbox.placeholder = "Title";
			textbox.html = titleText;
			
			{
				const s = textbox.root.style;
				s.marginBottom = "0.25em";
				s.fontSize = UI.vsize(6);
				s.fontWeight = "700";
			}
			
			textbox.root.addEventListener("keydown", ev =>
			{
				const charPos = window.getSelection()?.focusOffset || 0;
				const charCount = textbox.text.length;
				const atStart = charPos === 0;
				const atEnd = charPos > charCount - 2;
				
				switch (ev.key)
				{
					case "Enter":
					{
						if (atStart)
						{
							this.insertTitle("", textbox);
						}
						else if (atEnd)
						{
							const next = Controller.next(textbox.root, TextBox);
							const tb = this.insertTitle("", next);
							tb.focus();
						}
						else
						{
							const next = Controller.next(textbox.root, TextBox);
							const text = textbox.text.slice(charPos);
							const newTextBox = this.insertTitle(text, next);
							newTextBox.focus();
							textbox.html = textbox.text.slice(0, charPos);
						}
						
						ev.preventDefault();
					}
					break; case "Backspace":
					{
						if (atStart)
						{
							const prev = Controller.previous(textbox.root, TextBox);
							if (prev)
							{
								const position = prev.text.length;
								prev.html += textbox.text;
								textbox.root.remove();
								prev.focus({ position });
								ev.preventDefault();
							}
						}
					}
					break; case "Delete":
					{
						if (atEnd)
						{
							const next = Controller.next(textbox.root, TextBox);
							if (next)
							{
								const position = textbox.text.length;
								textbox.html += next.text;
								next.root.remove();
								textbox.focus({ position });
								ev.preventDefault();
							}
						}
					}
					break; case "ArrowUp":
					{
						const previous = Controller.previous(textbox.root, TextBox);
						if (previous)
							previous.focus({ position: previous.text.length });
					}
					break; case "ArrowDown":
					{
						const next = Controller.next(textbox.root, TextBox);
						if (next)
							next.focus({ position: next.text.length });
					}
					break; case "ArrowLeft":
					{
						if (atStart)
						{
							const previous = Controller.previous(textbox.root, TextBox);
							if (previous)
								previous.focus({ position: previous.text.length });
						}
					}
					break; case "ArrowRight":
					{
						if (atEnd)
						{
							const next = Controller.next(textbox.root, TextBox);
							if (next)
								next.focus({ position: next.text.length });
						}
					}
				}
			},
			{ capture: true });
			
			this.root.insertBefore(textbox.root, before?.root || null);
			textbox.acceptedCommands.add(InputCommand.formatBold);
			return textbox;
		}
		
		/** */
		private getTextBox(index: number)
		{
			const e = Query.children(this.root)[index];
			return e ? Controller.get(e, TextBox) : null;
		}
		
		/** */
		getFontSize(index: number)
		{
			const tb = this.getTextBox(index);
			return tb ? UI.extractVSize(tb.root.style.fontSize) || 5 : 5;
		}
		
		/** */
		setFontSize(index: number, size: number)
		{
			const tb = this.getTextBox(index);
			if (tb)
				tb.root.style.fontSize = UI.vsize(size);
		}
		
		/** */
		getFontWeight(index: number)
		{
			const tb = this.getTextBox(index);
			return tb ? Number(tb.root.style.fontWeight) || 400 : 400;
		}
		
		/** */
		setFontWeight(index: number, weight: number)
		{
			const tb = this.getTextBox(index);
			if (tb)
				//tb.root.style.fontWeight = weight.toString();
				tb.root.style.fontFeatureSettings = "'wght' " + weight.toString();
		}
		
		/** */
		getTitleFromPoint(x: number, y: number)
		{
			// You don't need to get the HTML, you just need the thing that will
			// You need to return some object that you can 
		}
		
		/** */
		getHtml()
		{
			// Getting the html right isn't a problem
			
			// Can't be done just yet because I don't have size and weight figured out.
			
			return "";
		}
	}
}
