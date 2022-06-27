
namespace Turf
{
	/** */
	export interface UserData
	{
		turfs: TurfData[];
		email: string;
		password: string;
		s3AccessKey: string;
		s3SecretKey: string;
	}
	
	/** */
	export interface TurfData
	{
		id: string;
		colorScheme: unknown;
		font: string;
		htmlHeader: string;
		htmlFooter: string;
		readonly patches: PatchData[];
	}
	
	/** */
	export interface PatchData
	{
		title: string;
		description: string;
		slug: string;
		htmlHeader: string;
		htmlFooter: string;
		readonly blades: BladeData[];
	}
	
	/** */
	export interface BladeData
	{
		transition: BladeTransition;
	}
	
	/** */
	export interface CaptionedBladeData extends BladeData
	{
		textContrast: number;
		textEffect: TextEffect;
		readonly titles: TitleData[];
		readonly paragraphs: ParagraphData[];
		readonly backgrounds: BackgroundData[];
	}
	
	/** */
	export interface TitleData extends BladeData
	{
		text: string;
		size: number;
		weight: number;
	}
	
	/** */
	export interface ParagraphData extends BladeData
	{
		text: string;
	}
	
	/** */
	export interface BackgroundData
	{
		mediaObject: string;
		crop: [number, number, number, number];
		position: [number, number];
	}
	
	/** */
	export interface ProseBladeData extends BladeData
	{
		html: string;
		backgroundColor: number;
	}
	
	/** */
	export interface VideoBladeData extends BladeData
	{
		style: "cover" | "contain";
		mediaObject: string;
	}
	
	/** */
	export interface GalleryBladeData extends BladeData
	{
		readonly items: GalleryItemData[];
	}
	
	/** */
	export interface GalleryItemData
	{
		captionLine1: string;
		captionLine2: string;
		textContrast: number;
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
