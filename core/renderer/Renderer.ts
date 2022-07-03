
namespace Turf
{
	/** */
	export class Renderer
	{
		/** */
		render(patch: PatchRecord, meta: MetaRecord)
		{
			return Htx.div(
				"story",
				...patch.blades.map(b => BladeRenderer.new(b, meta).render())
			);
		}
	}
	
	/** */
	abstract class BladeRenderer
	{
		/** */
		static new(bladeRecord: BladeRecord, metaRecord: MetaRecord): BladeRenderer
		{
			if (bladeRecord instanceof CaptionedBladeRecord)
				return new CaptionedBladeRenderer(bladeRecord, metaRecord);
			
			if (bladeRecord instanceof ProseBladeRecord)
				return new ProseBladeRenderer(bladeRecord, metaRecord);
			
			if (bladeRecord instanceof GalleryBladeRecord)
				return new GalleryBladeRenderer(bladeRecord, metaRecord);
			
			if (bladeRecord instanceof VideoBladeRecord)
				return new VideoBladeRenderer(bladeRecord, metaRecord);
			
			throw "Unknown type";
		}
		
		/** */
		protected constructor(
			protected readonly blade: BladeRecord,
			protected readonly meta: MetaRecord)
		{ }
		
		/** */
		render()
		{
			const backgroundColor = this.resolveColor(this.blade.backgroundColorIndex);
			
			return Htx.section(
				"scene",
				{
					minHeight: "100vh",
					backgroundColor: UI.color(backgroundColor)
				}
			);
		}
		
		/** */
		protected resolveColor(color: number): UI.IColor
		{
			if (color === ColorIndex.black)
				return { h: 0, s: 0, l: 0 };
			
			if (color === ColorIndex.white)
				return { h: 0, s: 0, l: 100 };
			
			if (color === ColorIndex.transparent)
				return { h: 0, s: 0, l: 0, a: 0 };
			
			if (color < 0 || color >= this.meta.colorScheme.length)
				throw "Unknown color: " + color;
			
			return this.meta.colorScheme[color];
		}
	}
	
	/** */
	class CaptionedBladeRenderer extends BladeRenderer
	{
		/** */
		constructor(
			protected readonly blade: CaptionedBladeRecord,
			protected readonly meta: MetaRecord)
		{
			super(blade, meta);
		}
		
		/** */
		render()
		{
			return Htx.from(super.render())(
				"captioned-scene"
			);
		}
	}
	
	/** */
	class ProseBladeRenderer extends BladeRenderer
	{
		/** */
		constructor(
			protected readonly blade: ProseBladeRecord,
			protected readonly meta: MetaRecord)
		{
			super(blade, meta);
		}
		
		/** */
		render()
		{
			return Htx.from(super.render())(
				"prose-scene"
			);
		}
	}
	
	/** */
	class GalleryBladeRenderer extends BladeRenderer
	{
		/** */
		constructor(
			protected readonly blade: GalleryBladeRecord,
			protected readonly meta: MetaRecord)
		{
			super(blade, meta);
		}
		
		/** */
		render()
		{
			return Htx.from(super.render())(
				"gallery-scene"
			);
		}
	}
	
	/** */
	class VideoBladeRenderer extends BladeRenderer
	{
		/** */
		constructor(
			protected readonly blade: VideoBladeRecord,
			protected readonly meta: MetaRecord)
		{
			super(blade, meta);
		}
		
		/** */
		render()
		{
			return Htx.from(super.render())(
				"video-scene"
			);
		}
	}
}
