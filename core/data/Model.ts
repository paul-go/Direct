/// <reference path="Database.ts" />

namespace Turf
{
	/** */
	export class MetaRecord extends Record
	{
		static readonly table = "meta";
		static readonly type = 1;
		
		user = {} as IUser;
		colorScheme: UI.IColor[] = [];
		font = "";
		htmlHeader = "";
		htmlFooter = "";
	}
	
	/** */
	export namespace ColorIndex
	{
		export const black = -1;
		export const white = -2;
		export const transparent = -3;
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
		
		transition = Transitions.slide;
		backgroundColorIndex: number = ColorIndex.black;
	}
	
	/** */
	export class CaptionedBladeRecord extends BladeRecord
	{
		static readonly type = 3;
		
		textContrast = 0;
		effect = Effects.none;
		origin = Ninth.center;
		
		readonly titles: ITitle[] = [];
		readonly paragraphs: string[] = [];
		readonly backgrounds = this.arrayOf(BackgroundRecord);
	}
	
	/** */
	export interface ITitle
	{
		text: string;
		size: number;
		weight: number;
	}
	
	/** */
	export class BackgroundRecord extends Record
	{
		static readonly table = "background";
		
		media = this.referenceOf(MediaRecord);
		crop?: [number, number, number, number];
		position?: [number, number];
		zoom: -1 | 0 | 1 = 0;
	}
	
	/** */
	export class ProseBladeRecord extends BladeRecord
	{
		static readonly type = 4;
		
		html = "";
	}
	
	/** */
	export class VideoBladeRecord extends BladeRecord
	{
		static readonly type = 5;
		
		style: "cover" | "contain" = "cover";
		media = this.referenceOf(MediaRecord);
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
		
		/** */
		getBlobUrl()
		{
			return blobUrls.get(this) || (() =>
			{
				const url = URL.createObjectURL(this.blob);
				blobUrls.set(this, url);
				return url;
			})();
		}
		
		/** */
		getHttpUrl()
		{
			return this.name || "unnamed-file";
		}
	}
	
	const blobUrls = new WeakMap<MediaRecord, string>();
	
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
	export const enum Ninth
	{
		topLeft = 1,
		top = 2,
		topRight = 3,
		left = 4,
		center = 5,
		right = 6,
		bottomLeft = 7,
		bottom = 8,
		bottomRight = 9
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
			Turf.BackgroundRecord,
		);
	}
}
