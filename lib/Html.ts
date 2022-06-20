
interface NNode extends EventTarget {
    /** Returns node's node document's document base URL. */
    readonly baseURI: string;
}

/**
 * 
 */
namespace Html { {} }

{
	const proxy = new Proxy(Html, {
		get(target: typeof Html, property: keyof typeof Html)
		{
			if (typeof property !== "string" || property.toLowerCase() !== property)
				return target[property];
			
			if (property === "on")
				return on;
			
			return (...params: Html.Param[]) => create(property, params);
		}
	});
	
	//@ts-ignore
	Html = proxy;
	
	/** */
	class HtmlEvent
	{
		constructor(
			readonly eventName: string,
			readonly handler: (ev: Event) => void,
			readonly options: AddEventListenerOptions = {})
		{ }
	}
	
	/** */
	function on(eventName: string, handler: () => void, options?: AddEventListenerOptions)
	{
		return new HtmlEvent(eventName, handler, options);
	}
	
	/** */
	function create(tagName: string, params: Html.Param[])
	{
		const e = document.createElement(tagName);
		
		for (const param of params)
		{
			if (param === false)
				continue;
			
			if (param instanceof HtmlEvent)
			{
				e.addEventListener(param.eventName, param.handler, param.options);
			}
			else if (param instanceof Node || typeof param === "string")
			{
				e.append(param);
			}
			else if (typeof param === "object" && param.constructor === Object)
			{
				for (const [name, value] of Object.entries(param))
				{
					if (name in e)
						(e as any)[name] = value;
					else
						e.style.setProperty(name, value.toString());
				}
			}
		}
	}
}

namespace Html
{
	/**
	 * Fake node class, which is compatible with the actual Node interface,
	 * but done with minimal properties in order to not negatively affect
	 * the quality of the autocompletion experience.
	 */
	export interface HtmlNode
	{
		readonly DOCUMENT_TYPE_NODE: number;
	}
	
	/**
	 * 
	 */
	export type NumericStyleDeclaration = {
		animationDelay: number;
		animationDuration: number;
		animationIterationCount: number;
		backgroundPositionX: number;
		backgroundPositionY: number;
		blockSize: number;
		border: number;
		borderBlock: number;
		borderBlockEnd: number;
		borderBlockEndWidth: number;
		borderBlockStart: number;
		borderBlockStartWidth: number;
		borderBlockWidth: number;
		borderBottom: number;
		borderBottomLeftRadius: number;
		borderBottomRightRadius: number;
		borderBottomWidth: number;
		borderEndEndRadius: number;
		borderEndStartRadius: number;
		borderInline: number;
		borderInlineEnd: number;
		borderInlineEndWidth: number;
		borderInlineStart: number;
		borderInlineStartWidth: number;
		borderInlineWidth: number;
		borderLeft: number;
		borderLeftWidth: number;
		borderRadius: number;
		borderRight: number;
		borderRightWidth: number;
		borderSpacing: number;
		borderStartEndRadius: number;
		borderStartStartRadius: number;
		borderTop: number;
		borderTopLeftRadius: number;
		borderTopRightRadius: number;
		borderTopWidth: number;
		borderWidth: number;
		bottom: number;
		columnCount: number;
		columnGap: number;
		columnRuleWidth: number;
		columnSpan: number;
		columnWidth: number;
		columns: number;
		fontSize: number;
		fontSizeAdjust: number;
		fontWeight: number;
		gridAutoColumns: number;
		gridColumn: number;
		gridColumnEnd: number;
		gridColumnGap: number;
		gridColumnStart: number;
		gridRow: number;
		gridRowEnd: number;
		gridRowStart: number;
		gridTemplate: number;
		gridTemplateAreas: number;
		gridTemplateColumns: number;
		gridTemplateRows: number;
		height: number;
		inlineSize: number;
		inset: number;
		insetBlock: number;
		insetBlockEnd: number;
		insetBlockStart: number;
		insetInline: number;
		insetInlineEnd: number;
		insetInlineStart: number;
		left: number;
		letterSpacing: number;
		lineHeight: number;
		margin: number;
		marginBlock: number;
		marginBlockEnd: number;
		marginBlockStart: number;
		marginBottom: number;
		marginInline: number;
		marginInlineEnd: number;
		marginInlineStart: number;
		marginLeft: number;
		marginRight: number;
		marginTop: number;
		maxBlockSize: number;
		maxHeight: number;
		maxInlineSize: number;
		maxWidth: number;
		minBlockSize: number;
		minHeight: number;
		minInlineSize: number;
		minWidth: number;
		offset: number;
		offsetDistance: number;
		offsetPath: number;
		offsetRotate: number;
		opacity: number;
		order: number;
		outline: number;
		outlineOffset: number;
		outlineWidth: number;
		padding: number;
		paddingBlock: number;
		paddingBlockEnd: number;
		paddingBlockStart: number;
		paddingBottom: number;
		paddingInline: number;
		paddingInlineEnd: number;
		paddingInlineStart: number;
		paddingLeft: number;
		paddingRight: number;
		paddingTop: number;
		paintOrder: number;
		right: number;
		rowGap: number;
		scale: number;
		scrollMargin: number;
		scrollMarginBlock: number;
		scrollMarginBlockEnd: number;
		scrollMarginBlockStart: number;
		scrollMarginBottom: number;
		scrollMarginInline: number;
		scrollMarginInlineEnd: number;
		scrollMarginInlineStart: number;
		scrollMarginLeft: number;
		scrollMarginRight: number;
		scrollMarginTop: number;
		scrollPadding: number;
		scrollPaddingBlock: number;
		scrollPaddingBlockEnd: number;
		scrollPaddingBlockStart: number;
		scrollPaddingBottom: number;
		scrollPaddingInline: number;
		scrollPaddingInlineEnd: number;
		scrollPaddingInlineStart: number;
		scrollPaddingLeft: number;
		scrollPaddingRight: number;
		scrollPaddingTop: number;
		tabSize: number;
		textIndent: number;
		top: number;
		transitionDelay: number;
		transitionDuration: number;
		width: number;
		wordSpacing: number;
		zIndex: number;
	};
	
