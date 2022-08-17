
/** */
const enum ConstS
{
	baseFolderPrefix = "post-base-folder-",
	mainDatabaseName = "main",
	textContrastProperty = "--text-contrast",
	htmlFileName = "index.html",
	cssFileNameGeneral = "index.general.css",
	cssFileNameSpecific = "index.css",
	jsFileNamePlayer = "player.js",
	jsFileNamePlayerMin = "player.min.js",
	jsFileNameApp = "app.js",
	jsFileNameAppMin = "app.min.js",
	textContrastBlackName = "res.blur-black.png",
	textContrastWhiteName = "res.blur-white.png",
	debugExportsFolderName = "+exports",
	portableExtension = "zip",
	appName = "Direct",
}

/** */
const enum ConstN
{
	foregroundEdgeVmin = 4,
	descriptionFontWeight = 500,
	descriptionLineHeight = 1.5,
	fillerContentBlur = 40,
	appMaxWidth = 1000,
	playerMaxWidth = 1900,
}

/** */
const enum CssClass
{
	// Editor classes
	dragOverScreen = "drag-over-screen",
	hide = "hide",
	appContainer = "app-container",
	appContainerMaxed = "app-container-maxed",
	blogView = "blog-view",
	postViewTransition = "post-view-transition",
	
	// Player classes
	story = "story",
	scene = "scene",
	canvasScene = "scene-canvas",
	canvasSceneBackground = "bg",
	canvasSceneForeground = "fg",
	canvasSceneContentImage = "fg-content-image",
	canvasAction = "ca",
	canvasActionFilled = "ca-filled",
	canvasActionOutlined = "ca-outlined",
	proseScene = "scene-prose",
	proseSceneForeground = "scene-prose-fg",
	galleryScene = "scene-gallery",
	galleryFrame = "frame",
	galleryFrameLegend = "frame-legend",
	videoScene = "scene-video",
	snapFooter = "snap-footer",
	textContrast = "text-contrast",
	textContrastDark = "text-contrast-dark",
	textContrastLight = "text-contrast-light",
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
