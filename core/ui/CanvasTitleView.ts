/// <reference path="CanvasTextView.ts" />

namespace App
{
	/** */
	export class CanvasTitleView extends CanvasTextView
	{
		/** */
		constructor(record: CanvasSceneRecord)
		{
			super(record);
			this.root.classList.add("canvas-title-view");
		}
		
		/** */
		protected handleTextChanged()
		{
			this.record.titles = this.getTitleData();
		}
		
		/** */
		protected get isEmpty()
		{
			const data = this.getTitleData();
			return data.length === 0 || data.every(d => d.text.trim() === "");
		}
		
		/** */
		setTitles(titles: ITitle[] = [])
		{
			for (const [i, title] of titles.entries())
			{
				this.insertTitle(title.text);
				this.setFontSize(i, title.size);
				this.setFontWeight(i, title.weight);
			}
			
			if (titles.length > 0)
				this.hide(false);
		}
		
		/** */
		insertTitle(titleText: string, before: TextBox | null = null)
		{
			const textbox = new TextBox();
			textbox.isMultiLine = false;
			textbox.html = titleText;
			
			Htx.from(textbox.root)(
				{
					width: "fit-content",
					fontSize: UI.vsize(6),
					fontWeight: "700",
					marginLeft: "inherit",
					marginRight: "inherit",
				},
			);
			
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
							const next = Cage.next(textbox.root, TextBox);
							const tb = this.insertTitle("", next);
							tb.focus();
						}
						else
						{
							const next = Cage.next(textbox.root, TextBox);
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
							const prev = Cage.previous(textbox.root, TextBox);
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
							const next = Cage.next(textbox.root, TextBox);
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
						const previous = Cage.previous(textbox.root, TextBox);
						if (previous)
							previous.focus({ position: previous.text.length });
					}
					break; case "ArrowDown":
					{
						const next = Cage.next(textbox.root, TextBox);
						if (next)
							next.focus({ position: next.text.length });
					}
					break; case "ArrowLeft":
					{
						if (atStart)
						{
							const previous = Cage.previous(textbox.root, TextBox);
							if (previous)
								previous.focus({ position: previous.text.length });
						}
					}
					break; case "ArrowRight":
					{
						if (atEnd)
						{
							const next = Cage.next(textbox.root, TextBox);
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
		async focus()
		{
			this.hide(false);
			await UI.wait();
			
			const boxes = this.getTextBoxes();
			if (boxes.length === 0)
				this.insertTitle("").focus();
			else
				this.getTextBox(0)!.focus();
		}
		
		/** */
		getTextBox(index: number)
		{
			const e = Query.children(this.root).at(index);
			return e ? Cage.get(e, TextBox) : null;
		}
		
		/** */
		getTextBoxes()
		{
			return Cage.map(Query.children(this.root), TextBox);
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
			if (tb)
			{
				const n = Number(tb.root.style.fontWeight);
				if (n)
					return n;
			}
			
			return 400;
		}
		
		/** */
		setFontWeight(index: number, weight: number)
		{
			const tb = this.getTextBox(index);
			if (tb)
				Htx.from(tb.root)(UI.specificWeight(weight));
		}
		
		/** */
		getTitleFromPoint(x: number, y: number)
		{
			// You don't need to get the HTML, you just need the thing that will
			// You need to return some object that you can 
		}
		
		/** */
		getTitleData()
		{
			const textBoxes = Cage.map(Query.children(this.root), TextBox);
			const data: ITitle[] = [];
			
			for (let i = -1; ++i < textBoxes.length;)
			{
				data.push({
					text: textBoxes[i].text,
					size: this.getFontSize(i),
					weight: this.getFontWeight(i),
				});
			}
			
			return data;
		}
	}
}
