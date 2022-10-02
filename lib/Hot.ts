
/**
 * This is a necessary CSS property that appears to be missing from the
 * standard set of type definitions. This should be removed this once this 
 * is added upstream.
 */
interface CSSStyleDeclaration
{
	backdropFilter: string;
	webkitBackdropFilter: string;
	scrollbarWidth: string;
	msOverflowStyle: string;
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
	function get(...elements: (Element | Hot.HatLike)[])
	{
		return (...params: Hot.Param[]) =>
		{
			for (const e of elements)
			{
				if (e instanceof Element)
					apply(e, params);
				
				else if ((e as Hot.HatLike).head instanceof HTMLElement)
					apply((e as Hot.HatLike).head, params);
			}
			
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
		
		// CAUTION: This code is *very* performance sensitive. It uses
		// constructor checks instead of instanceof and typeof in an effort
		// to squeeze out maximum performance. Be careful of changing
		// this code without  having full knowledge of what you're doing.
		for (let i = -1, length = params.length; ++i < length;)
		{
			const param = params[i];
			if (!param)
				continue;
			
			if (param instanceof Node)
			{
				e.append(param);
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
				break; case Sheet:
				{
					e.classList.add((param as Sheet).class);
				}
				break; case Object:
				{
					const el = e as any;
					
					for (const [name, value] of Object.entries(param))
					{
						// JavaScript numbers that are specified in the width and height properties
						// are injected as HTML attributes rather than assigned as CSS properties.
						if (value && 
							(name === "width" || name === "height") &&
							typeof value === "number")
						{
							e.setAttribute(name, value.toString());
						}
						else if (name === "data")
						{
							for (const [attrName, attrValue] of Object.entries(value || {}))
								e.setAttribute("data-" + attrName, String(attrValue));
						}
						// Width, height, and background properties are special cased.
						// They are interpreted as CSS properties rather
						// than HTML attributes.
						else if (name in e && 
							name !== "background" && 
							name !== "width" && 
							name !== "height")
							el[name] = value;
						
						else if (cssPropertySet.has(name))
							setProperty(el, name, value);
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
				// Ugly, but high-performance way to check if the param is a Hat
				// (meaning, an object with a .head HTMLElement property) coming 
				// from the Hat library.
				default: if (!!(param as any).head && (param as any).head.ELEMENT_NODE === 1)
				{
					apply(e, [(param as any).head]);
				}
			}
		}
		
		return e;
	}
	
	let cssPropertySet: Set<string> | null = null;
	
	/** */
	class Sheet
	{
		/** */
		constructor(
			className: string,
			readonly cssRules: readonly CSSStyleRule[])
		{
			this.class = className;
		}
		
		readonly class: string = "";
	}
	
	/** */
	function css(...components: (string | Hot.Style)[])
	{
		if (!inlineRuleSheet)
		{
			const style = Hot.style("inline-rule-sheet");
			document.head.append(style);
			inlineRuleSheet = style.sheet!;
		}
		
		const groups: { selector: string, styles: Hot.Style[] }[] = [{ selector: "", styles: [] }];
		
		for (let i = -1; ++i < components.length;)
		{
			const cur = components[i];
			const last = i > 0 && components[i - 1];
			
			if (typeof cur === "string" && typeof last === "object")
				groups.push({ selector: "", styles: [] });
				
			const group = groups[groups.length - 1];
			
			if (typeof cur === "string")
				group.selector += cur;
			else
				group.styles.push(cur);
		}
		
		const cssClass = "c" + (index++);
		const cssRules: CSSStyleRule[] = [];
		
		for (const group of groups)
		{
			const selectorParts = group.selector.split("&");
			const [selector] = trimImportant(
				selectorParts.length === 1 ?
					"." + cssClass + group.selector :
					selectorParts.join("." + cssClass));
			
			const idx = inlineRuleSheet.insertRule(selector + "{}");
			const cssRule = inlineRuleSheet.cssRules.item(idx) as CSSStyleRule;
			cssRules.push(cssRule);
			
			for (const stylesObject of group.styles)
			{
				for (let [n, v] of Object.entries(stylesObject))
				{
					if (typeof v === "number")
						v = String(v || 0);
					
					if (typeof v === "string")
						setProperty(cssRule, n, v, selector);
				}
			}
		}
		
		return new Sheet(cssClass, cssRules);
	}
	
	/** */
	function setProperty(
		styleable: { style: CSSStyleDeclaration },
		property: string,
		value: string | number,
		selectorOfContainingRule = "")
	{
		const [, selectorImportant] = trimImportant(selectorOfContainingRule);
		const [v, valueImportant] = trimImportant(String(value));
		const n = property.replace(/[A-Z]/g, char => "-" + char.toLowerCase());
		styleable.style.setProperty(n, v, selectorImportant || valueImportant);
	}
	
	/** */
	function trimImportant(str: string): [string, string | undefined]
	{
		if (str.slice(-1) === "!")
			str = str.slice(0, -1);
		
		else if (str.slice(-10) === "!important")
			str = str.slice(0, -10);
		
		else return [str, undefined];
		
		return [str, "important"];
	}
	
	let inlineRuleSheet: CSSStyleSheet | undefined;
	let index = 0;
	
	/** */
	function animation(animationName: string, style: Record<number, Hot.Style>)
	{
		if (animationsWritten.includes(animationName))
			return { animationName };
		
		animationsWritten.push(animationName);
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
	const animationsWritten: string[] = [];
}

namespace Hot
{
	/** */
	export type Param<T = ElementAttribute> =
		// Single class name
		string |
		// Event connections
		Event |
		// Immediately invoked closure
		Closure |
		// Mini CSS style sheet, contains a small group of rules
		Sheet |
		// Arrays of Params
		Param<T>[] |
		// Conditionals
		false | undefined | null | void |
		NodeLike |
		Style |
		Partial<T> |
		HatLike;
	
	/** */
	export type Closure = ((e: HTMLElement) => Param | Param[]);
	
	/** */
	export type HatLike = { readonly head: HTMLElement; };
	
	/**
	 * Creates a new Hot context from the specified Element or series of Elements.
	 */
	export declare function get<T extends Element | HatLike>(
		e: T, ...others: Element[]
	): (...params: Param[]) => T;
	
	//# Style Related Typings
	
	/**
	 * 
	 */
	export type NumericStyleDeclaration = {
		animationDelay: string | 0;
		animationDuration: string | 0;
		animationIterationCount: string | 0;
		backgroundPositionX: string | 0;
		backgroundPositionY: string | 0;
		blockSize: string | 0;
		border: string | 0;
		borderBlock: string | 0;
		borderBlockEnd: string | 0;
		borderBlockEndWidth: string | 0;
		borderBlockStart: string | 0;
		borderBlockStartWidth: string | 0;
		borderBlockWidth: string | 0;
		borderBottom: string | 0;
		borderBottomLeftRadius: string | 0;
		borderBottomRightRadius: string | 0;
		borderBottomWidth: string | 0;
		borderEndEndRadius: string | 0;
		borderEndStartRadius: string | 0;
		borderInline: string | 0;
		borderInlineEnd: string | 0;
		borderInlineEndWidth: string | 0;
		borderInlineStart: string | 0;
		borderInlineStartWidth: string | 0;
		borderInlineWidth: string | 0;
		borderLeft: string | 0;
		borderLeftWidth: string | 0;
		borderRadius: string | 0;
		borderRight: string | 0;
		borderRightWidth: string | 0;
		borderSpacing: string | 0;
		borderStartEndRadius: string | 0;
		borderStartStartRadius: string | 0;
		borderTop: string | 0;
		borderTopLeftRadius: string | 0;
		borderTopRightRadius: string | 0;
		borderTopWidth: string | 0;
		borderWidth: string | 0;
		bottom: string | 0;
		columnCount: string | number;
		columnGap: string | 0;
		columnRuleWidth: string | 0;
		columnSpan: string | 0;
		columnWidth: string | 0;
		columns: string | number;
		flexGrow: string | number;
		flexShrink: string | number;
		fontSize: string | 0;
		fontSizeAdjust: string | 0;
		fontWeight: string | number;
		gridAutoColumns: string | 0;
		gridColumn: string | number;
		gridColumnEnd: string | number;
		gridColumnGap: string | 0;
		gridColumnStart: string | number;
		gridRow: string | number;
		gridRowEnd: string | number;
		gridRowStart: string | number;
		gridTemplate: string | 0;
		gridTemplateAreas: string | 0;
		gridTemplateColumns: string | 0;
		gridTemplateRows: string | 0;
		height: string | number;
		inlineSize: string | 0;
		inset: string | 0;
		insetBlock: string | 0;
		insetBlockEnd: string | 0;
		insetBlockStart: string | 0;
		insetInline: string | 0;
		insetInlineEnd: string | 0;
		insetInlineStart: string | 0;
		left: string | 0;
		letterSpacing: string | 0;
		lineHeight: string | number;
		margin: string | 0;
		marginBlock: string | 0;
		marginBlockEnd: string | 0;
		marginBlockStart: string | 0;
		marginBottom: string | 0;
		marginInline: string | 0;
		marginInlineEnd: string | 0;
		marginInlineStart: string | 0;
		marginLeft: string | 0;
		marginRight: string | 0;
		marginTop: string | 0;
		maxBlockSize: string | 0;
		maxHeight: string | 0;
		maxInlineSize: string | 0;
		maxWidth: string | 0;
		minBlockSize: string | 0;
		minHeight: string | 0;
		minInlineSize: string | 0;
		minWidth: string | 0;
		offset: string | 0;
		offsetDistance: string | 0;
		offsetPath: string | 0;
		offsetRotate: string | 0;
		opacity: string | number;
		order: string | number;
		outline: string | 0;
		outlineOffset: string | 0;
		outlineWidth: string | 0;
		padding: string | 0;
		paddingBlock: string | 0;
		paddingBlockEnd: string | 0;
		paddingBlockStart: string | 0;
		paddingBottom: string | 0;
		paddingInline: string | 0;
		paddingInlineEnd: string | 0;
		paddingInlineStart: string | 0;
		paddingLeft: string | 0;
		paddingRight: string | 0;
		paddingTop: string | 0;
		paintOrder: string | 0;
		right: string | 0;
		rowGap: string | 0;
		scale: string | 0;
		scrollMargin: string | 0;
		scrollMarginBlock: string | 0;
		scrollMarginBlockEnd: string | 0;
		scrollMarginBlockStart: string | 0;
		scrollMarginBottom: string | 0;
		scrollMarginInline: string | 0;
		scrollMarginInlineEnd: string | 0;
		scrollMarginInlineStart: string | 0;
		scrollMarginLeft: string | 0;
		scrollMarginRight: string | 0;
		scrollMarginTop: string | 0;
		scrollPadding: string | 0;
		scrollPaddingBlock: string | 0;
		scrollPaddingBlockEnd: string | 0;
		scrollPaddingBlockStart: string | 0;
		scrollPaddingBottom: string | 0;
		scrollPaddingInline: string | 0;
		scrollPaddingInlineEnd: string | 0;
		scrollPaddingInlineStart: string | 0;
		scrollPaddingLeft: string | 0;
		scrollPaddingRight: string | 0;
		scrollPaddingTop: string | 0;
		tabSize: string | 0;
		textIndent: string | 0;
		top: string | 0;
		transitionDelay: string | 0;
		transitionDuration: string | 0;
		width: string | number;
		wordSpacing: string | 0;
		zIndex: string | number;
	};
	
	/** */
	export type Style = {
		[P in keyof CSSStyleDeclaration]?: P extends keyof NumericStyleDeclaration ? 
			NumericStyleDeclaration[P] : 
			CSSStyleDeclaration[P]
	};
	
	/** */
	export declare class Sheet
	{
		constructor(
			className: string,
			cssRules: readonly CSSStyleRule[])
		
		readonly class: string;
		readonly cssRules: readonly CSSStyleRule[];
		private readonly private: undefined;
	}
	
	/** */
	export declare function css(...components: (string | Hot.Style)[]): Sheet;
	
	/**
	 * 
	 */
	export declare function animation(name: string, style: Record<number, Hot.Style>): Hot.Style
	
	//# Event Related Typings
	
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
		
		private readonly private: undefined;
	}
	
	//# Element Related Typings
	
	/**
	 * Fake node class, which is compatible with the actual Node interface,
	 * but done with minimal properties in order to not negatively affect
	 * the quality of the autocompletion experience.
	 */
	export interface NodeLike
	{
		readonly DOCUMENT_TYPE_NODE: number;
	}
	
	/** */
	export interface ElementAttribute
	{
		name: string;
		id: string;
		class: string;
		style: string;
		contentEditable: boolean | string;
		tabIndex: number;
		data: Record<string, string | number | boolean>;
	}
	
	/** */
	export interface BaseElementAttribute extends ElementAttribute
	{
		href: string;
	}
	
	/** */
	export interface MetaElementAttribute extends ElementAttribute
	{
		content: string;
	}
	
	/** */
	export interface LinkElementAttribute extends ElementAttribute
	{
		rel: string;
		type: string;
		href: string;
		media: string;
	}
	
	/** */
	export interface ScriptElementAttribute extends ElementAttribute
	{
		type: string;
		src: string;
		defer: boolean;
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
	
	export declare function a(...params: Param<AnchorElementAttribute>[]): HTMLAnchorElement;
	export declare function abbr(...params: Param[]): HTMLElement;
	export declare function address(...params: Param[]): HTMLElement;
	export declare function area(...params: Param[]): HTMLAreaElement;
	export declare function article(...params: Param[]): HTMLElement;
	export declare function aside(...params: Param[]): HTMLElement;
	export declare function audio(...params: Param[]): HTMLAudioElement;
	export declare function b(...params: Param[]): HTMLElement;
	export declare function base(...params: Param<BaseElementAttribute>[]): HTMLBaseElement;
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
	export declare function link(...params: Param<LinkElementAttribute>[]): HTMLLinkElement;
	export declare function main(...params: Param[]): HTMLElement;
	export declare function map(...params: Param[]): HTMLMapElement;
	export declare function mark(...params: Param[]): HTMLElement;
	export declare function marquee(...params: Param[]): HTMLMarqueeElement;
	export declare function menu(...params: Param[]): HTMLMenuElement;
	export declare function meta(...params: Param<MetaElementAttribute>[]): HTMLMetaElement;
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
	export declare function script(...params: Param<ScriptElementAttribute>[]): HTMLScriptElement;
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
	
	// CommonJS compatibility
	declare var module: any;
	if (typeof module === "object")
		Object.assign(module.exports, { Hot });
}
