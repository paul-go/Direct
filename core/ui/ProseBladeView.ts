
namespace Turf
{
	declare const MediumEditor: typeof import("medium-editor");
	
	/** */
	export class ProseBladeView extends BladeView
	{
		/** */
		constructor(readonly record = new VideoBladeRecord())
		{
			super(record);
			
			Htx.from(this.sceneContainer)(
				{
					height: "auto",
					minHeight: UI.vsize(100),
				},
				this.editorContainer = Htx.div(
					CssClass.proseContainer,
				)
			);
			
			this.render();
			
			this.setBladeButtons(
				this.headingButton,
				this.paragraphButton,
				this.backgroundButton,
			);
			
			this.headingButton.onSelected(() =>
			{
				
			});
		}
		
		private readonly editorContainer: HTMLElement;
		
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
		private async render()
		{
			await Util.include("../lib/medium-editor.min.js");
			await Util.include("../lib/medium-editor.min.css");
			await Util.include("../lib/medium-editor.default.min.css");
			
			this.editor = new MediumEditor(this.editorContainer, {
				toolbar: {
					allowMultiParagraphSelection: true,
					buttons: ["bold", "italic", "anchor"],
					diffLeft: 0,
					diffTop: -10,
					firstButtonClass: "medium-editor-button-first",
					lastButtonClass: "medium-editor-button-last",
					// relativeContainer: null,
					standardizeSelectionStart: false,
					static: false,
				}
			});
			
			document.addEventListener("selectionchange", ev =>
			{
				const sel = window.getSelection();
				if (sel)
				{
					// Disable the type buttons if there is a range selection
					const hasRangeSelection = 
						sel.anchorNode !== sel.focusNode ||
						sel.anchorOffset !== sel.focusOffset;
					
					this.typeButtons.map(b => b.enabled = !hasRangeSelection);
					if (hasRangeSelection)
						return;
					
					// Select the appropriate type button based on what is selected
					const isParagraphSelected = Query.ancestor(sel.focusNode, HTMLParagraphElement)
					if (isParagraphSelected)
					{
						this.paragraphButton.selected = true;
						return;
					}
					
					const isHeadingSelected = !!Query.ancestor(sel.focusNode, HTMLHeadingElement)
					if (isHeadingSelected)
					{
						this.headingButton.selected = true;
						return;
					}
				}
			});
		}
		
		private editor: MediumEditor.MediumEditor = null!;
		
		/** */
		save()
		{
			
		}
	}
	
}
