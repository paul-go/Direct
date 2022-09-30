
namespace Player
{
	/**
	 * 
	 */
	export class Story
	{
		/** */
		constructor(
			heroElement: HTMLElement,
			indepthUrl: string,
			private readonly indexUrl: string)
		{
			if (indepthUrl)
			{
				fetchText(indepthUrl).then(indepthHtml =>
				{
					const locationBase = Url.baseOf(window.location.href);
					const indepthBase = Url.baseOf(Url.toAbsolute(indepthUrl, locationBase));
					const doc = new ForeignDocumentSanitizer(indepthHtml, indepthBase).read();
					const sections = sectionsOf(doc);
					this.construct(heroElement, ...sections);
				});
			}
			else this.construct(heroElement);
		}
		
		/** */
		private async construct(...scenes: HTMLElement[])
		{
			const scenery = new Scenery();
			document.body.append(scenery.head);
			scenery.insert(...scenes);
			
			if (!this.indexUrl)
				return;
			
			const indexText = await fetchText(this.indexUrl);
			const slugs = indexText.split("\n").filter(s => !!s);
			const purview = new Purview();
			purview.size = 2;
			
			purview.handlePreviewRequest(req =>
			{
				const rectangles: RectangleHat[] = [];
				const slugSlice = slugs.slice(req.rangeStart, req.rangeEnd);
				
				for (const slug of slugSlice)
				{
					const rect = new RectangleHat();
					rectangles.push(rect);
					this.loadSceneWhenAvailable(rect, slug);
				}
				
				return rectangles;
			});
			
			purview.handleReviewRequest(async rectangle =>
			{
				
			});
			
			purview.gotoPreviews().then(() => {});
			
			scenery.insert(purview.head);
			await purview.gotoPreviews();
			console.log("");
		}
		
		/** */
		private async loadSceneWhenAvailable(rect: RectangleHat, slug: string)
		{
			const htmlText = await fetchText(slug);
			const baseHref = Url.toAbsolute(slug, Url.baseOf(window.location.href));
			const doc = new ForeignDocumentSanitizer(htmlText, baseHref).read();
			const sections = sectionsOf(doc);
			const section = sections.length > 0 ? sections[0] : null;
			
			if (section)
				rect.setHtml(section);
		}
	}
	
	/** */
	function sectionsOf(doc: Document)
	{
		const sections = Array.from(doc.body.children) as HTMLElement[];
		
		// Cut out everything that isn't a top-level <section>
		for (let i = sections.length; i-- > 0;)
		{
			const child = sections[i];
			if (child.tagName !== "SECTION")
			{
				child.remove();
				sections.splice(i, 1);
			}
		}
		
		return sections;
	}
	
	/** */
	async function fetchText(relativeUrl: string)
	{
		const fetchResult = await fetch(relativeUrl);
		const resultText = await fetchResult.text();
		return resultText;
	}
}
