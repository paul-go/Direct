
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
	fillerContentBlur = 40,
	appMaxWidth = 1000,
}

/** */
const enum CssClass
{
	// Editor classes
	dragOverScreen = "drag-over-screen",
	hide = "hide",
	appRoot = "app-root",
	blogView = "blog-view",
	postViewTransition = "post-view-transition",
	
	// Player classes
	story = "story",
	scene = "scene",
	attentionScene = "scene-attention",
	attentionSceneBackground = "bg",
	attentionSceneForeground = "fg",
	attentionSceneContentImage = "fg-content-image",
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
const enum AttentionButtonClass
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
type Literal<K extends keyof any, T> = { [P in K]: T; };
