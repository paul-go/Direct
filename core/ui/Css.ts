
namespace Turf
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
	
	/**
	 * 
	 */
	export function createGeneralCss()
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
				"font-family": "-apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, roboto, noto, arial, sans-serif"
			}),
			
			// Player CSS
			
			rule("." + CssClass.story, {
				"scroll-snap-type": "y mandatory",
				"overflow-x": "hidden",
				"overflow-y": "auto",
				"height": "100%",
			}),
			rule("." + CssClass.scene, {
				"min-height": "100vh",
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
				"max-width": "1000px",
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
			rule("." + CssClass.proseScene + " H2", {
				"font-size": "40px",
				"font-weight": "700",
			}),
			rule("." + CssClass.proseScene + " * + H2", {
				"margin-top": "1.5em"
			}),
			rule("." + CssClass.proseScene, {
				"font-size": "20px",
				"line-height": "1.66",
			}),
			rule("." + CssClass.proseScene + " * + P", {
				"margin-top": "1em"
			}),
		];
	}
	
	/**
	 * Creates the CSS that is used in both the editor as well as the player.
	 */
	export function createEditorCss()
	{
		return [
			rule("HTML, BODY", {
				"margin": "0",
				"padding": "0",
				"height": "100%",
				"background-color": "black",
				"color": "white",
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
			rule("." + CssClass.patchViewTransition, {
				"transform-origin": "0 0 ",
				"transform": "scale(0.33333)",
				"width": "300%",
				"z-index": "-1",
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
		toString()
		{
			return this.selector +  "{" + 
				Object.entries(this.cssProperties)
					.map(([n, v]) => n + ":" + v)
					.join(";") +
			"}";
		}
	}
}
