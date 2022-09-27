
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
				this.insertIndepthSections(indepthUrl).then(sections =>
				{
					this.constructScenery(heroElement, ...sections);
				});
			}
			else this.constructScenery(heroElement);
		}
		
		/** */
		private constructScenery(...scenes: HTMLElement[])
		{
			this._scenery = new Scenery();
			this._scenery.insert(...scenes);
			document.body.append(this._scenery.head);
			
			if (this.indexUrl)
				this.constructPurview();
		}
		
		/** */
		private async constructPurview()
		{
			const indexText = await fetchText(this.indexUrl);
			const slugs = this._slugs = indexText.split("\n").filter(s => !!s);
			
			const purview = new Purview();
			
			purview.handlePreviewRequest(req =>
			{
				const rectangles: RectangleHat[] = [];
				
				for (let i = req.rangeStart; i < req.rangeEnd; i++)
				{
					const rect = new RectangleHat();
					rectangles.push(rect);
					const slug = slugs[i];
					
				}
				
				return rectangles;
			});
			
			purview.handleReviewRequest(async rectangle =>
			{
				
			});
			
			document.body.append(purview.head);
		}
		
		/** */
		get scenery()
		{
			if (this._scenery === null)
				throw new Error();
			
			return this._scenery!;
		}
		private _scenery: Scenery | null = null;
		
		/** */
		get slugs()
		{
			return this._slugs;
		}
		private _slugs: string[] = [];
		
		/** */
		private async insertIndepthSections(relativePath: string)
		{
			const indepthHtml = await fetchText(relativePath);
			const parser = new DOMParser();
			const doc = parser.parseFromString(indepthHtml, "text/html");
			const children = Array.from(doc.body.children);
			
			// Cut out all script tags
			Array.from(doc.querySelectorAll("script")).map(e => e.remove());
			
			// Cut out everything that isn't a top-level <section>
			for (let i = children.length; i-- > 0;)
			{
				const child = children[i];
				if (child.tagName !== "SECTION")
				{
					child.remove();
					children.splice(i, 1);
				}
			}
			
			// Cut any attribute that starts with "on"
			for (const walker = document.createTreeWalker(doc.body);;)
			{
				const node = walker.nextNode();
				if (!node)
					break;
				
				if (node.nodeType === Node.ATTRIBUTE_NODE)
				{
					const attr = node as Attr;
					if (attr.name.startsWith("on"))
						attr.parentElement?.removeAttributeNode(attr);
				}
			}
			
			return children as HTMLElement[];
		}
		
		/** */
		private async getHtmlFromSlug(slug: string)
		{
			const indexHtml = await fetchText(slug);
			
			// TODO: Is this handling page-specific CSS?
			
			return indexHtml;
		}
	}
	
	/** */
	async function fetchText(relativeUrl: string)
	{
		const fetchResult = await fetch(relativeUrl);
		const resultText = await fetchResult.text();
		return resultText;
	}
}
