
/** */
declare const enum CssClass
{
	// Editor classes
	dragOverScreen = "drag-over-screen",
	hide = "hide",
	appContainer = "app-container",
	appContainerMaxed = "app-container-maxed",
	blogHat = "blog-hat",
	postHatTransition = "post-hat-transition",
	
	// Player classes
	story = "story",
	scene = "scene",
	canvasScene = "scene-canvas",
	canvasSceneBackground = "canvas-bg",
	canvasSceneForeground = "canvas-fg",
	canvasSceneIsland = "island",
	canvasSceneIslandInner = "island-inner",
	canvasSceneContentImage = "fg-content-image",
	canvasActions = "c-actions",
	canvasAction = "ca",
	canvasActionFilled = "ca-filled",
	canvasActionOutlined = "ca-outlined",
	proseScene = "scene-prose",
	proseSceneForeground = "scene-prose-fg",
	galleryScene = "scene-gallery",
	galleryFrame = "frame",
	galleryFrameLegend = "frame-legend",
	videoScene = "scene-video",
	textContrast = "text-contrast",
	textContrastDark = "text-contrast-dark",
	textContrastLight = "text-contrast-light",
	inheritMargin = "inherit-margin",
}

/** */
enum Origin
{
	topLeft = "origin-tl",
	top = "origin-t",
	topRight = "origin-tr",
	left = "origin-l",
	center = "origin-c",
	right = "origin-r",
	bottomLeft = "origin-bl",
	bottom = "origin-b",
	bottomRight = "origin-br",
}

/** */
const enum CanvasActionShape
{
	box = "ca-box",
	round = "ca-round",
}

/** */
const enum CanvasButtonStyle
{
	all = "cb",
	pillOutline = "cb-po",
	pillFilled = "cb-pf",
	roundedOutline = "cb-ro",
	roundedFilled = "cb-rf",
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
type Literal<K extends keyof any, T> = { [P in K]: T; };
