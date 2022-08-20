
/**
 * This is a necessary CSS property that appears to be missing from the
 * standard set of type definitions. This should be removed this once this 
 * is added upstream.
 */
interface CSSStyleDeclaration
{
	backdropFilter: string;
	webkitBackdropFilter: string;
}

/**
 * 
 */
namespace Hot { { } }

{
	const proxy = new Proxy(Hot, {
		get(target: typeof Hot, name: keyof typeof Hot)
		{
			switch (name)
			{
				case "on": return on;
				case "css": return css;
				case "animation": return animation;
				case "get": return get;
			}
			
			return (...params: Hot.Param[]) => create(name, params);
		}
	});
	
	//@ts-ignore
	Hot = proxy;
	
	/** */
	class HotEvent
	{
		constructor(
			readonly target: Node | null,
			readonly eventName: string,
			readonly handler: (ev: Event) => void,
			readonly options: AddEventListenerOptions = {})
		{ }
	}
	
	/** */
	function on(...args: any[])
	{
		/*
		
		Actual argument structure looks like:
			target?: Node,
			eventName: string,
			handler: () => void,
			options?: Hot.EventListenerOptions)
		
		*/
		
		const target: Node | null = typeof args[0] === "string" ? null : args[0];
		const eventName: string = typeof args[0] === "string" ? args[0] : args[1];
		const handler = typeof args[1] === "function" ? args[1] : args[2];
		const last = args.pop();
		const options: AddEventListenerOptions = typeof last === "function" ? {} : last;
		return new HotEvent(target, eventName, handler, options);
	}
	
	/** */
	function get(...elements: Element[])
	{
		return (...params: Hot.Param[]) =>
		{
			for (const e of elements)
				if (e instanceof Element)
					apply(e, params);
			
			return elements[0] || null;
		};
	}
	
	/** */
	function create(tagName: string, params: Hot.Param[])
	{
		return apply(document.createElement(tagName), params);
	}
	
	/** */
	function apply(e: Element, params: Hot.Param[])
	{
		if (cssPropertySet === null)
		{
			const propertyNames: string[] = [];
			
			for (const key in document.documentElement.style)
				propertyNames.push(key);
			
			cssPropertySet = new Set(propertyNames);
		}
		
		// CAUTION: This code is performance critical. It uses constructor
		// checks instead of instanceof and typeof for performance reasons.
		// Be careful of changing this code without having full knowledge
		// of what you're doing.
		for (let i = -1, length = params.length; ++i < length;)
		{
			const param = params[i];
			if (!param)
				continue;
			
			if (param instanceof Node)
			{
				e.append(param as Node);
			}
			else if (Array.isArray(param))
			{
				apply(e, param);
			}
			else switch (param.constructor)
			{
				case HotEvent:
				{
					const evt = param as HotEvent;
					const node = evt.target;
					if (node)
					{
						let handler: (ev: Event) => void;
						node.addEventListener(evt.eventName, handler = (ev: Event) =>
						{
							if (e.isConnected)
								evt.handler(ev as any);
							else
								node.removeEventListener(evt.eventName, handler);
						});
					}
					else
					{
						e.addEventListener(
							evt.eventName,
							evt.handler,
							evt.options);
					}
				}
				break; case String:
				{
					e.classList.add(param as string);
				}
				break; case Object:
				{
					const el = e as any;
					
					for (const [name, value] of Object.entries(param))
					{
						if (name === "data")
						{
							for (const [attrName, attrValue] of Object.entries(value || {}))
								e.setAttribute("data-" + attrName, String(attrValue));
						}
						// Width and height properties are special cased.
						// They are interpreted as CSS properties rather
						// than HTML attributes.
						else if (name in e && name !== "width" && name !== "height")
							el[name] = value;
						
						else if (cssPropertySet.has(name))
							el.style[name] = value.toString();
					}
				}
				break; case Function:
				{
					if (e instanceof HTMLElement)
					{
						const fn = param as Hot.Closure;
						const subParams = fn(e);
						
						if (subParams)
							apply(e, Array.isArray(subParams) ? subParams : [subParams]);
					}
				}
			}
		}
		
		return e;
	}
	
	let cssPropertySet: Set<string> | null = null;
	
	/** */
	function css(selectorOrStyles: string | Hot.Style, maybeStyles?: Hot.Style)
	{
		if (!inlineRuleSheet)
		{
			const style = Hot.style("inline-rule-sheet");
			document.head.append(style);
			inlineRuleSheet = style.sheet!;
		}
		
		const selector = typeof selectorOrStyles === "string" ? selectorOrStyles : "";
		const styles = maybeStyles || selectorOrStyles as Hot.Style;
		const cssClass = "c" + (index++);
		
		const selectorParts = selector.split("&");
		const selectorFinal = selectorParts.length === 1 ?
			"." + cssClass + selector :
			selectorParts.join("." + cssClass);
		
		const idx = inlineRuleSheet.insertRule(selectorFinal + "{}");
		const cssRule = inlineRuleSheet.cssRules.item(idx) as CSSStyleRule;
		
		for (let [propertyName, propertyValue] of Object.entries(styles))
		{
			if (typeof propertyValue === "string")
			{
				propertyName = propertyName.replace(
					/[A-Z]/g,
					(char: string) => "-" + char.toLowerCase());
				
				// The properties of inline rules are always important, because there
				// are no conceivable cases where they shouldn't override the inline styles.
				cssRule.style.setProperty(propertyName, propertyValue, "important");
			}
		}
		
		return cssClass;
	}
	
