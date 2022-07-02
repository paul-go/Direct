/// <reference path="Database.ts" />

namespace Turf
{
	/** */
	export class MetaRecord extends Record
	{
		static readonly table = "meta";
		static readonly type = 1;
		
		user = {} as IUser;
		colorScheme = "";
		font = "";
		htmlHeader = "";
		htmlFooter = "";
	}
	
	/** */
	export interface IUser
	{
		email: string;
		password: string;
		s3AccessKey: string;
		s3SecretKey: string;
	}
	
	/** */
	export class PatchRecord extends Record
	{
		static readonly table = "patches";
		static readonly type = 2;
		
		title = "";
		description = "";
		slug = "";
		htmlHeader = "";
		htmlFooter = "";
		draft = true;
		dateCreated = 0;
		datePublished = 0;
		readonly blades = this.arrayOf(BladeRecord);
	}
	
	/** */
	export abstract class BladeRecord extends Record
	{
		static readonly table = "blades";
		
		transition = BladeTransition.scroll;
	}
	
	/** */
	export class CaptionedBladeRecord extends BladeRecord
	{
		static readonly type = 3;
		
		textContrast = 0;
		textEffect = TextEffect.scrollAlignCenter;
		readonly titles: ITitle[] = [];
		readonly paragraphs: string[] = [];
		readonly backgrounds: IBackground[] = [];
	}
	
	/** */
	export interface ITitle
	{
		text: string;
		size: number;
		weight: number;
	}
	
	/** */
	export interface IBackground
	{
		mediaObject: string;
		crop: [number, number, number, number];
		position: [number, number];
	}
	
	/** */
	export class ProseBladeRecord extends BladeRecord
	{
		static readonly type = 4;
		
		html = "";
		backgroundColor = 0;
	}
	
	/** */
	export class VideoBladeRecord extends BladeRecord
	{
		static readonly type = 5;
		
		style: "cover" | "contain" = "cover";
		mediaObject = "";
	}
	
	/** */
	export class GalleryBladeRecord extends BladeRecord
	{
		static readonly type = 6;
		
		readonly items: IGalleryItem[] = [];
	}
	
	/** */
	export interface IGalleryItem
	{
		captionLine1: string;
		captionLine2: string;
		textContrast: number;
	}
	
	/** */
	export class MediaRecord extends Record
	{
		static readonly table = "media";
		static readonly type = 7;
		
		/**
		 * A friendly name for the media object.
		 * Typically the name of the file as it was sent in from the operating system.
		 */
		name = "";
		
		/**
		 * The mime type of the media object.
		 */
		type = MimeType.unknown;
		
		/** 
		 * A blob that stores the actual data of the media object.
		 */
		blob = new Blob();
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
		wipeTopLeft = "WipeTop",
		wipeTopRight = "WipeRight",
		wipeRight = "WipeRight",
		wipeLeft = "WipeLeft",
		wipeBottomLeft = "WipeBottom",
		wipeBottom = "WipeBottom",
		wipeBottomRight = "WipeLeft",
		wipeCircle = "WipeCircle",
		colorBars = "ColorBars",
	}
	
	/** */
	export function createDatabase(name: string)
	{
		return Turf.Database.new(name,
			Turf.MetaRecord,
			Turf.PatchRecord,
			Turf.CaptionedBladeRecord,
			Turf.ProseBladeRecord,
			Turf.VideoBladeRecord,
			Turf.GalleryBladeRecord,
			Turf.MediaRecord,
		);
	}
}
