
namespace App.Css
{
	/** */
	export function append()
	{
		const css = [
			...createGeneralCss(),
			...createEditorCss(),
		].join("");
		
		document.head.append(Hot.style(
			"general-css",
			"editor-css",
			new Text(css)));
	}
	
	/** */
	export function createGeneral(minify?: boolean)
	{
		const emitter = new Emitter(minify);
		const rules = createGeneralCss();
		
		for (const rule of rules)
			rule.emit(emitter);
		
		return emitter.toString();
	}
	
	/** */
	function createGeneralCss()
	{
		return [
			...createFontsCss(),
			rule("*", {
				"position": "relative",
				"margin": 0,
				"padding": 0,
				"z-index": 0,
				"box-sizing": "border-box",
				"-webkit-margin-collapse": "separate",
				"-webkit-font-smoothing": "antialiased",
				"color": "inherit",
				"font-size": "inherit",
			}),
			rule(":root", {
				"background-color": "black",
				"color": "white",
				"font-size": "20px",
				"font-family": "Inter, -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, roboto, noto, arial, sans-serif"
			}),
			
			// Player CSS
			
			rule("." + CssClass.scene + " VIDEO", {
				"position": "absolute",
				"object-fit": "cover",
				"width": "100%",
				"height": "100%",
			}),
			rule("." + CssClass.canvasScene + ", ." + CssClass.proseScene, {
				"padding": "20px",
			}),
			rule("." + CssClass.canvasScene + " P", {
				"font-weight": ConstN.descriptionFontWeight,
				"line-height": ConstN.descriptionLineHeight,
			}),
			rule("." + CssClass.canvasSceneBackground, {
				"position": "absolute",
				"top": 0,
				"right": 0,
				"bottom": 0,
				"left": 0,
				"background-repeat": "no-repeat",
				"background-position": "50% 50%",
				"background-size": "cover",
			}),
			rule("." + CssClass.canvasSceneForeground, {
				"position": "absolute",
				"top": ConstN.foregroundEdgeVmin + "vmin",
				"right": ConstN.foregroundEdgeVmin + "vmin",
				"bottom": ConstN.foregroundEdgeVmin + "vmin",
				"left": ConstN.foregroundEdgeVmin + "vmin",
				"max-width": ConstN.playerMaxWidth + "px",
				"margin": "auto",
			}),
			
			rule("." + CssClass.canvasSceneIsland, {
				"position": "absolute",
				"width": "fit-content",
				"height": "fit-content",
			}),
			
			rule("." + Origin.topLeft, {
				"text-align": "left",
				"top": 0,
				"left": 0,
			}),
			rule("." + Origin.top, {
				"text-align": "center",
				"top": 0,
				"right": 0,
				"left": 0,
				"margin": "auto",
			}),
			rule("." + Origin.topRight, {
				"text-align": "right",
				"top": 0,
				"right": 0,
			}),
			rule("." + Origin.left, {
				"text-align": "left",
				"top": 0,
				"bottom": 0,
				"left": 0,
				"margin": "auto",
			}),
			rule("." + Origin.center, {
				"text-align": "center",
				"top": 0,
				"right": 0,
				"bottom": 0,
				"left": 0,
				"margin": "auto",
			}),
			rule("." + Origin.right, {
				"text-align": "right",
				"top": 0,
				"right": 0,
				"bottom": 0,
				"margin": "auto",
			}),
			rule("." + Origin.bottomLeft, {
				"text-align": "left",
				"bottom": 0,
				"left": 0,
			}),
			rule("." + Origin.bottom, {
				"text-align": "center",
				"right": 0,
				"bottom": 0,
				"left": 0,
				"margin": "auto",
			}),
			rule("." + Origin.bottomRight, {
				"text-align": "right",
				"right": 0,
				"bottom": 0,
			}),
			rule(`
				.${CssClass.canvasSceneIsland}.${Origin.topLeft},
				.${CssClass.canvasSceneIsland}.${Origin.left},
				.${CssClass.canvasSceneIsland}.${Origin.bottomLeft}`, {
				"margin-left": 0,
				"margin-right": 0,
			}),
			rule(`
				.${CssClass.canvasSceneIsland}.${Origin.topRight},
				.${CssClass.canvasSceneIsland}.${Origin.right},
				.${CssClass.canvasSceneIsland}.${Origin.bottomRight}`, {
				"margin-left": "auto",
				"margin-right": 0,
			}),
			rule(`
				.${Origin.topLeft} .${CssClass.canvasActions},
				.${Origin.left} .${CssClass.canvasActions},
				.${Origin.bottomLeft} .${CssClass.canvasActions}`, {
				"left": "-0.5em",
			}),
			rule(`
				.${Origin.top} .${CssClass.canvasActions},
				.${Origin.center} .${CssClass.canvasActions},
				.${Origin.bottom} .${CssClass.canvasActions}`, {
				"margin-left": "auto",
				"margin-right": "auto",
			}),
			rule(`
				.${Origin.topRight} .${CssClass.canvasActions},
				.${Origin.right} .${CssClass.canvasActions},
				.${Origin.bottomRight} .${CssClass.canvasActions}`, {
				"right": "-0.5em",
			}),
			
			rule("." + CssClass.canvasSceneContentImage, {
				"display": "block",
				"margin": "0 auto 30px",
			}),
			rule("." + CssClass.canvasAction, {
				"min-width": "10em",
				"margin-top": "20px",
				"padding": "10px 30px",
				"display": "block",
				"backdrop-filter": "blur(15px)",
				"-webkit-backdrop-blur": "blur(15px)",
				"user-select": "none",
				"text-align": "center",
				"font-weight": 700,
				"font-size": "25px",
				"line-height": ConstN.descriptionLineHeight,
				"text-decoration": "none",
			}),
			rule("." + CssClass.canvasActionFilled, {
				"background-color": "white",
			}),
			rule("." + CssClass.canvasActionOutlined, {
				"border": "3px solid white",
			}),
			rule("." + CanvasActionShape.round, {
				"border-radius": "1000px",
			}),
			rule("." + CanvasActionShape.box, {
				"border-radius": UI.borderRadius.default,
			}),
			rule("." + CssClass.galleryScene, {
				"height": "100%",
				"scroll-snap-type": "x mandatory",
				"overflow-x": ["auto", "overlay"],
				"overflow-y": "hidden",
				"background-color": "black",
				"white-space": "nowrap",
			}),
			rule("." + CssClass.galleryFrame, {
				"overflow": "hidden",
				"display": "inline-block",
				"scroll-snap-align": "start",
				"scroll-snap-stop": "always",
				"width": "100%",
				"height": "100%",
			}),
			rule("." + CssClass.galleryFrame + " IMG", {
				"position": "absolute",
				"top": 0,
				"left": 0,
				"width": "100%",
				"height": "100%",
				"object-fit": "contain",
			}),
			rule("." + CssClass.galleryFrameLegend, {
				"position": "absolute",
				"top": 0,
				"right": 0,
				"bottom": 0,
				"left": 0,
				"display": "flex",
				"flex-direction": "column",
				"justify-content": "flex-end",
				"margin": "auto",
				"padding": "2vmin",
				"max-width": "-webkit-fill-available",
				"max-height": "-webkit-fill-available",
				"pointer-events": "none",
				"text-align": "right",
			}),
			rule("." + CssClass.galleryFrameLegend + " P", {
				"text-align": "right",
				"font-size": UI.vsize(4),
				"pointer-events": "all",
			}),
			rule("." + CssClass.galleryFrameLegend + " :first-child", {
				"font-weight": 700
			}),
			rule("." + CssClass.galleryFrameLegend + " :last-child", {
				"margin-top": "0.25em",
				"font-weight": 400
			}),
			rule("." + CssClass.proseScene, {
				"display": "flex",
				"align-content": "center",
				"align-items": "center",
			}),
			rule("." + CssClass.proseSceneForeground, {
				"margin": "auto",
				"width": "100%",
				"max-width": "800px",
				"padding-top": "12vmin",
				"padding-bottom": "33vmin",
			}),
			rule(`.${CssClass.proseScene} H1`, {
				"font-size": "40px",
				"font-weight": "700",
			}),
			rule(`.${CssClass.proseScene} * + H1`, {
				"margin-top": "1.5em"
			}),
			rule("." + CssClass.proseScene, {
				"font-size": "20px",
				"line-height": "1.66",
			}),
			rule("." + CssClass.proseScene + " * + P", {
				"margin-top": "1em"
			}),
			rule("." + CssClass.textContrast + ":before", {
				"content": `""`,
				"position": "absolute",
				"top": 0,
				"right": 0,
				"bottom": 0,
				"left": 0,
				"z-index": "-1",
				"transform-origin": "50% 50%",
				"transform": "scaleX(3) scaleY(3.5)",
				"background-size": "100% 100%",
				"opacity": `var(${ConstS.contrastProperty})`,
			}),
			rule("." + CssClass.textContrastDark + ":before", {
				"background-image": `url(${CssDataUris.blurBlack})`,
			}),
			rule("." + CssClass.textContrastLight + ":before", {
				"background-image": `url(${CssDataUris.blurWhite})`,
			}),
			rule("." + CssClass.inheritMargin, {
				"margin-left": "inherit",
				"margin-right": "inherit",
			}),
		];
	}
	
