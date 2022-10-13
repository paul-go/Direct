
namespace Player
{
	/**
	 * A class that wraps a ForeignDocumentReader, and which converts
	 * the content of the specified raw HTML document into a format
	 * which is acceptable for injection into a blog.
	 */
	export class ForeignDocumentSanitizer
	{
		/** */
		constructor(
			private readonly rawDocument: string,
			private readonly baseHref: string)
		{ }
		
		/** */
		read()
		{
			const reader = new Player.ForeignDocumentReader(this.rawDocument);
			
			reader.trapElement(e =>
			{
				const t = e.tagName.toLowerCase();
				
				if (t === "script" || 
					t === "iframe" || 
					t === "portal" ||
					t === "frame" ||
					t === "frameset")
					return null;
				
				if (t === "noscript")
				{
					return Hot.div(
						Array.from(e.attributes),
						Array.from(e.children)
					);
				}
				
				return e;
			});
			
			reader.trapAttribute((name, value, element) =>
			{
				if (name.startsWith("on"))
					return null;
				
				const tag = element.tagName.toLowerCase();
				
				if (name === "srcset")
					return this.resolveSourceSetUrls(value);
				
				if (name === "href" || 
					name === "src" ||
					(tag === "embed" && name === "source") ||
					(tag === "video" && name === "poster") ||
					(tag === "object" && name === "data") ||
					(tag === "form" && name === "action"))
					return this.resolvePlainUrl(value);
				
				return value;
			});
			
			reader.trapProperty((name, value) =>
			{
				if (!urlProperties.has(name))
					return value;
				
				return this.resolveCssUrls(value);
			});
			
			return reader.read();
		}
		
		/** */
		private resolvePlainUrl(plainUrl: string)
		{
			if (plainUrl.startsWith("data:") ||
				plainUrl.startsWith("http:") ||
				plainUrl.startsWith("https:") ||
				plainUrl.startsWith("/") ||
				/^[a-z\-]+:/g.test(plainUrl))
				return plainUrl;
			
			return Url.toAbsolute(plainUrl, this.baseHref);
		}
		
		/** */
		private resolveCssUrls(cssValue: string)
		{
			const reg = /\burl\(["']?([^\s?"')]+)/gi;
			const replaced = cssValue.replace(reg, (substring, url) =>
			{
				let resolved = this.resolvePlainUrl(url);
				
				if (substring.startsWith(`url("`))
					resolved = `url("` + resolved;
				
				else if (substring.startsWith(`url(`))
					resolved = `url(` + resolved;
				
				return resolved;
			});
			
			return replaced;
		}
		
		/**
		 * Resolves URLs in a srcset attribute, using a make-shift algorithm
		 * that doesn't support commas in the URL.
		 */
		private resolveSourceSetUrls(srcSetUrls: string)
		{
			const rawPairs = srcSetUrls.split(`,`);
			const pairs = rawPairs.map(rawPair =>
			{
				const pair = rawPair.trim().split(/\s+/);
				if (pair.length === 1)
					pair.push("");
				
				return pair as [string, string];
			});
			
			for (const pair of pairs)
			{
				const [url] = pair;
				pair[0] = this.resolvePlainUrl(url);
			}
			
			return pairs.map(pair => pair.join(" ")).join(`, `);
		}
	}
	
	/** */
	const urlProperties = new Set([
		"background",
		"background-image",
		"border-image",
		"border-image-source",
		"list-style",
		"list-style-image",
		"mask",
		"mask-image",
		"-webkit-mask",
		"-webkit-mask-image",
		"content"
	]);
}
