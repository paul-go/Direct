
namespace App
{
	/** Marker base class */
	export class Record { }
	
	/** */
	export class PostRecord extends Record
	{
		title = "";
		description = "";
		slug = "";
		htmlHeader = "";
		htmlFooter = "";
		draft = true;
		dateCreated = Date.now();
		dateModified = Date.now();
		datePublished = 0;
		scenes = Model.array<SceneRecord>();
	}
	
	/** */
	export type PartialPostRecord = Omit<PostRecord, "scenes">;
	
	/** */
	export abstract class SceneRecord extends Record
	{
		transition = Transitions.slide.name;
		colorPair: TColorPair  = [[215, 70, 50], [215, 70, 85]];
		contrast = 1;
		hasColor = false;
		
		/** */
		getDarkOnLight()
		{
			return this.contrast < 0;
		}
		
		/** */
		setDarkOnLight(value: boolean)
		{
			if (value !== this.contrast < 0)
				this.contrast *= -1;
		}
	}
	
	/** */
	export type TColorPair = [TColor, TColor];
	
	/** */
	export type TColor = [number, number, number];
	
	/** */
	export class CanvasSceneRecord extends SceneRecord
	{
		effect = Effects.none.name;
		origin = Origin.center;
		contentImage = Model.reference<MediaRecord>();
		contentImageWidth = 50;
		titles: ITitle[] = [];
		description = "";
		descriptionSize = 3;
		actions = Model.array<ActionRecord>();
		actionShape = CanvasActionShape.round;
		backgrounds = Model.array<BackgroundRecord>();
		twist = 0;
	}
	
	/** */
	export interface ITitle
	{
		text: string;
		size: number;
		weight: number;
		hasColor: boolean;
	}
	
	/** */
	export class ActionRecord extends Record
	{
		text = "";
		target: string = "";
		filled = false;
		hasColor = false;
	}
	
	/** */
	export class BackgroundRecord extends Record
	{
		media = Model.reference<MediaRecord>();
		
		/** Stores the size of the background in vmin units. A value of -1 indicates "cover" */
		size = -1;
		position: [number, number] = [50, 50];
		zoom: -1 | 0 | 1 = 0;
	}
	
	/** */
	export class GallerySceneRecord extends SceneRecord
	{
		frames = Model.array<FrameRecord>();
	}
	
	/** */
	export class ProseSceneRecord extends SceneRecord
	{
		content: ITrixSerializedObject | null = null;
		hasColorAccents = false;
	}
	
	/** */
	export class FrameRecord extends Record
	{
		captionLine1 = "";
		captionLine2 = "";
		size: SizeMethod = "contain";
		media = Model.reference<MediaRecord>();
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
