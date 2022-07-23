/// <reference path="Record.ts" />

namespace Turf
{
	/** */
	export class MetaRecord extends Record
	{
		colorScheme = ColorScheme.default.colors;
		font = "";
		htmlHeader = "";
		htmlFooter = "";
		
		/** Stores the method of publishing used in this Turf. */
		publishMethod = "";
		
		/**
		 * Stores an object where the keys line up with a particular staticIdentifier
		 * referring to a publish method, and the values refer to objects whose
		 * structure differs depending on the publish method.
		 * 
		 * There should be a separate entry in the top-level publishData object
		 * for each publish method that has been configured.
		 */
		publishDataTable: Literal<string, Literal<string, string | number | boolean>> = {};
		
		homePatch = Database.reference(PatchRecord);
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
		dateCreated = Date.now();
		datePublished = 0;
		blades = Database.array(BladeRecord);
	}
	
	/** */
	export abstract class BladeRecord extends Record
	{
		transition = Transitions.slide.name;
		backgroundColorIndex = 0;
	}
	
	/** */
	export class CaptionedBladeRecord extends BladeRecord
	{
		textContrast = 50;
		effect = Effects.none.name;
		origin = Origin.center;
		contentImage = Database.reference(MediaRecord);
		contentImageWidth = 50;
		titles: ITitle[] = [];
		description = "";
		descriptionSize = 3;
		backgrounds = Database.array(BackgroundRecord);
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
		media = Database.reference(MediaRecord);
		
		/** Stores the size of the background in vmin units. A value of -1 indicates "cover" */
		size = -1;
		position: [number, number] = [50, 50];
		zoom: -1 | 0 | 1 = 0;
	}
	
	/** */
	export class GalleryBladeRecord extends BladeRecord
	{
		frames = Database.array(FrameRecord);
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
		media = Database.reference(MediaRecord);
	}
	
	/** */
	export class FrameRecord extends Record
	{
		captionLine1 = "";
		captionLine2 = "";
		textContrast = 0;
		size: SizeMethod = "contain";
		media = Database.reference(MediaRecord);
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
		getBlobCssUrl()
		{
			return `url(${this.getBlobUrl()})`;
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
}
