
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
		useAnimation(animationName: string)
		{
			const animation = Animation.fromName(animationName);
			this.usedTransitions.add(animation);
			return animationName;
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
			...patch.blades.flatMap(blade => renderBlade(new Bundle(blade, meta, isPreview)))
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
		
		let snapFooter: HTMLElement | null = null;
		const addSnapFooter = () => snapFooter = Htx.div(CssClass.snapFooter);
		
		return [
			Htx.section(
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
					{
						addSnapFooter();
						return renderProseBlade(bun as Bundle<ProseBladeRecord>);
					}
					
					if (bun.blade instanceof GalleryBladeRecord)
						return renderGalleryBlade(bun as Bundle<GalleryBladeRecord>);
					
					if (bun.blade instanceof VideoBladeRecord)
						return renderVideoBlade(bun as Bundle<VideoBladeRecord>);
					
					return [];
				})()
			),
			snapFooter,
		];
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
		if (blade.titles.length > 0 || blade.description.length > 0)
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
			
			if (blade.description.length > 0)
				fg.append(...convertDescriptionToParagraphs(blade.description));
			
			out.push(fg);
		}
		
		return out;
	}
	
	/** */
	function convertDescriptionToParagraphs(description: string)
	{
		interface IRegion { text: string, bold: boolean; href: string }
		const regions: IRegion[] = [];
		const empty: IRegion = { text: "", bold: false, href: "" };
		const shim = Htx.div();
		shim.innerHTML = description;
		
		const recurse = (e: Element, bold: boolean, href: string) =>
		{
			for (const node of Array.from(e.childNodes))
			{
				if (node instanceof Element)
				{
					if (node.tagName === "B")
						recurse(node, true, href);
					
					else if (node.tagName === "A")
						recurse(node, bold, node.getAttribute("href") || "");
					
					else if (node.tagName === "BR")
						regions.push(empty);
				}
				else if (node instanceof Text)
				{
					if (regions.length > 0 && 
						regions[regions.length - 1].bold === bold &&
						regions[regions.length - 1].href === href)
					{
						regions[regions.length - 1].text += node.textContent || "";
					}
					else
					{
						regions.push({ text: node.textContent || "", bold, href });
					}
				}
			}
		};
		
		recurse(shim, false, "");
		
		for (let i = regions.length; i-- > 0;)
		{
			const region = regions[i];
			region.text = region.text.replace("&nbsp;", " ");
			
			if (region !== empty)
			{
				if (region.text === "")
					regions.splice(i, 1);
			}
			else if (i < regions.length - 1 && regions[i + 1] === empty)
			{
				regions.splice(i, 1);
			}
		}
		
		// Remove leading br's
		for (;;)
		{
			if (regions.length === 0 || regions[0] !== empty)
				break;
			
			regions.splice(0, 1);
		}
		
		// Remove trailing br's
		for (;;)
		{
			if (regions.length === 0 || regions.at(-1) !== empty)
				break;
			
			regions.length--;
		}
		
		const htmlParts: string[] = ["<p>"];
		
		for (const region of regions)
		{
			if (region !== empty)
			{
				let html = region.text;
				
				if (region.bold)
					html = "<b>" + html + "</b>";
				
				if (region.href !== "")
					html = `<a href="${region.href}">` + html + "</a>";
				
				htmlParts.push(html);
			}
			else htmlParts.push("</p><p>");
		}
		
		htmlParts.push("</p>");
		
		const container = Htx.div();
		container.innerHTML = htmlParts.join("");
		
		return Array.from(container.children) as HTMLParagraphElement[]
	}
	
	/**
	 * 
	 */
	function renderGalleryBlade(bun: Bundle<GalleryBladeRecord>)
	{
		return [
			CssClass.galleryScene,
			...bun.blade.frames.map(frame =>
			{
				if (!frame.media)
					return null;
				
				const src = bun.getMediaUrl(frame.media)
				const frameDiv = Htx.div(
					CssClass.galleryFrame,
					Htx.img(
						{
							src,
							objectFit: frame.size
						}
					)
				);
				
				if (frame.captionLine1 || frame.captionLine2)
				{
					const legend = Htx.div(
						CssClass.galleryFrameLegend,
						frame.captionLine1 && Htx.p(new Text(frame.captionLine1)),
						frame.captionLine2 && Htx.p(new Text(frame.captionLine2)),
					);
					
					if (frame.size === "contain")
					{
						(async () =>
						{
							const [width, height] = await RenderUtil.getAspectRatio(src);
							legend.style.aspectRatio = width + " / " + height;
							frameDiv.append(legend);
						})();
					}
					else frameDiv.append(legend);
				}
				
				return frameDiv;
			})
		];
	}
	
	/**
	 * 
	 */
	function renderProseBlade(bun: Bundle<ProseBladeRecord>)
	{
		const proseNodes = tempProseConverter(bun.blade.html);
		
		return [
			CssClass.proseScene,
			Htx.div(
				CssClass.proseSceneForeground,
				...proseNodes
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
					objectFit: bun.blade.size,
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
		return lightness < 55 ? white : black;
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
