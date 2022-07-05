
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
			rule(
				"." + CssClass.proseContainer + " H2:not(:first-child)," +
				"." + CssClass.proseContainer + " P:not(:first-child)", {
				"margin-top": "5vmin",
			}),
			rule("." + CssClass.proseContainer + " H2", {
				"font-size": "5vmin",
			}),
			rule("." + CssClass.proseContainer + " P", {
				"font-size": "3vmin"
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
		];
	}
	
	/**
	 * Creates the CSS that is used in both the editor as well as the player.
	 */
	export function createEditorCss()
	{
		return [
			rule("HTML, BODY", {
				height: "100%",
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
			rule("." + CssClass.proseContainer, {
				"padding": "50px",
			}),
			rule("." + CssClass.proseContainer + ":focus", {
				"outline": 0,
			}),
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
