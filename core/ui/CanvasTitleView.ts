/// <reference path="CanvasTextView.ts" />

namespace App
{
	/** */
	export class CanvasTitleSetView extends CanvasTextView
	{
		/** */
		constructor(record: CanvasSceneRecord)
		{
			super(record);
			this.root.classList.add("canvas-title-view");
			
			const titleDatas = record.titles;
			for (const [, titleData] of titleDatas.entries())
			{
				const title = new CanvasTitleView(titleData.text);
				title.size = title.size;
				title.weight = title.weight;
				title.hasColor = titleData.hasColor;
			}
			
			this.hide(titleDatas.length === 0);
			Cage.set(this);
		}
		
		/** */
		protected handleTextChanged()
		{
			this.save();
		}
		
		/** */
		protected get isEmpty()
		{
			return (this.root.textContent || "").trim().length === 0;
		}
		
		/** */
		async focus()
		{
			this.hide(false);
			await UI.wait();
			
			const boxes = this.getCanvasTitles();
			if (boxes.length === 0)
			{
				const canvasTitle = new CanvasTitleView();
				this.root.append(canvasTitle.root)
				canvasTitle.root.focus();
			}
			else boxes[0].root.focus();
		}
		
		/** */
		getCanvasTitles()
		{
			return Cage.map(this, CanvasTitleView);
		}
		
		/** */
		save()
		{
			this.record.titles = this.getCanvasTitles().map(ct => ct.getData());
		}
	}
	
	/** */
	export class CanvasTitleView
	{
		/** */
		constructor(defaultText: string = "")
		{
			this.root = Htx.div(
				{
					width: "fit-content",
					minWidth: "0.1em",
					fontSize: UI.vsize(6),
					fontWeight: "700",
					marginLeft: "inherit",
					marginRight: "inherit",
				},
				Htx.on("keydown", ev =>
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
								this.root.before(new CanvasTitleView().root);
							}
							else if (atEnd)
							{
								const title = new CanvasTitleView();
								this.root.after(title.root);
								title.root.focus();
							}
							else
							{
								const textSecondHalf = this.text.slice(charPos);
								this.text = this.text.slice(0, charPos);
								const title = new CanvasTitleView(textSecondHalf);
								title.root.after(title.root);
								title.root.focus();
							}
							
							ev.preventDefault();
						}
						break; case "Backspace":
						{
							if (atStart)
							{
								const prev = Cage.previous(this, CanvasTitleView);
								if (prev)
								{
									const position = prev.text.length;
									prev.text += this.text;
									this.root.remove();
									Editable.focus(prev.root, { position });
									ev.preventDefault();
								}
							}
						}
						break; case "Delete":
						{
							if (atEnd)
							{
								const next = Cage.next(this, CanvasTitleView);
								if (next)
								{
									const position = this.text.length;
									this.text += next.text;
									next.root.remove();
									Editable.focus(this.root, { position });
									ev.preventDefault();
								}
							}
						}
						break; case "ArrowUp":
						{
							const previous = Cage.previous(this, CanvasTitleView);
							if (previous)
								Editable.focus(previous.root, { position: previous.text.length });
						}
						break; case "ArrowDown":
						{
							const next = Cage.next(this, CanvasTitleView);
							if (next)
								Editable.focus(next.root, { position: next.text.length });
						}
						break; case "ArrowLeft":
						{
							if (atStart)
							{
								const previous = Cage.previous(this, CanvasTitleView);
								if (previous)
									Editable.focus(previous.root, { position: previous.text.length });
							}
						}
						break; case "ArrowRight":
						{
							if (atEnd)
							{
								const next = Cage.next(this, CanvasTitleView);
								if (next)
									Editable.focus(next.root, { position: next.text.length });
							}
						}
					}
				},
				{ capture: true }),
				Editable.single(),
			);
			
			this.text = defaultText;
			Cage.set(this);
		}
		
		readonly root;
		
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
			return this.root.textContent || "";
		}
		set text(text: string)
		{
			this.root.textContent = text;
			Cage.up(this, CanvasTitleSetView)?.save();
		}
		
		/** */
		get size()
		{
			return UI.extractVSize(this.root.style.fontSize) || 5;
		}
		set size(size: number)
		{
			this.root.style.fontSize = UI.vsize(size);
			Cage.up(this, CanvasTitleSetView)?.save();
		}
		
		/** */
		get weight()
		{
			return Number(this.root.style.fontWeight) || 400;
		}
		set weight(weight: number)
		{
			Htx.from(this.root)(UI.specificWeight(weight));
			Cage.up(this, CanvasTitleSetView)?.save();
		}
		
		/** */
		get hasColor()
		{
			return this._hasColor;
		}
		set hasColor(hasColor: boolean)
		{
			this._hasColor = hasColor;
			Cage.up(this, CanvasTitleSetView)?.save();
		}
		private _hasColor = false;
	}
}
