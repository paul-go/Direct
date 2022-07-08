/// <reference path="Record.ts" />

namespace Turf
{
	/** */
	export class MetaRecord extends Record
	{
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
		title = "";
		description = "";
		slug = "";
		htmlHeader = "";
		htmlFooter = "";
		draft = true;
		dateCreated = 0;
		datePublished = 0;
		blades = Back.array(BladeRecord);
	}
	
	/** */
	export abstract class BladeRecord extends Record
	{
		transition = Transitions.slide.name;
		backgroundColorIndex: number = ColorIndex.black;
	}
	
	/** */
	export class CaptionedBladeRecord extends BladeRecord
	{
		textContrast = 0;
		effect = Effects.none.name;
		origin = Ninth.center;
		titles: ITitle[] = [];
		paragraphs: string[] = [];
		backgrounds = Back.array(BackgroundRecord);
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
		media = Back.reference(MediaRecord);
		crop: [number, number, number, number] = [0, 0, -1, -1];
		position: [number, number] = [0, 0];
		zoom: -1 | 0 | 1 = 0;
	}
	
	/** */
	export class GalleryBladeRecord extends BladeRecord
	{
		frames = Back.array(FrameRecord);
	}
	
	/** */
	export class ProseBladeRecord extends BladeRecord
	{
		html = "";
	}
	
	/** */
	export class VideoBladeRecord extends BladeRecord
	{
		size: SizeMethod = "cover";
		media = Back.reference(MediaRecord);
	}
	
	/** */
	export class FrameRecord extends Record
	{
		captionLine1 = "";
		captionLine2 = "";
		textContrast = 0;
		size: SizeMethod = "contain";
		media = Back.reference(MediaRecord);
	}
	
	/** */
	export class MediaRecord extends Record
	{
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
		return Turf.Back.new(name,
			{ ctor: Turf.MetaRecord, stable: 1 },
			{ ctor: Turf.PatchRecord, stable: 2 },
			{ ctor: Turf.CaptionedBladeRecord, stable: 3 },
			{ ctor: Turf.ProseBladeRecord, stable: 4 },
			{ ctor: Turf.VideoBladeRecord, stable: 5 },
			{ ctor: Turf.GalleryBladeRecord, stable: 6 },
			{ ctor: Turf.FrameRecord, stable: 7 },
			{ ctor: Turf.MediaRecord, stable: 8 },
			{ ctor: Turf.BackgroundRecord, stable: 9 },
		);
	}
}
