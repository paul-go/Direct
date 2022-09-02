/// <reference path="CanvasTextHat.ts" />

namespace App
{
	/** */
	export class CanvasTitleSetHat extends CanvasTextHat
	{
		/** */
		constructor(record: CanvasSceneRecord)
		{
			super(record);
			this.head.classList.add("canvas-title-hat");
			
			const titleDatas = record.titles;
			for (const [, titleData] of titleDatas.entries())
			{
				const title = new CanvasTitleHat(titleData.text);
				title.size = title.size;
				title.weight = title.weight;
				title.hasColor = titleData.hasColor;
				this.head.append(title.head);
			}
			
			this.hide(titleDatas.length === 0);
			Hat.wear(this);
		}
		
		/** */
		protected handleTextChanged()
		{
			this.save();
		}
		
		/** */
		protected get isEmpty()
		{
			return (this.head.textContent || "").trim().length === 0;
		}
		
		/** */
		async focus()
		{
			this.hide(false);
			await UI.wait();
			
			const boxes = this.getCanvasTitles();
			if (boxes.length === 0)
			{
				const canvasTitle = new CanvasTitleHat();
				this.head.append(canvasTitle.head)
				canvasTitle.head.focus();
			}
			else boxes[0].head.focus();
		}
		
		/** */
		getCanvasTitles()
		{
			return Hat.map(this, CanvasTitleHat);
		}
		
		/** */
		save()
		{
			this.record.titles = this.getCanvasTitles().map(ct => ct.getData());
		}
	}
	
	/** */
	export class CanvasTitleHat
	{
		/** */
		constructor(defaultText: string = "")
		{
			this.head = Hot.div(
				{
					width: "fit-content",
					minWidth: "0.1em",
					fontSize: UI.vsize(6),
					fontWeight: 700,
					marginLeft: "inherit",
					marginRight: "inherit",
				},
				Hot.on("keydown", ev =>
				{
					const charPos = window.getSelection()?.focusOffset || 0;
					const charCount = this.text.length;
					const atStart = charPos === 0;
					const atEnd = charPos > charCount - 2;
					
					switch (ev.key)
					{
						case "Enter":
						{
							if (atStart)
							{
								this.head.before(new CanvasTitleHat().head);
							}
							else if (atEnd)
							{
								const title = new CanvasTitleHat();
								this.head.after(title.head);
								title.head.focus();
							}
							else
							{
								const textSecondHalf = this.text.slice(charPos);
								this.text = this.text.slice(0, charPos);
								const title = new CanvasTitleHat(textSecondHalf);
								title.head.after(title.head);
								title.head.focus();
							}
							
							ev.preventDefault();
						}
						break; case "Backspace":
						{
							if (atStart)
							{
								const prev = Hat.previous(this, CanvasTitleHat);
								if (prev)
								{
									const position = prev.text.length;
									prev.text += this.text;
									this.head.remove();
									Editable.focus(prev.head, { position });
									ev.preventDefault();
								}
							}
						}
						break; case "Delete":
						{
							if (atEnd)
							{
								const next = Hat.next(this, CanvasTitleHat);
								if (next)
								{
									const position = this.text.length;
									this.text += next.text;
									next.head.remove();
									Editable.focus(this.head, { position });
									ev.preventDefault();
								}
							}
						}
						break; case "ArrowUp":
						{
							const previous = Hat.previous(this, CanvasTitleHat);
							if (previous)
								Editable.focus(previous.head, { position: previous.text.length });
						}
						break; case "ArrowDown":
						{
							const next = Hat.next(this, CanvasTitleHat);
							if (next)
								Editable.focus(next.head, { position: next.text.length });
						}
						break; case "ArrowLeft":
						{
							if (atStart)
							{
								const previous = Hat.previous(this, CanvasTitleHat);
								if (previous)
									Editable.focus(previous.head, { position: previous.text.length });
							}
						}
						break; case "ArrowRight":
						{
							if (atEnd)
							{
								const next = Hat.next(this, CanvasTitleHat);
								if (next)
									Editable.focus(next.head, { position: next.text.length });
							}
						}
					}
				},
				{ capture: true }),
				Editable.single(),
			);
			
			this.text = defaultText;
			this.hasColor = false;
			Hat.wear(this);
		}
		
		readonly head;
		
		/** */
		getData(): ITitle
		{
			return {
				text: this.text,
				size: this.size,
				weight: this.weight,
				hasColor: this.hasColor,
			}
		}
		
		/** */
		get text()
		{
			return this.head.textContent || "";
		}
		set text(text: string)
		{
			this.head.textContent = text;
			Hat.up(this, CanvasTitleSetHat)?.save();
		}
		
		/** */
		get size()
		{
			return UI.extractVSize(this.head.style.fontSize) || 5;
		}
		set size(size: number)
		{
			this.head.style.fontSize = UI.vsize(size);
			Hat.up(this, CanvasTitleSetHat)?.save();
		}
		
		/** */
		get weight()
		{
			return Number(this.head.style.fontWeight) || 400;
		}
		set weight(weight: number)
		{
			Hot.get(this.head)(UI.specificWeight(weight));
			Hat.up(this, CanvasTitleSetHat)?.save();
		}
		
		/** */
		get hasColor()
		{
			return this._hasColor;
		}
		set hasColor(hasColor: boolean)
		{
			const cssVar = hasColor ? 
				ConstS.foreColorProperty :
				ConstS.foreUncolorProperty;
			
			this.head.style.color = `var(${cssVar})`;
			this._hasColor = hasColor;
			Hat.up(this, CanvasTitleSetHat)?.save();
		}
		private _hasColor = false;
	}
}