	/** */
	export interface ElementAttribute
	{
		id: string;
		class: string;
		ahref: string;
		src: string;
	}
	
	/** */
	export type Param =
		// Text content
		string |
		// Class names
		string[] |
		// Event connections
		Event |
		// Conditional elements
		false |
		HtmlNode |
		Partial<CSSStyleDeclaration> |
		Partial<NumericStyleDeclaration> |
		Partial<ElementAttribute>;
	
	export declare function a(...params: Param[]): HTMLAnchorElement;
	export declare function abbr(...params: Param[]): HTMLElement;
	export declare function address(...params: Param[]): HTMLElement;
	export declare function area(...params: Param[]): HTMLAreaElement;
	export declare function article(...params: Param[]): HTMLElement;
	export declare function aside(...params: Param[]): HTMLElement;
	export declare function audio(...params: Param[]): HTMLAudioElement;
	export declare function b(...params: Param[]): HTMLElement;
	export declare function base(...params: Param[]): HTMLBaseElement;
	export declare function bdi(...params: Param[]): HTMLElement;
	export declare function bdo(...params: Param[]): HTMLElement;
	export declare function blockquote(...params: Param[]): HTMLQuoteElement;
	export declare function body(...params: Param[]): HTMLBodyElement;
	export declare function br(...params: Param[]): HTMLBRElement;
	export declare function button(...params: Param[]): HTMLButtonElement;
	export declare function canvas(...params: Param[]): HTMLCanvasElement;
	export declare function caption(...params: Param[]): HTMLTableCaptionElement;
	export declare function cite(...params: Param[]): HTMLElement;
	export declare function code(...params: Param[]): HTMLElement;
	export declare function col(...params: Param[]): HTMLTableColElement;
	export declare function colgroup(...params: Param[]): HTMLTableColElement;
	export declare function data(...params: Param[]): HTMLDataElement;
	export declare function datalist(...params: Param[]): HTMLDataListElement;
	export declare function dd(...params: Param[]): HTMLElement;
	export declare function del(...params: Param[]): HTMLModElement;
	export declare function details(...params: Param[]): HTMLDetailsElement;
	export declare function dfn(...params: Param[]): HTMLElement;
	export declare function dialog(...params: Param[]): HTMLDialogElement;
	export declare function dir(...params: Param[]): HTMLDirectoryElement;
	export declare function div(...params: Param[]): HTMLDivElement;
	export declare function dl(...params: Param[]): HTMLDListElement;
	export declare function dt(...params: Param[]): HTMLElement;
	export declare function em(...params: Param[]): HTMLElement;
	export declare function embed(...params: Param[]): HTMLEmbedElement;
	export declare function fieldset(...params: Param[]): HTMLFieldSetElement;
	export declare function figcaption(...params: Param[]): HTMLElement;
	export declare function figure(...params: Param[]): HTMLElement;
	export declare function font(...params: Param[]): HTMLFontElement;
	export declare function footer(...params: Param[]): HTMLElement;
	export declare function form(...params: Param[]): HTMLFormElement;
	export declare function frame(...params: Param[]): HTMLFrameElement;
	export declare function frameset(...params: Param[]): HTMLFrameSetElement;
	export declare function h1(...params: Param[]): HTMLHeadingElement;
	export declare function h2(...params: Param[]): HTMLHeadingElement;
	export declare function h3(...params: Param[]): HTMLHeadingElement;
	export declare function h4(...params: Param[]): HTMLHeadingElement;
	export declare function h5(...params: Param[]): HTMLHeadingElement;
	export declare function h6(...params: Param[]): HTMLHeadingElement;
	export declare function head(...params: Param[]): HTMLHeadElement;
	export declare function header(...params: Param[]): HTMLElement;
	export declare function hgroup(...params: Param[]): HTMLElement;
	export declare function hr(...params: Param[]): HTMLHRElement;
	export declare function html(...params: Param[]): HTMLHtmlElement;
	export declare function i(...params: Param[]): HTMLElement;
	export declare function iframe(...params: Param[]): HTMLIFrameElement;
	export declare function img(...params: Param[]): HTMLImageElement;
	export declare function input(...params: Param[]): HTMLInputElement;
	export declare function ins(...params: Param[]): HTMLModElement;
	export declare function kbd(...params: Param[]): HTMLElement;
	export declare function label(...params: Param[]): HTMLLabelElement;
	export declare function legend(...params: Param[]): HTMLLegendElement;
	export declare function li(...params: Param[]): HTMLLIElement;
	export declare function link(...params: Param[]): HTMLLinkElement;
	export declare function main(...params: Param[]): HTMLElement;
	export declare function map(...params: Param[]): HTMLMapElement;
	export declare function mark(...params: Param[]): HTMLElement;
	export declare function marquee(...params: Param[]): HTMLMarqueeElement;
	export declare function menu(...params: Param[]): HTMLMenuElement;
	export declare function meta(...params: Param[]): HTMLMetaElement;
	export declare function meter(...params: Param[]): HTMLMeterElement;
	export declare function nav(...params: Param[]): HTMLElement;
	export declare function noscript(...params: Param[]): HTMLElement;
	export declare function object(...params: Param[]): HTMLObjectElement;
	export declare function ol(...params: Param[]): HTMLOListElement;
	export declare function optgroup(...params: Param[]): HTMLOptGroupElement;
	export declare function option(...params: Param[]): HTMLOptionElement;
	export declare function output(...params: Param[]): HTMLOutputElement;
	export declare function p(...params: Param[]): HTMLParagraphElement;
	export declare function param(...params: Param[]): HTMLParamElement;
	export declare function picture(...params: Param[]): HTMLPictureElement;
	export declare function pre(...params: Param[]): HTMLPreElement;
	export declare function progress(...params: Param[]): HTMLProgressElement;
	export declare function q(...params: Param[]): HTMLQuoteElement;
	export declare function rp(...params: Param[]): HTMLElement;
	export declare function rt(...params: Param[]): HTMLElement;
	export declare function ruby(...params: Param[]): HTMLElement;
	export declare function s(...params: Param[]): HTMLElement;
	export declare function samp(...params: Param[]): HTMLElement;
	export declare function script(...params: Param[]): HTMLScriptElement;
	export declare function section(...params: Param[]): HTMLElement;
	export declare function select(...params: Param[]): HTMLSelectElement;
	export declare function slot(...params: Param[]): HTMLSlotElement;
	export declare function small(...params: Param[]): HTMLElement;
	export declare function source(...params: Param[]): HTMLSourceElement;
	export declare function span(...params: Param[]): HTMLSpanElement;
	export declare function strong(...params: Param[]): HTMLElement;
	export declare function style(...params: Param[]): HTMLStyleElement;
	export declare function sub(...params: Param[]): HTMLElement;
	export declare function summary(...params: Param[]): HTMLElement;
	export declare function sup(...params: Param[]): HTMLElement;
	export declare function table(...params: Param[]): HTMLTableElement;
	export declare function tbody(...params: Param[]): HTMLTableSectionElement;
	export declare function td(...params: Param[]): HTMLTableCellElement;
	export declare function template(...params: Param[]): HTMLTemplateElement;
	export declare function textarea(...params: Param[]): HTMLTextAreaElement;
	export declare function tfoot(...params: Param[]): HTMLTableSectionElement;
	export declare function th(...params: Param[]): HTMLTableCellElement;
	export declare function thead(...params: Param[]): HTMLTableSectionElement;
	export declare function time(...params: Param[]): HTMLTimeElement;
	export declare function title(...params: Param[]): HTMLTitleElement;
	export declare function tr(...params: Param[]): HTMLTableRowElement;
	export declare function track(...params: Param[]): HTMLTrackElement;
	export declare function u(...params: Param[]): HTMLElement;
	export declare function ul(...params: Param[]): HTMLUListElement;
	export declare function video(...params: Param[]): HTMLVideoElement;
	export declare function wbr(...params: Param[]): HTMLElement;
	
	export declare function div(...params: Param[]): HTMLDivElement;
	
	/** */
	export interface EventMap extends HTMLElementEventMap
	{
		"input": InputEvent;
	}
	
	/** */
	export declare function on<K extends keyof HTMLElementEventMap>(
		type: K,
		listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
		options?: boolean | AddEventListenerOptions): Event;
	
	/** */
	export declare class Event
	{
		constructor(
			eventName: string,
			handler: (ev: Event) => void,
			options?: AddEventListenerOptions)
		
		private readonly undefined: undefined;
	}
}