	let inlineRuleSheet: CSSStyleSheet | undefined;
	let index = 0;
	
	/** */
	function animation(animationName: string, style: Record<number, Hot.Style>)
	{
		if (animationsWritten.has(animationName))
			return;
		
		const css: string[] = [];
		
		for (const [keyframe, styles] of Object.entries(style))
		{
			css.push(keyframe + "% { ");
			
			for (const [propertyName, propertyValue] of Object.entries(styles))
				css.push(propertyName + ": " + propertyValue + ";");
			
			css.push(" } ");
		}
		
		const animationBody = css.join("");
		const fullCss  = ["@", "@-webkit-", "@-moz-"].map(s =>
			s + `keyframes ${animationName} { ${animationBody} }`).join("");
		
		const styleTag = Hot.style("animation-sheet", new Text(fullCss));
		styleTag.classList.add(animationName);
		document.head.append(styleTag);
		
		return { animationName };
	}
	const animationsWritten = new Set<string>();
}

namespace Hot
{
	/**
	 * Fake node class, which is compatible with the actual Node interface,
	 * but done with minimal properties in order to not negatively affect
	 * the quality of the autocompletion experience.
	 */
	export interface NodeLike
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
		name: string;
		id: string;
		class: string;
		contentEditable: string;
		tabIndex: number;
		data: Record<string, string | number | boolean>;
	}
	
	/** */
	export interface InputElementAttribute extends ElementAttribute
	{
		type: string;
		value: string;
		disabled: boolean;
		webkitdirectory: boolean;
		multiple: boolean;
		accept: string;
	}
	
	/** */
	export interface ImageElementAttribute extends ElementAttribute
	{
		src: string;
	}
	
	/** */
	export interface AnchorElementAttribute extends ElementAttribute
	{
		href: string;
		target: string;
	}
	
	/** */
	export interface VideoElementAttribute extends ElementAttribute
	{
		src: string;
		type: string;
		autoplay: boolean;
		loop: boolean;
		playsInline: boolean;
		controls: boolean;
		muted: boolean;
	}
	
	/** */
	export type Style = Partial<CSSStyleDeclaration>;
	
	/** */
	export type Closure = ((e: HTMLElement) => Param | Param[]);
	
	/** */
	export type Param<T = ElementAttribute> =
		// Single class name
		string |
		// Event connections
		Event |
		// Immediately invoked closure
		Closure |
		// Arrays of Params
		Param<T>[] |
		// Conditionals
		false | undefined | null | void |
		NodeLike |
		Style |
		Partial<T>;
	
	export declare function a(...params: Param<AnchorElementAttribute>[]): HTMLAnchorElement;
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
	export declare function i(...params: Param[]): HTMLElement;
	export declare function iframe(...params: Param[]): HTMLIFrameElement;
	export declare function img(...params: Param<ImageElementAttribute>[]): HTMLImageElement;
	export declare function input(...params: Param<InputElementAttribute>[]): HTMLInputElement;
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
	export declare function video(...params: Param<VideoElementAttribute>[]): HTMLVideoElement;
	export declare function wbr(...params: Param[]): HTMLElement;
	
	/** */
	export interface EventMap extends HTMLElementEventMap
	{
		"input": InputEvent;
	}
	
	/** */
	export declare function on<K extends keyof HTMLElementEventMap>(
		type: K,
		listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
		options?: boolean | EventListenerOptions): Event;
	/** */
	export declare function on<K extends keyof HTMLElementEventMap>(
		remoteTarget: Node | Window,
		type: K,
		listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
		options?: boolean | EventListenerOptions): Event;
	
	/** */
	export declare class Event
	{
		constructor(
			eventName: string,
			handler: (ev: Event) => void,
			options?: EventListenerOptions)
		
		private readonly undefined: undefined;
	}
	
	/** */
	export declare function css(selectorSuffix: string, properties: Hot.Style): string;
	export declare function css(properties: Hot.Style): string;
	
	/**
	 * 
	 */
	export declare function animation(name: string, style: Record<number, Hot.Style>): Hot.Style
	
	/**
	 * Creates a new Hot context from the specified Element or series of Elements.
	 */
	export declare function get<E extends Element>(e: E, ...others: Element[]): (...params: Param[]) => E;
	
	declare var module: any;
	if (typeof module === "object")
		Object.assign(module.exports, { Hot });
}
