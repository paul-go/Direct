
namespace Grassroots
{
	/** */
	export const enum CssClass
	{
		dragOverScreen = "drag-over-screen",
		hide = "hide",
	}
	
	/** */
	export const enum CaptionedButtonClass
	{
		all = "cb",
		pillOutline = "cb-po",
		pillFilled = "cb-pf",
		roundedOutline = "cb-ro",
		roundedFilled = "cb-rf",
		squareOutline = "cb-so",
		squareFilled = "cb-sf",
	}
	
	/** */
	export function installCss()
	{
		document.head.append(Htx.style(new Text(createCss())));
	}
	
	/**
	 * Creates the CSS that is used in both the editor as well as the player.
	 */
	export function createCss()
	{
		const css = `
			*
			{
				position: relative;
				margin: 0;
				padding: 0;
				z-index: 0;
				box-sizing: border-box;
				-webkit-margin-collapse: separate;
				-webkit-font-smoothing: antialiased;
				font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, roboto, noto, arial, sans-serif;
			}
			HTML, BODY
			{
				height: 100%;
			}
			.${CssClass.hide}
			{
				display: none !important;
			}
			.${CaptionedButtonClass.all}
			{
				width: 30em;
				display: inline-block;
				padding: 0.75em;
				text-align: center;
				color: black;
				user-select: none;
			}
			.${CaptionedButtonClass.pillOutline}
			{
				border-radius: 100px;
				border: 2px solid black;
			}
			.${CaptionedButtonClass.pillFilled}
			{
				border-radius: 100px;
				background-color: black;
			}
			.${CaptionedButtonClass.roundedOutline}
			{
				border-radius: 8px;
				border: 2px solid black;
			}
			.${CaptionedButtonClass.roundedFilled}
			{
				border-radius: 8px;
				background-color: black;
			}
			.${CaptionedButtonClass.squareOutline}
			{
				border: 2px solid black;
			}
			.${CaptionedButtonClass.squareFilled}
			{
				background-color: black;
			}
		`;
		
		return css;
	}
}
