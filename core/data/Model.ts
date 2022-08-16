/// <reference path="Database.ts" />

namespace App
{
	/**
	 * Returns a reference to the Database object with the specified name.
	 * If the database exists in storage, but has not been loaded into an object,
	 * it's loaded before being returned.
	 */
	export async function getDatabase(name: string)
	{
		let db = Database.get(name);
		if (db)
			return db;
		
		const id = Database.getId(name);
		if (!id)
			return null;
		
		return App.createDatabase({ id });
	}
	
	/** */
	export async function getDatabaseMeta(database: Database)
	{
		let meta = await database.first(MetaRecord);
		if (!meta)
			meta = new MetaRecord();
		
		if (!meta.homePost)
			meta.homePost = new PostRecord();
		
		await database.save(meta);
		return meta;
	}
	
	/** */
	export async function createDatabase(about: IDatabaseAbout)
	{
		const database = await App.Database.new(about,
			{ ctor: App.MetaRecord, stable: 1, root: true },
			{ ctor: App.PostRecord, stable: 2, root: true },
			{ ctor: App.AttentionSceneRecord, stable: 3 },
			{ ctor: App.ProseSceneRecord, stable: 4 },
			{ ctor: App.GallerySceneRecord, stable: 6 },
			{ ctor: App.FrameRecord, stable: 7 },
			{ ctor: App.MediaRecord, stable: 8 },
			{ ctor: App.BackgroundRecord, stable: 9 },
		);
		
		return database;
	}
	
	/** */
	export class MetaRecord extends Record
	{
		colorScheme = ColorScheme.default.colors;
		font = "";
		htmlHeader = "";
		htmlFooter = "";
		
		homePost = Database.reference(PostRecord);
		
		/** Stores the method of publishing used in this App. */
		publishMethod = "";
		
		/**
		 * Stores an object where the keys line up with a particular label
		 * refering to a publish method, and the values refer to objects whose
		 * structure differs depending on the publish method.
		 * 
		 * There should be a separate entry in the top-level publishData object
		 * for each publish method that has been configured.
		 */
		publishParams: Literal<string, Literal<string, string | number | boolean>> = {};
		
		/** */
		getPublishParam<T extends string | number | boolean>(
			publishKey: string,
			paramKey: string,
			fallback: T): T
		{
			let out = this.publishParams[publishKey]?.[paramKey];
			if (out !== undefined)
				return out as T;
			
			this.setPublishParam(publishKey, paramKey, fallback);
			return fallback;
		}
		
		/**
		 * Sets a value in a publish parameter table.
		 * Returns a boolean value indicating whether the value was changed;
		 */
		setPublishParam(
			publisherKey: string,
			paramKey: string,
			value: string | number | boolean): boolean
		{
			const p = this.publishParams;
			const current = p[publisherKey]?.[paramKey];
			const changed = current !== value;
			(p[publisherKey] ||= {})[paramKey] = value;
			
			if (changed)
				this.save();
			
			return changed;
		}
	}
	
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
		datePublished = 0;
		scenes = Database.array(SceneRecord);
	}
	
	/** */
	export abstract class SceneRecord extends Record
	{
		transition = Transitions.slide.name;
		backgroundColorIndex = 0;
	}
	
	/** */
	export class AttentionSceneRecord extends SceneRecord
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
	export class GallerySceneRecord extends SceneRecord
	{
		frames = Database.array(FrameRecord);
	}
	
	/** */
	export class ProseSceneRecord extends SceneRecord
	{
		content: ITrixSerializedObject | null = null;
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
