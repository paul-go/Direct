
namespace Player
{
	/**
	 * 
	 */
	async function getHttpFile(relativeUrl: string)
	{
		const fetchResult = await window.fetch(relativeUrl);
		const resultText = await fetchResult.text();
		return resultText;
	}
	
	/** */
	function getLinkHref(doc: Document, rel: string)
	{
		return doc.head.querySelector(`LINK[rel=${rel}]`)?.getAttribute("href") || "";
	}
	
	/**
	 * Loads the <section> tags that are present in the specified document
	 * into a Scenery object.
	 */
	function getSections(doc: Document)
	{
		return Array.from(doc.body.children)
			.filter((e): e is HTMLElement => e instanceof HTMLElement)
			.filter(e => e.tagName === "SECTION");
	}
	
	/**
	 * 
	 */
	function getIndepthUrl(
		doc: Document = window.document,
		docHref = window.location.href)
	{
		const indepthHref = getLinkHref(doc, ConstS.essIndepthKey);
		return indepthHref ?
			Url.toAbsolute(indepthHref, docHref) :
			"";
	}
	
	/**
	 * Loads the indepth scenes that are referenced within the specified Document.
	 */
	async function getIndepthSections(indepthUrl = getIndepthUrl())
	{
		const indepthHtml = await getHttpFile(indepthUrl);
		const indepthBase = Url.baseOf(indepthUrl);
		const indepthDoc = new ForeignDocumentSanitizer(indepthHtml, indepthBase).read();
		const indepthSections = getSections(indepthDoc);
		return indepthSections;
	}
	
	/**
	 * Creates an instance of the singular index that can exist within
	 * the browsing session, which is returned as an Omniview.
	 */
	async function maybeCreateOmniview()
	{
		const indexListHref = getLinkHref(document, ConstS.essIndexKey);
		if (!indexListHref)
			return null;
		
		const locationBaseUrl = Url.baseOf(window.location.href);
		const indexListUrl = Url.toAbsolute(indexListHref, locationBaseUrl);
		const indexListBase = Url.baseOf(indexListUrl);
		const indexList = await getHttpFile(indexListUrl);
		const slugUrls = indexList
			.split("\n")
			.filter(s => !!s)
			.map(slug => Url.toAbsolute(slug, indexListBase));
		
		const omniview = new Omniview<Scenery>();
		omniview.size = 2;
		
		omniview.handlePreviewRequest(async req =>
		{
			return slugUrls
				.slice(req.rangeStart, req.rangeEnd)
				.map(slugUrl => createScenery(slugUrl));
		});
		
		omniview.handleScenesRequest(async scenery =>
		{
			const info = sceneryInfo.get(scenery);
			return info ?
				getIndepthSections(info.indepthUrl) :
				[];
		});
		
		let lastEnteredScenery: Scenery | null = null;
		
		omniview.enterReviewFn(scenery =>
		{
			lastEnteredScenery = scenery;
			const info = sceneryInfo.get(scenery);
			if (info)
				History.push(info.slugUrl);
		});
		
		omniview.exitReviewFn(reason =>
		{
			if (reason === ExitReason.swipeUp || reason === ExitReason.swipeDown)
				History.back();
		});
		
		History.on("back", () =>
		{
			omniview.gotoPreviews();
		});
		
		History.on("forward", () =>
		{
			if (lastEnteredScenery)
				omniview.gotoReview(lastEnteredScenery);
		});
		
		omniview.gotoPreviews().then(() => {});
		return omniview;
	}
	
	/** */
	function createScenery(slugUrl: string)
	{
		const scenery = new Scenery();
		
		(async () =>
		{
			const heroHtml = await getHttpFile(slugUrl);
			const heroDoc = new ForeignDocumentSanitizer(heroHtml, slugUrl).read();
			const sections = getSections(heroDoc);
			const indepthUrl = getIndepthUrl(heroDoc, slugUrl);
			sceneryInfo.set(scenery, { slugUrl, indepthUrl });
			scenery.insert(...sections);
		})();
		
		return scenery;
	}
	
	type TSceneryInfo = { slugUrl: string, indepthUrl: string };
	const sceneryInfo = new WeakMap<Scenery, TSceneryInfo>();
	
	/**
	 * Main entry point.
	 */
	(function main()
	{
		if (typeof document === "undefined")
			return;
		
		const qs = (name: string) => !!document.querySelector(`SCRIPT[src*="${name}"]`);
		if (!qs(ConstS.jsFileNamePlayer) && !qs(ConstS.jsFileNameAppMin))
			return;
		
		const sections = getSections(document);
		if (sections.length === 0)
			return;
		
		const marker = sections[0].previousElementSibling || document.body;
		const scenery = new Scenery().insert(...sections);
		
		// Allow for tags to be present in the document
		// before the first top-level <section> tag.
		if (marker === document.body)
			document.body.prepend(scenery.head);
		else
			marker.after(scenery.head);
		
		(async () =>
		{
			const indepthSections = await getIndepthSections();
			scenery.insert(...indepthSections);
			
			const omniview = await maybeCreateOmniview();
			if (omniview)
				scenery.insert(omniview.head);
		})();
	})();
}
