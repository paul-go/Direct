
//
// WIP type definitions for the Trix editor.
// Use at your own risk––there are any's all over the place because
// the only areas that have been properly typed are the areas that 
// touch the supporting project.
//

/** */
declare class HTMLTrixElement extends HTMLElement
{
	readonly editor: TrixEditor;
	readonly composition: any;
	readonly filters: any;
	readonly selectionManager: any;
	readonly undoManager: any;
	insertFiles(...args: File[]): void;
}

/** */
declare class TrixEditor
{
	getDocument(): TrixDocument;
	getSelectedRange(): TrixRange;
	setSelectedRange(range: number | [number] | TrixRange): void;
	moveCursorInDirection(direction: TrixDirection): void;
	expandSelectionInDirection(direction: TrixDirection): void;
	deleteInDirection(direction: TrixDirection): void;
	getClientRectAtPosition(characterPosition: number): DOMRect;
	insertString(value: string): void;
	insertHTML(html: string): void;
	insertFile(file: File): void;
	insertFiles(...files: File[]): void;
	insertAttachment(attachment: any): void;
	insertLineBreak(): void;
	activateAttribute(attr: TrixAttribute, param?: string): void;
	deactivateAttribute(attr: TrixAttribute): void;
	increaseNestingLevel(): void;
	decreaseNestingLevel(): void;
	undo(): void;
	redo(): void;
	recordUndoEntry(description: string): void;
	loadDocument(...args: any[]): void;
	loadHTML(html: string): void;
	loadJSON(json: ITrixSerializedObject): void;
	loadSnapshot(...args: any[]): void;
	
	canUndo(): boolean;
	canRedo(): boolean;
	canActivateAttribute(attr: TrixAttribute): boolean;
	canIncreaseIndentLevel(): boolean;
	canDecreaseIndentLevel(): boolean;
	
	attributeIsActive(attr: TrixAttribute): boolean;
	
	toJSON(): ITrixSerializedObject;
}

type TrixDirection = "backward" | "forward";
type TrixAttribute = "bold" | "italic" | "href" | "strike" | "heading1" | "quote" | "code" | "bullet" | "number";
type TrixRange = [number, number];

/** */
declare class TrixDocument
{
	toString(): string;
	isEqualTo(other: TrixDocument): boolean;
	
	addAttribute(t: any, e: any): any;
	addAttributeAtRange(t: any, e: any, i: any): any;
	applyBlockAttributeAtRange(t: any, e: any, i: any): any;
	consolidateBlocksAtRange(t: any): any;
	convertLineBreaksToBlockBreaksInRange(t: any): any;
	copy(t: any): any;
	copyUsingObjectMap(t: any): any;
	copyUsingObjectsFromDocument(t: any): any;
	copyWithBaseBlockAttributes(t: any): any;
	eachBlock(t: any): any;
	eachBlockAtRange(t: any, e: any): any;
	expandRangeToLineBreaksAndSplitBlocks(t: any): any;
	findRangesForBlockAttribute(t: any): any;
	findRangesForTextAttribute(t: any, e: any): any;
	getAttachmentById(t: any): any;
	getAttachmentPieceForAttachment(t: any): any;
	getAttachmentPieces(): any;
	getAttachments(): any;
	getBaseBlockAttributes(): any;
	getBlockAtIndex(t: any): any;
	getBlockAtPosition(t: any): any;
	getBlockCount(): number;
	getBlocks(): any;
	getCharacterAtPosition(t: any): any;
	getCommonAttributesAtPosition(t: any): any;
	getCommonAttributesAtRange(t: any): any;
	getDocumentAtRange(t: any): any;
	getEditCount(): number;
	getLength(): number;
	getLocationRangeOfAttachment(t: any): any;
	getObjects(): any;
	getPieceAtPosition(t: any): any;
	getPieces(): any;
	getRangeOfAttachment(t: any): any;
	getRangeOfCommonAttributeAtPosition(attributeName: TrixAttribute, position: number): TrixRange;
	getStringAtRange(range: TrixRange): string;
	getTextAtIndex(index: number): any;
	getTextAtPosition(position: number): any;
	getTexts(): any;
	insertBlockBreakAtRange(t: any): any;
	insertDocumentAtRange(t: any, e: any): any;
	insertTextAtRange(t: any, e: any): any;
	isEmpty(): boolean;
	isEqualTo(otherDocument: TrixDocument): boolean;
	locationFromPosition(position: number): any;
	locationRangeFromPosition(position: number): TrixRange;
	locationRangeFromRange(t: any): any;
	mergeDocumentAtRange(e: any, n: any): any;
	moveTextFromRangeToPosition(t: any, e: any): any;
	positionFromLocation(t: any): any;
	rangeFromLocationRange(t: any): any;
	removeAttributeAtRange(t: any, e: any): any;
	removeAttributeForAttachment(t: any, e: any): any;
	removeBlockAttributesAtRange(t: any): any;
	removeLastListAttributeAtRange(t: any, e: any): any;
	removeLastTerminalAttributeAtRange(t: any): any;
	removeTextAtRange(t: any): any;
	replaceBlock(t: any, e: any): any;
	toConsole(): any;
	toJSON(): ITrixSerializedBlock[];
	toSerializableDocument(): ITrixSerializedBlock[];
	toString(): string;
	updateAttributesForAttachment(t: any, e: any): any;
}

/**
 * Defines the shape of the JSON data object that is generated
 * as a result of calling the .toJSON method of the TrixEditor.
 */
interface ITrixSerializedObject
{
	document: ITrixSerializedBlock[];
	selectedRange: TrixRange;
}

/** */
interface ITrixSerializedBlock
{
	text: ITrixSerializedNode[];
	attributes: TrixAttribute[];
}

/** */
interface ITrixSerializedNode
{
	type: "string" | "attachment";
	attributes: Partial<SerializedAttributes>;
	attachment?: {
		contentType: string;
		filename: string;
		filesize: number;
		width: number;
		height: number;
	};
	string: string;
}

/** */
type SerializedAttributes = {
	[K in TrixAttribute | "blockBreak"]: K extends "href" ? string : boolean;
}
