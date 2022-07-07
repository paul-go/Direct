
/** */
const enum CssClass
{
	dragOverScreen = "drag-over-screen",
	hide = "hide",
	proseContainer = "prose-container",
	appRoot = "app-root",
	
	// Player classes
	story = "story",
	scene = "scene",
	captionScene = "scene-caption",
	captionSceneBackgroundImage = "bg",
	captionSceneForeground = "fg",
	proseScene = "scene-prose",
	proseSceneForeground = "scene-prose-fg",
	galleryScene = "scene-gallery",
	galleryFrame = "frame",
	galleryFrameLegend = "frame-legend",
	videoScene = "scene-video",
	snapFooter = "snap-footer",
}

/** */
const enum CaptionedButtonClass
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
const enum DataAttributes
{
	transition = "t",
	textEffect = "e",
}

/** */
type SizeMethod = "cover" | "contain";

/** */
type ObjectLiteral<K extends keyof any, T> = { [P in K]: T; };