	/**
	 * Emits the CSS font-face declarations, which is used on the web.
	 */
	function createFontsCss()
	{
		const createVarFont = (fileName: string, unicodeRange: string) =>
		{
			return rule("@font-face", {
				"font-family": "Inter",
				"font-style": "normal",
				"font-weight": "100 900",
				"font-display": "swap",
				"src": `url(${fileName}) format('woff2')`,
				"unicode-range": unicodeRange,
			});
		};
		
		return [
			/* cyrillic-ext */
			createVarFont(
				"inter-UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7W0Q5n-wU.woff2", 
				"U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F"),
			
			/* cyrillic */
			createVarFont(
				"inter-UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa0ZL7W0Q5n-wU.woff2", 
				"U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116"),
			
			/* greek-ext */
			createVarFont(
				"inter-UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2ZL7W0Q5n-wU.woff2", 
				"U+1F00-1FFF"),
			
			/* greek */
			createVarFont(
				"inter-UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1pL7W0Q5n-wU.woff2", 
				"U+0370-03FF"),
			
			/* vietnamese */
			createVarFont(
				"inter-UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2pL7W0Q5n-wU.woff2", 
				"U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB"),
			
			/* latin-ext */
			createVarFont(
				"inter-UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa25L7W0Q5n-wU.woff2", 
				"U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF"),
			
			/* latin */
			createVarFont(
				"inter-UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2", 
				"U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"),
		];
	}
	
