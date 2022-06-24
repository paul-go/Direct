/// <reference path="../../lib/Back.ts" />

namespace Grassroots
{
	/** */
	export class UserData extends Back.Instance
	{
		turfs = new Back.Array<TurfData>();
		email = "";
		password = "";
		s3AccessKey = "";
		s3SecretKey = "";
	}
	
	/** */
	export class TurfData extends Back.Instance
	{
		colorScheme: unknown;
		font = "";
		htmlHeader = "";
		htmlFooter = "";
		readonly patches = new Back.Array<PatchData>();
	}
	
	/** */
	export class PatchData
	{
		title = "";
		description = "";
		slug = "";
		htmlHeader = "";
		htmlFooter = "";
		readonly blades = new Back.Array<BladeData>();
	}
	
	/** */
	export class BladeData extends Back.Instance
	{
		transition = BladeTransition.scroll;
	}
	
	/** */
	export class CaptionedBladeData extends BladeData
	{
		textContrast = 0;
		textEffect = TextEffect.scrollAlignCenter;
		readonly titles = new Back.Array<TitleData>();
		readonly paragraphs = new Back.Array<ParagraphData>();
		readonly backgrounds = new Back.Array<BackgroundData>();
	}
	
	/** */
	export class TitleData extends BladeData
	{
		text = "";
		size = 0;
		weight = 0;
	}
	
	/** */
	export class ParagraphData extends BladeData
	{
		text = "";
	}
	
	/** */
	export class BackgroundData
	{
		mediaObject = "";
		crop: [number, number, number, number] = [0, 0, 0, 0];
		position: [number, number] = [0, 0];
	}
	
	/** */
	export class ProseBladeData extends BladeData
	{
		html = "";
		backgroundColor = 0;
	}
	
	/** */
	export class VideoBladeData extends BladeData
	{
		style: "cover" | "contain" = "cover";
		mediaObject = "";
	}
	
	/** */
	export class GalleryBladeData extends BladeData
	{
		readonly items = new Back.Array<GalleryItemData>();
	}
	
	/** */
	export class GalleryItemData
	{
		captionLine1 = "";
		captionLine2 = "";
		textContrast = 0;
	}
	
	/** */
	export const enum TextEffect
	{
		scrollAlignTopLeft,
		scrollAlignTop,
		scrollAlignTopRight,
		scrollAlignLeft,
		scrollAlignCenter,
		scrollAlignRight,
		scrollAlignBottomLeft,
		scrollAlignBottom,
		scrollAlignBottomRight,
		zoomBlur,
		zoomExpand,
		zoomBlurExpand,
	}
	
	/** */
	export const enum BladeTransition
	{
		scroll = "Scroll",
		cross = "Cross",
		black = "Black",
		brightness = "Brightness",
		flash = "Flash",
	}
}
