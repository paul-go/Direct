
namespace Turf
{
	/** */
	export class ProseBladeView extends BladeView
	{
		/** */
		constructor(readonly record = new ProseBladeRecord())
		{
			super(record);
			
			Htx.from(this.sceneContainer)(
				Htx.div(
					CssClass.proseScene,
					{
						height: "auto",
						minHeight: UI.vsize(100),
					},
					Htx.div(
						CssClass.proseSceneForeground,
						{
							height: "auto",
							minHeight: UI.vsize(100),
						},
						UI.keyable,
						(this.textBox = new TextBox()).root
					)
				)
			);
			
			this.textBox.html = "This is the html";
			
			this.setBladeButtons(
				this.headingButton,
				this.paragraphButton,
				this.backgroundButton,
			);
			
			this.headingButton.onSelected(() =>
			{
				this.textBox.setCurrentBlockElement("h2");
			});
			
			this.paragraphButton.onSelected(() =>
			{
				this.textBox.setCurrentBlockElement("");
			});
			
			document.addEventListener("selectionchange", () =>
			{
				this.updateBladeButtons();
			});
		}
		
		private readonly textBox: TextBox;
		
		/** */
		private readonly headingButton = new BladeButtonView("Heading", {
			selectable: true,
			unselectable: false,
		});
		
		/** */
		private readonly paragraphButton = new BladeButtonView("Paragraph", {
			selectable: true,
			unselectable: false,
		});
		
		/** */
		private readonly boldButton = new BladeButtonView("Bold", {
			selectable: true,
			unselectable: true,
		});
		
		/** */
		private readonly linkButton = new BladeButtonView("Link", {
			selectable: true,
			unselectable: true,
		});
		
		/** */
		private readonly backgroundButton = new BladeButtonView("Background", {
			selectable: true,
			unselectable: true,
		});
		
		/** */
		private readonly typeButtons = [
			this.headingButton,
			this.paragraphButton
		] as const;
		
		/** */
		private readonly formatButtons = [
			this.boldButton,
			this.linkButton,
		] as const;
		
		/** */
		private readonly allButtons = [...this.typeButtons, ...this.formatButtons] as const;
		
		/** */
		private updateBladeButtons()
		{
			const sel = window.getSelection();
			if (!sel)
				return;
			
			const hasRangeSelection = 
				sel.anchorNode !== sel.focusNode || 
				sel.anchorOffset !== sel.focusOffset;
			
			const selectedRoots = this.textBox.getSelectedRoots();
			
			const hasMultiElementRangeSelection = (() =>
			{
				if (selectedRoots.at(0) instanceof HTMLBRElement)
					selectedRoots.shift();
				
				if (selectedRoots.at(-1) instanceof HTMLBRElement)
					selectedRoots.pop();
				
				if (selectedRoots.length < 2)
					return false;
				
				if (selectedRoots.find(n => 
					n instanceof HTMLBRElement || 
					n instanceof HTMLHeadingElement))
					return true;
				
				return false;
			})();
			
			this.allButtons.map(b => b.visible = hasMultiElementRangeSelection);
			
			if (hasMultiElementRangeSelection)
				return;
			
			if (selectedRoots.length === 0)
				return;
			
			if (selectedRoots.length === 1 && selectedRoots[0] instanceof HTMLHeadingElement)
			{
				this.formatButtons.map(b => b.visible = false);
				this.typeButtons.map(b => b.visible = true);
				this.headingButton.selected = true;
				this.paragraphButton.selected = false;
				return;
			}
			
			this.formatButtons.map(b => b.visible = hasRangeSelection);
			this.typeButtons.map(b => b.visible = !hasRangeSelection);
			
			// Update the format buttons
			if (hasRangeSelection)
			{
				const range = sel.getRangeAt(0);
				const frag = range.cloneContents();
				const textNodes = Array.from(Query.recurse(frag))
					.filter((n): n is Text => n instanceof Text);
				
				if (textNodes.length === 0)
					throw Exception.unknownState();
				
				let hasBold = true;
				let hasLink = true;
				
				for (const textNode of textNodes)
				{
					const ancestors = Query.ancestors(textNode, this.textBox.editableElement)
						.filter((e): e is HTMLElement => e instanceof HTMLElement);
					
					if (!ancestors.find(e => e.tagName === "B" || e.tagName === "STRONG"))
						hasBold = false;
					
					if (!ancestors.find(e => e.tagName === "A"))
						hasLink = false;
				}
				
				this.boldButton.enabled = hasBold;
				this.linkButton.enabled = hasLink;
			}
			// Update the type buttons
			else
			{
				if (selectedRoots.length !== 1)
					throw Exception.unknownState();
				
				if (selectedRoots[0] instanceof HTMLHeadingElement)
					this.headingButton.selected = true;
				else
					this.paragraphButton.selected = true;
			}
		}
		
		/** */
		save()
		{
			
		}
	}
}
