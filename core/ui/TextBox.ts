
namespace App
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
						padding: "inherit"
					}
				),
				this.editableElement = Htx.div(
					"text-box-editable",
					{
						contentEditable: "true",
						outline: "0",
						minWidth: "1px" // Minimum width needed so that the caret is visible
					}
				)
			);
			
			this.editableElement.addEventListener("keydown", ev =>
			{
				if (ev.key === "Enter")
				{
					ev.preventDefault();
					this.handleInsertLineBreak();
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
			
			Hat.wear(this);
		}
		
		/** */
		readonly root: HTMLElement;
		
		/** */
		readonly editableElement: HTMLElement;
		
		/** */
		private readonly placeholderElement: HTMLElement;
		
		/** */
		isMultiLine = true;
		
		/** (unused) */
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
		
		/** (unused) */
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
		private handleInsertLineBreak()
		{
			if (!this.isMultiLine)
				return;
			
			document.execCommand("insertLineBreak");
			if (1) return;
			
			const sel = window.getSelection();
			if (!sel)
				return;
			
			// No line break insertion when there is a selection, for now
			if (sel.anchorNode !== sel.focusNode || 
				sel.focusOffset !== sel.anchorOffset)
				return;
			
			const roots = this.getSelectedRoots();
			const root = roots[0] as HTMLElement;
			
			if (this.isBlockElement(root))
			{
				const offset = sel.anchorOffset;
				const ancestors = Query.ancestors(sel.anchorNode, root);
				
				// Can only insert <br>'s when the caret is at the beginning or end
				if ((offset === 0 && ancestors.every(e => e.previousSibling === null)) ||
					offset === (root.textContent || "").length)
					document.execCommand("insertHTML", false, "<br>");
			}
			else document.execCommand("insertLineBreak");
		}
		
		/**
		 * Wraps the current text region in a tag with the specified name.
		 * Unwraps the current text region if an empty string is provided.
		 */
		setCurrentBlockElement(tagName: string)
		{
			const sel = window.getSelection();
			if (!sel)
				return;
			
			if (sel.anchorNode !== sel.focusNode)
				return;
			
			if (!(sel.anchorNode instanceof Text))
			{
				debugger;
				return;
			}
			
			if (!(sel.focusNode instanceof Text))
			{
				debugger;
				return;
			}
			
			const focusRootNode = this.getTopNodeOf(sel.focusNode);
			
			if (!tagName)
			{
				if (this.isBlockElement(focusRootNode))
				{
					// Do the unwrapping here.
					debugger;
				}
				return;
			}
			
			const topNodes = Array.from(this.editableElement.childNodes);
			
			const focusRootIndex = Query.indexOf(focusRootNode);
			let startingIndex = focusRootIndex;
			let endingIndex = focusRootIndex;
			
			for (startingIndex = focusRootIndex; startingIndex > 0; startingIndex--)
			{
				const node = topNodes[startingIndex - 1];
				if (this.isBlockElement(node))
				{
					// Scoop up the leading <br> if it exists, so that it
					// will get replaced with the coming block element.
					if (node instanceof HTMLBRElement)
						startingIndex--;
					
					break;
				}
			}
			
			for (endingIndex = focusRootIndex; endingIndex < topNodes.length - 1; endingIndex++)
			{
				const node = topNodes[endingIndex + 1];
				if (this.isBlockElement(node))
				{
					if (node instanceof HTMLBRElement)
						endingIndex++;
					
					break;
				}
			}
			
			let startingNode = topNodes[startingIndex];
			let endingNode = topNodes[endingIndex];
			
			// Set the selection so that it gets replaced by the
			// following call to document.execCommand.
			const range = document.createRange();
			range.setStartBefore(startingNode);
			range.setEndAfter(endingNode);
			sel.removeAllRanges();
			sel.addRange(range);
			
			const nodes = topNodes.slice(startingIndex, endingIndex + 1).map(n => n.cloneNode(true));
			
			if (nodes.length > 0 && nodes[0] instanceof HTMLBRElement)
				nodes.shift();
			
			const temp = Htx.div(...nodes);
			const html = `<${tagName}>${temp.innerHTML}</${tagName}>`;
			document.execCommand("insertHTML", false, html);
		}
		
		/**
		 * Returns the block-level element that contains the caret.
		 * Returns null if the caret is not contained by an element (if it is top-level text), 
		 */
		getSelectedRoots()
		{
			const sel = window.getSelection();
			if (!sel)
				return [];
			
			if (!sel.anchorNode || !sel.focusNode)
				return [];
			
			const anchorTopNode = this.getTopNodeOf(sel.anchorNode);
			const focusTopNode = this.getTopNodeOf(sel.focusNode);
			const anchorIndex = Query.indexOf(anchorTopNode);
			const focusIndex = Query.indexOf(focusTopNode);
			const topNodes = Array.from(this.editableElement.childNodes);
			return topNodes.slice(anchorIndex, focusIndex + 1);
		}
		
		/** */
		getBlockElementOf(node: Node)
		{
			const ancestors = Query.ancestors(node, this.editableElement);
			if (ancestors.length === 0)
				return null;
			
			const e = ancestors.at(-1) as HTMLElement;
			return this.isBlockElement(e) ? e : null;
		}
		
		/** */
		private getTopNodeOf(node: Node)
		{
			const ancestors = Query.ancestors(node, this.editableElement);
			return ancestors.length === 0 ?
				node :
				ancestors.at(-1)!;
		}
		
		/** */
		private isBlockElement(node: Node)
		{
			if (node instanceof Element)
				if (!["B", "STRONG", "EM", "I", "A", "U"].includes(node.tagName))
					return true;
			
			return false;
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