	/**
	 * Creates the CSS that is used in both the editor as well as the player.
	 */
	function createEditorCss()
	{
		return [
			rule("HTML, BODY", {
				"margin": 0,
				"padding": 0,
				"height": "100%",
				"background-color": UI.darkGrayBackground,
				"color": "white",
			}),
			rule("*", {
				"outline": 0,
			}),
			rule("." + CssClass.hide, {
				display: "none !important",
			}),
			
			rule("." + CssClass.postHatTransition, {
				"transform-origin": "0 0 ",
				"transform": "scale(0.33333)",
				"width": "300%",
				"z-index": "-1",
			}),
		];
	}
	
	/** */
	export function media(
		query: string,
		rules: { [selector: string]:  { [property: string]: string | string[] | number; } })
	{
		const vRules = Object.entries(rules)
			.map(([selector, properties]) => new VirtualCssRule(selector, properties));
		
		return new VirtualCssMediaQuery(query, vRules);
	}
	
	/** */
	export class VirtualCssMediaQuery
	{
		/** */
		constructor(
			readonly query: string,
			readonly rules: VirtualCssRule[])
		{ }
		
		/** */
		emit(emitter = new Emitter())
		{
			emitter.lines(`@media (${this.query}) {`);
			emitter.indent();
			
			for (const rule of this.rules)
				rule.emit(emitter);
			
			emitter.outdent();
			emitter.line("}");
		}
		
		/** */
		toString()
		{
			const em = new Emitter(true);
			this.emit(em);
			return em.toString();
		}
	}
	
	/** */
	export function rule(selector: string, properties: { [property: string]: string | string[] | number; })
	{
		return new VirtualCssRule(selector, properties);
	}
	
	/** */
	export class VirtualCssRule
	{
		constructor(
			readonly selector: string,
			readonly cssProperties: { [property: string]: string | string[] | number; })
		{
			this.selector = selector.replace(/[\r\n]/g, " ").replace(/\s\s*\s/g, " ");
		}
		
		/** */
		emit(emitter = new Emitter())
		{
			emitter.lines(this.selector, "{");
			emitter.indent();
			
			for (const [n, v] of Object.entries(this.cssProperties))
			{
				if (!Array.isArray(v))
					emitter.line(n + ":" + emitter.space + v + ";");
				
				else for (const value of v)
					emitter.line(n + ":" + emitter.space + value + ";");
			}
			
			emitter.outdent();
			emitter.line("}");
		}
		
		/** */
		toString()
		{
			const em = new Emitter(true);
			this.emit(em);
			return em.toString();
		}
	}
}
