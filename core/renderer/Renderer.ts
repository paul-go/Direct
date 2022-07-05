
namespace Turf
{
	/**
	 * 
	 */
	class Bundle<T extends BladeRecord = BladeRecord>
	{
		constructor(
			readonly blade: T,
			readonly meta: MetaRecord,
			readonly isPreview: boolean)
		{ }
		
		/** */
		getMediaUrl(media: MediaRecord)
		{
			if (this.isPreview)
				return media.getBlobUrl();
			
			return media.getHttpUrl();
		}
		
		/** */
		useAnimation(transition: Animation)
		{
			this.usedTransitions.add(transition);
			return transition.name;
		}
		
		readonly usedTransitions = new Set<Animation>();
	}
	
	/**
	 * 
	 */
	export function renderPatchPreview(
		patch: PatchRecord,
		meta: MetaRecord)
	{
		return renderPatch(patch, meta, true);
	}
	
	/**
	 * 
	 */
	export function renderPatchFinal(
		patch: PatchRecord,
		meta: MetaRecord)
	{
		const patchHtml = renderPatch(patch, meta, true);
		// convert the patch html to a string
		return "";
	}
	
	/**
	 * 
	 */
	function renderPatch(
		patch: PatchRecord,
		meta: MetaRecord,
		isPreview: boolean)
	{
		return Htx.div(
			"story",
			...patch.blades.map(blade => renderBlade(new Bundle(blade, meta, isPreview)))
		);
	}
	
	/**
	 * 
	 */
	function renderBlade(bun: Bundle)
	{
		const foregroundColor = resolveForegroundColor(
			bun.blade.backgroundColorIndex, 
			bun.meta);
		
		const backgroundColor = resolveBackgroundColor(
			bun.blade.backgroundColorIndex, 
			bun.meta);
		
		return Htx.section(
			"scene",
			{
				color: UI.color(foregroundColor),
				backgroundColor: UI.color(backgroundColor),
				data: {
					[DataAttributes.transition]: bun.useAnimation(bun.blade.transition)
				}
			},
			...(() =>
			{
				if (bun.blade instanceof CaptionedBladeRecord)
					return renderCaptionedBlade(bun as Bundle<CaptionedBladeRecord>);
				
				if (bun.blade instanceof ProseBladeRecord)
					return renderProseBlade(bun as Bundle<ProseBladeRecord>);
				
				if (bun.blade instanceof GalleryBladeRecord)
					return renderGalleryBlade(bun as Bundle<GalleryBladeRecord>);
				
				if (bun.blade instanceof VideoBladeRecord)
					return renderVideoBlade(bun as Bundle<VideoBladeRecord>);
				
				return [];
			})()
		);
	}
	
	/**
	 * 
	 */
	function renderCaptionedBlade(bun: Bundle<CaptionedBladeRecord>)
	{
		const blade = bun.blade;
		const out: Htx.Param[] = [CssClass.captionScene];
		
		out.push({ 
			justifyContent:
				blade.origin % 3 === 1 ? "flex-start" :
				blade.origin % 3 === 2 ? "center" :
				blade.origin % 3 === 0 ? "flex-end" : "",
			alignItems:
				blade.origin < 4 ? "flex-start" :
				blade.origin < 7 ? "center" : "flex-end",
		});
		
		// Background
		out.push(...blade.backgrounds.map(bg =>
		{
			if (bg.media)
			{
				const cls = MimeType.getClass(bg.media.type);
				
				if (cls === MimeClass.image)
				{
					return Htx.div(
						CssClass.captionSceneBackgroundImage,
						{
							backgroundImage: "url(" + bun.getMediaUrl(bg.media) + ")"
						}
					);
				}
				else if (cls === MimeClass.video)
				{
					return Htx.video(
						{
							src: bun.getMediaUrl(bg.media),
							autoplay: true,
							controls: false,
							loop: true,
							playsInline: true,
						}
					);
				}
			}
		}).filter(b => !!b));
		
		// Foreground
		if (blade.titles.length > 0 || blade.paragraphs.length > 0)
		{
			const fg = Htx.div(
				CssClass.captionSceneForeground,
				{
					textAlign: 
						blade.origin % 3 === 1 ? "left" :
						blade.origin % 3 === 2 ? "center" :
						blade.origin % 3 === 0 ? "right" : "",
					data: {
						[DataAttributes.transition]: bun.useAnimation(blade.effect)
					},
				}
			);
			
			if (blade.titles.length > 0)
			{
				const h2 = Htx.h2();
				
				for (const title of blade.titles)
				{
					h2.append(Htx.div(
						UI.specificWeight(title.weight),
						{
							fontSize: UI.vsize(title.size),
						},
						new Text(title.text)
					));
				}
				
				fg.append(h2);
			}
			
			if (blade.paragraphs.length > 0)
				for (const paragraph of blade.paragraphs)
					fg.append(Htx.p(new Text(paragraph)));
			
			out.push(fg);
		}
		
		return out;
	}
	
	/**
	 * 
	 */
	function renderGalleryBlade(bun: Bundle<GalleryBladeRecord>)
	{
		return [
			CssClass.galleryScene,
			Htx.div(
			)
		];
	}
	
	/**
	 * 
	 */
	function renderProseBlade(bun: Bundle<ProseBladeRecord>)
	{
		return [
			CssClass.proseScene,
			Htx.div(
			)
		];
	}
	
	/**
	 * 
	 */
	function renderVideoBlade(bun: Bundle<VideoBladeRecord>)
	{
		return !bun.blade.media ? [] : [
			CssClass.videoScene,
			Htx.video(
				{
					src: bun.getMediaUrl(bun.blade.media),
					autoplay: false,
					controls: true,
					loop: false,
					playsInline: true,
					objectFit: bun.blade.style,
				}
			)
		];
	}
	
	/**
	 * 
	 */
	function resolveForegroundColor(color: number, meta: MetaRecord): UI.IColor
	{
		if (color === ColorIndex.black)
			return white;
		
		if (color === ColorIndex.white)
			return black;
		
		if (color === ColorIndex.transparent)
			return white;
		
		if (color < 0 || color >= meta.colorScheme.length)
			throw "Unknown color: " + color;
		
		const lightness = meta.colorScheme[color].l;
		return lightness < 50 ? white : black;
	}
	
	/**
	 * 
	 */
	function resolveBackgroundColor(color: number, meta: MetaRecord): UI.IColor
	{
		if (color === ColorIndex.black)
			return black;
		
		if (color === ColorIndex.white)
			return white;
		
		if (color === ColorIndex.transparent)
			return { h: 0, s: 0, l: 0, a: 0 };
		
		if (color < 0 || color >= meta.colorScheme.length)
			throw "Unknown color: " + color;
		
		return meta.colorScheme[color];
	}
	
	const black = { h: 0, s: 0, l: 0 };
	const white = { h: 0, s: 0, l: 255 };
}
