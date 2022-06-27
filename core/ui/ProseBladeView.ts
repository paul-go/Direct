
namespace Turf
{
	declare const MediumEditor: typeof import("medium-editor");
	
	/** */
	export class ProseBladeView extends BladeView
	{
		/** */
		constructor()
		{
			super();
			
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
		}
		
		private readonly editorContainer: HTMLElement;
		
		/** */
		private async render()
		{
			await Util.include("../lib/medium-editor.min.js");
			await Util.include("../lib/medium-editor.min.css");
			await Util.include("../lib/medium-editor.default.min.css");
			
			const editor = new MediumEditor(this.editorContainer, {
				toolbar: {
					allowMultiParagraphSelection: true,
					buttons: ["bold", "italic", "underline", "anchor", "h2", "h3", "quote"],
					diffLeft: 0,
					diffTop: -10,
					firstButtonClass: "medium-editor-button-first",
					lastButtonClass: "medium-editor-button-last",
					// relativeContainer: null,
					standardizeSelectionStart: false,
					static: false,
					// options which only apply when static is true
					align: "center",
					sticky: false,
					updateOnEmptySelection: false,
				}
			});
			
			
		}
	}
}
