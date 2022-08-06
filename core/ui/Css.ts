
namespace App
{
	/** */
	export function appendCss()
	{
		const css = [
			...createGeneralCss(),
			...createEditorCss()
		].join("");
		
		document.head.append(Htx.style(new Text(css)));
	}
	
	/** */
	export function createGeneralCssText(minify?: boolean)
	{
		const emitter = new Emitter(minify);
		const rules = createGeneralCss()
		
		for (const rule of rules)
			rule.emit(emitter);
		
		return emitter.toString();
	}
	
	/** */
	function createGeneralCss()
	{
		return [
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
			rule("HTML", {
				"background-color": "black",
				"color": "white",
				"font-size": "20px",
				"font-family": "-apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, roboto, noto, arial, sans-serif",
			}),
			
			// Player CSS
			
			rule("." + CssClass.story, {
				"scroll-snap-type": "y mandatory",
				"overflow-x": "hidden",
				"overflow-y": "auto",
				"height": "100vh",
			}),
			rule("." + CssClass.scene, {
				"min-height": "100%",
				"scroll-snap-align": "start",
			}),
			rule("." + CssClass.scene + " VIDEO", {
				"position": "absolute",
				"object-fit": "cover",
				"width": "100%",
				"height": "100%",
			}),
			rule("." + CssClass.snapFooter, {
				"scroll-snap-align": "end",
			}),
			rule("." + CssClass.captionScene, {
				"display": "flex",
			}),
			rule("." + CssClass.captionScene + ", ." + CssClass.proseScene, {
				"padding": "20px",
			}),
			rule("." + CssClass.captionSceneBackgroundImage, {
				"position": "absolute",
				"top": 0,
				"right": 0,
				"bottom": 0,
				"left": 0,
				"background-repeat": "no-repeat",
				"background-position": "50% 50%",
				"background-size": "cover",
			}),
			rule("." + CssClass.captionSceneForeground, {
				"display": "flex",
				"width": "100%",
				"min-height": "100%",
				"max-width": "1000px",
				"padding": ConstN.foregroundEdgeVmin + "vmin",
				"margin": "auto",
			}),
			rule("." + CssClass.captionSceneContentImage, {
				"display": "block",
				"margin": "0 auto 30px",
			}),
			rule("." + CssClass.galleryScene, {
				"height": "100%",
				"scroll-snap-type": "x mandatory",
				"overflow-x": "auto",
				"overflow-y": "hidden",
				"background-color": "black",
				"white-space": "nowrap",
			}),
			rule("." + CssClass.galleryFrame, {
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
				"top": "0",
				"right": "0",
				"bottom": "0",
				"left": "0",
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
			rule(`.${CssClass.proseScene} H1, .${CssClass.proseScene} H2`, {
				"font-size": "40px",
				"font-weight": "700",
			}),
			rule(`.${CssClass.proseScene} * + H1, .${CssClass.proseScene} * + H2`, {
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
				"top": "0",
				"right": "0",
				"bottom": "0",
				"left": "0",
				"z-index": "-1",
				"transform-origin": "50% 50%",
				"transform": "scaleX(3) scaleY(3.5)",
				"background-size": "100% 100%",
				"opacity": `var(${ConstS.textContrastProperty})`,
			}),
			rule("." + CssClass.textContrastDark + ":before", {
				"background-image": Util.createCssUrl("res.blur-black.png"),
			}),
			rule("." + CssClass.textContrastLight + ":before", {
				"background-image": Util.createCssUrl("res.blur-white.png"),
			}),
			rule("." + Origin.topLeft, {
				"text-align": "left",
				"align-items": "flex-start",
				"justify-content": "flex-start",
			}),
			rule("." + Origin.top, {
				"text-align": "center",
				"align-items": "flex-start",
				"justify-content": "center",
			}),
			rule("." + Origin.topRight, {
				"text-align": "right",
				"align-items": "flex-start",
				"justify-content": "flex-end",
			}),
			rule("." + Origin.left, {
				"text-align": "left",
				"align-items": "center",
				"justify-content": "flex-start",
			}),
			rule("." + Origin.center, {
				"text-align": "center",
				"align-items": "center",
				"justify-content": "center",
			}),
			rule("." + Origin.right, {
				"text-align": "right",
				"align-items": "center",
				"justify-content": "flex-end",
			}),
			rule("." + Origin.bottomLeft, {
				"text-align": "left",
				"align-items": "flex-end",
				"justify-content": "flex-start",
			}),
			rule("." + Origin.bottom, {
				"text-align": "center",
				"align-items": "flex-end",
				"justify-content": "center",
			}),
			rule("." + Origin.bottomRight, {
				"text-align": "right",
				"align-items": "flex-end",
				"justify-content": "flex-end",
			}),
		];
	}
	
	/**
	 * Creates the CSS that is used in both the editor as well as the player.
	 */
	function createEditorCss()
	{
		return [
			rule("HTML, BODY", {
				"margin": "0",
				"padding": "0",
				"height": "100%",
				"background-color": UI.darkGrayBackground,
				"color": "white",
			}),
			rule("*", {
				"outline": "0",
			}),
			rule("." + CssClass.hide, {
				display: "none !important",
			}),
			rule("." + CaptionedButtonClass.all, {
				"width": "30em",
				"display": "inline-block",
				"padding": "0.75em",
				"text-align": "center",
				"color": "black",
				"user-select": "none",
			}),
			rule("." + CaptionedButtonClass.pillOutline, {
				"border-radius": "100px",
				"border": "2px solid black",
			}),
			rule("." + CaptionedButtonClass.pillFilled, {
				"border-radius": "100px",
				"background-color": "black",
			}),
			rule("." + CaptionedButtonClass.roundedOutline, {
				"border-radius": "8px",
				"border": "2px solid black",
			}),
			rule("." + CaptionedButtonClass.roundedFilled, {
				"border-radius": "8px",
				"background-color": "black",
			}),
			rule("." + CaptionedButtonClass.squareOutline, {
				"border": "2px solid black",
			}),
			rule("." + CaptionedButtonClass.squareFilled, {
				"background-color": "black",
			}),
			rule("." + CssClass.postViewTransition, {
				"transform-origin": "0 0 ",
				"transform": "scale(0.33333)",
				"width": "300%",
				"z-index": "-1",
			}),
			
			rule("TRIX-TOOLBAR ", {
				
			})
		];
	}
	
	/** */
	function rule(selector: string, properties: { [property: string]: string | number; })
	{
		return new VirtualCssRule(selector, properties);
	}
	
	/** */
	class VirtualCssRule
	{
		constructor(
			readonly selector: string,
			readonly cssProperties: { [property: string]: string | number; })
		{ }
		
		/** */
		emit(emitter = new Emitter())
		{
			emitter.lines(this.selector, "{");
			emitter.indent();
			
			for (const [n, v] of Object.entries(this.cssProperties))
				emitter.line(n + ":" + emitter.space + v + ";");
			
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
