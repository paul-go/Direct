
namespace App
{
	/**
	 * 
	 */
	export namespace Editable
	{
		/** */
		export const enum Command
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
		
		/**
		 * Converts the surrounding element to one that is content editable via plain text.
		 * At the moment, this only works with webkit-based browsers. Firefox isn't
		 * supported. However, this can be changed in the future by using a normal
		 * contentEditable div, and cutting off the input events that result in HTML
		 * formatting.
		 */
		export function multi(): Htx.Param
		{
			return e =>
			{
				try
				{
					e.contentEditable = "plaintext-only";
				}
				catch (e) { }
				
				// contentEditable="plaintext-only" isn't supported,
				// switch to another implementation.
				if (e.contentEditable !== "plaintext-only")
				{
					console.error("This browser doesn't support contentEditable=plaintextonly.");
					e.contentEditable = "true";
				}
			};
		}
		
		/**
		 * Converts the surrounding element to a single-line plain-text editable area.
		 */
		export function single(options?: Partial<ISingleOptions>): Htx.Param
		{
			return [
				{
					contentEditable: "plaintext-only",
					minHeight: "1em",
				},
				
				// Make sure the element isn't inline, otherwise, the caret
				// won't display when the element has no content in it.
				When.connected(e =>
				{
					if (getComputedStyle(e).display === "inline")
						e.style.display = "inline-block";
				}),
				
				Htx.css(":empty:before", {
					content: `"${options?.placeholderText || ""}"`,
					pointerEvents: "none",
					height: "0",
					display: "inline-block",
					opacity: "0.5",
					zIndex: "-1",
					...options?.placeholderCss
				}),
				Htx.on("keydown", ev =>
				{
					if (ev.key === "Enter")
						ev.preventDefault();
				}),
				Htx.on("paste", ev =>
				{
					ev.preventDefault();
					
					const text = ev.clipboardData?.getData("text/plain");
					if (text)
						document.execCommand("insertText", false, text.replace(/[\r\n]/g, ""));
				}),
				Htx.on("beforeinput", ev =>
				{
					const cmd = ev.inputType as any as Command;
					if (!acceptedSingleCommands.has(cmd))
					{
						ev.preventDefault();
						return;
					}
				}),
			];
		}
		
		/** */
		export function toggle(target: HTMLElement, editable: boolean)
		{
			if (editable)
				target.contentEditable = "plaintext-only";
			else
				target.removeAttribute("contenteditable");
		}
		
		/**
		 * Gives the specified HTMLElement input focus. The element
		 * is expected to be content editable. The options argument allows
		 * for the caret to be placed at a specific character position.
		 */
		export function focus(
			target: HTMLElement,
			options?: FocusOptions & { position?: number })
		{
			if (typeof options?.position === "number")
			{
				let textNode = target.firstChild;
				if (!textNode)
					target.append(textNode = new Text());
				
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
			
			target.focus(options);
		}
		
		/** */
		export interface ISingleOptions
		{
			placeholderText: string;
			placeholderCss: Htx.Style;
		}
		
		/** */
		const acceptedSingleCommands = new Set<Command>([
			Command.insertText,
			Command.insertReplacementText,
			Command.insertFromYank,
			Command.insertFromDrop,
			Command.insertFromPaste,
			Command.insertFromPasteAsQuotation,
			Command.insertTranspose,
			Command.insertCompositionText,
			Command.deleteWordBackward,
			Command.deleteWordForward,
			Command.deleteSoftLineBackward,
			Command.deleteSoftLineForward,
			Command.deleteEntireSoftLine,
			Command.deleteHardLineBackward,
			Command.deleteHardLineForward,
			Command.deleteByDrag,
			Command.deleteByCut,
			Command.deleteContent,
			Command.deleteContentBackward,
			Command.deleteContentForward,
			Command.historyUndo,
			Command.historyRedo,
			Command.formatRemove,
		]);
	}
}
