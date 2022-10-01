/// <reference path="./RectangleHat.ts" />

namespace Player
{
	/** */
	export class AnchorRectangleHat extends RectangleHat
	{
		/** */
		constructor(private readonly slug: string)
		{
			super();
			
			(async () =>
			{
				const htmlText = await Util.fetch(this.slug);
				const baseHref = Url.toAbsolute(this.slug, Url.baseOf(window.location.href));
				const doc = new ForeignDocumentSanitizer(htmlText, baseHref).read();
				const sections = Util.sectionsOf(doc);
				
				this.heroElement = sections.length > 0 ? sections[0] : null;
				if (this.heroElement)
					this.setHtml(this.heroElement);
			})();
		}
		
		private heroElement: HTMLElement | null = null;
		private indepthHtmlUrl = "";
		private indexTextUrl = "";
		
		/** */
		async createStory()
		{
			if (!this.heroElement)
				return;
			
			const story = await Story.new(
				this.heroElement,
				this.indexTextUrl,
				this.indepthHtmlUrl);
			
			return story;
		}
	}
}
