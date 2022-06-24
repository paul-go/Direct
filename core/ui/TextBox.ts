
namespace Grassroots
{
	/**
	 * A class that wraps a tightly controlled contentEditable <div>.
	 */
	export class TextBox
	{
		/** */
		constructor()
		{
			this.root = Htx.div(
				"text-box",
				this.placeholderElement = Htx.div(
					"text-box-placeholder",
					UI.anchor(),
					{
						maxHeight: "min-content",
						margin: "auto",
						whiteSpace: "nowrap",
						zIndex: "-1",
						pointerEvents: "none",
						fontStyle: "italic",
						opacity: "0.33",
					}
				),
				this.editableElement = Htx.div(
					"text-box-editable",
					{
						contentEditable: "true",
						outline: "0",
					}
				)
			);
			
			this.editableElement.addEventListener("keydown", ev =>
			{
				if (ev.key === "Enter")
				{
					if (this.isMultiLine)
						document.execCommand("insertLineBreak");
					
					ev.preventDefault();
				}
			});
			
			this.editableElement.addEventListener("paste", ev =>
			{
				ev.preventDefault();
				
				let text = ev.clipboardData?.getData("text/plain");
				if (text)
					document.execCommand("insertHTML", false, text);
			});
			
			this.editableElement.addEventListener("beforeinput", ev =>
			{
				const ic = ev.inputType as any as InputCommand;
				if (!this.acceptedCommands.has(ic))
				{
					ev.preventDefault();
					return;
				}
			});
			
			this.editableElement.addEventListener("input", () =>
			{
				this.updatePlaceholder();
			});
			
			this.updatePlaceholder();
			
			Controller.set(this);
		}
		
		/** */
		readonly root: HTMLElement;
		
		/** */
		readonly editableElement: HTMLElement;
		
		/** */
		private readonly placeholderElement: HTMLElement;
		
		/** */
		isMultiLine = true;
		
		/** */
		get characterPosition()
		{
			const sel = document.getSelection();
			if (!sel || !sel.focusNode)
				return 0;
			
			const range = document.createRange();
			range.setStart(this.editableElement, 0);
			range.setEnd(sel.focusNode, sel.focusOffset);
			return 0;
		}
		
		/** */
		get characterCount()
		{
			return this.editableElement.textContent?.length || 0;
		}
		
		/** */
		get html()
		{
			return this.editableElement.innerHTML;
		}
		set html(html: string)
		{
			this.editableElement.innerHTML = html;
			this.updatePlaceholder();
		}
		
		/** */
		get text()
		{
			return this.editableElement.textContent || "";
		}
		
		/** */
		get placeholder()
		{
			return this.placeholderElement.textContent || "";
		}
		set placeholder(placeholder: string)
		{
			this.placeholderElement.textContent = placeholder;
			this.updatePlaceholder();
		}
		
		/** */
		private updatePlaceholder()
		{
			this.placeholderElement.style.opacity = this.html ? "0" : "0.33";
		}
		
		/** */
		focus(options?: FocusOptions & { position?: number })
		{
			if (typeof options?.position === "number")
			{
				let textNode = this.editableElement.firstChild;
				if (!textNode)
					this.editableElement.append(textNode = new Text());
				
				const sel = window.getSelection();
				if (sel)
				{
					const range = document.createRange();
					range.setStart(textNode, options.position);
					range.collapse(true);
					sel.removeAllRanges();
					sel.addRange(range);
				}
			}
			
			this.editableElement.focus(options);
		}
		
		/** */
		readonly acceptedCommands = new Set<InputCommand>([
			InputCommand.insertText,
			InputCommand.insertReplacementText,
			InputCommand.insertFromYank,
			InputCommand.insertFromDrop,
			InputCommand.insertFromPaste,
			InputCommand.insertFromPasteAsQuotation,
			InputCommand.insertTranspose,
			InputCommand.insertCompositionText,
			InputCommand.deleteWordBackward,
			InputCommand.deleteWordForward,
			InputCommand.deleteSoftLineBackward,
			InputCommand.deleteSoftLineForward,
			InputCommand.deleteEntireSoftLine,
			InputCommand.deleteHardLineBackward,
			InputCommand.deleteHardLineForward,
			InputCommand.deleteByDrag,
			InputCommand.deleteByCut,
			InputCommand.deleteContent,
			InputCommand.deleteContentBackward,
			InputCommand.deleteContentForward,
			InputCommand.historyUndo,
			InputCommand.historyRedo,
			InputCommand.formatRemove,
		]);
	}
	
	/** */
	export const enum InputCommand
	{
		// Mostly disabled
		insertParagraph = "insertParagraph",
		insertOrderedList = "insertOrderedList",
		insertUnorderedList = "insertUnorderedList",
		insertHorizontalRule = "insertHorizontalRule",
		createLink = "createLink",
		formatBold = "formatBold",
		formatItalic = "formatItalic",
		formatUnderline = "formatUnderline",
		formatStrikeThrough = "formatStrikeThrough",
		formatSuperscript = "formatSuperscript",
		formatSubscript = "formatSubscript",
		formatJustifyFull = "formatJustifyFull",
		formatJustifyCenter = "formatJustifyCenter",
		formatJustifyRight = "formatJustifyRight",
		formatJustifyLeft = "formatJustifyLeft",
		formatIndent = "formatIndent",
		formatOutdent = "formatOutdent",
		formatSetBlockTextDirection = "formatSetBlockTextDirection",
		formatSetInlineTextDirection = "formatSetInlineTextDirection",
		formatBackColor = "formatBackColor",
		formatFontColor = "formatFontColor",
		formatFontName = "formatFontName",
		
		// Mostly enabled
		insertText = "insertText",
		insertReplacementText = "insertReplacementText",
		insertFromYank = "insertFromYank",
		insertFromDrop = "insertFromDrop",
		insertFromPaste = "insertFromPaste",
		insertFromPasteAsQuotation = "insertFromPasteAsQuotation",
		insertTranspose = "insertTranspose",
		insertCompositionText = "insertCompositionText",
		deleteWordBackward = "deleteWordBackward",
		deleteWordForward = "deleteWordForward",
		deleteSoftLineBackward = "deleteSoftLineBackward",
		deleteSoftLineForward = "deleteSoftLineForward",
		deleteEntireSoftLine = "deleteEntireSoftLine",
		deleteHardLineBackward = "deleteHardLineBackward",
		deleteHardLineForward = "deleteHardLineForward",
		deleteByDrag = "deleteByDrag",
		deleteByCut = "deleteByCut",
		deleteContent = "deleteContent",
		deleteContentBackward = "deleteContentBackward",
		deleteContentForward = "deleteContentForward",
		historyUndo = "historyUndo",
		historyRedo = "historyRedo",
		formatRemove = "formatRemove",
	}
}
