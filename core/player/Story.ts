
namespace Player
{
	/**
	 * 
	 */
	export class Story
	{
		/** */
		static async new(
			heroElement: HTMLElement,
			indepthHtmlUrl: string,
			indexTextUrl: string)
		{
			const story = new Story(indexTextUrl);
			
			if (indepthHtmlUrl)
			{
				Util.fetch(indepthHtmlUrl).then(indepthHtml =>
				{
					const locationBase = Url.baseOf(window.location.href);
					const indepthBase = Url.baseOf(Url.toAbsolute(indepthHtmlUrl, locationBase));
					const doc = new ForeignDocumentSanitizer(indepthHtml, indepthBase).read();
					const sections = Util.sectionsOf(doc);
					story.construct(heroElement, ...sections);
				});
			}
			else story.construct(heroElement);
			
			return story;
		}
		
		/** */
		private constructor(private readonly indexUrl: string) { }
		
		/** */
		readonly scenery = new Scenery();
		
		/** */
		private async construct(...scenes: HTMLElement[])
		{
			document.body.append(this.scenery.head);
			this.scenery.insert(...scenes);
			
			if (!this.indexUrl)
				return;
			
			const indexText = await Util.fetch(this.indexUrl);
			const slugs = indexText.split("\n").filter(s => !!s);
			const omniview = new Omniview<AnchorRectangleHat>();
			omniview.size = 2;
			
			omniview.handlePreviewRequest(req =>
			{
				return slugs
					.slice(req.rangeStart, req.rangeEnd)
					.map(slug => new AnchorRectangleHat(slug));
			});
			
			omniview.handleReviewRequest(async rectangle =>
			{
				const story = await rectangle.createStory();
				if (story)
					return story.scenery;
			});
			
			omniview.gotoPreviews().then(() => {});
			
			this.scenery.insert(omniview.head);
			await omniview.gotoPreviews();
		}
	}
}
