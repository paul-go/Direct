
namespace App
{
	/**
	 * Returns a string that contains a sanitized version of the specified HTML.
	 */
	export function sanitizeArbitraryHtml(sourceHtml: string)
	{
		const container = Htx.div();
		container.innerHTML = sourceHtml;
		container.normalize();
		
		const blocks: ITrixSerializedBlock[] = [];
		
		let lastBlockContainer: HTMLElement | undefined = undefined;
		
		for (const node of Query.recurse(container))
		{
			if (!(node instanceof Text) || !node.nodeValue)
				continue;
			
			const ancestors = Query.ancestors(node)
				.filter((e): e is HTMLElement => e instanceof HTMLElement);
			
			// A new block is required if the Text node is a child of a different
			// block-level element than the previous Text node, or if there was
			// no previous Text node, or the previous Text node wasn't in a
			// block-level element at all.
			const containingBlock = ancestors.find(a => isBlockElement(a));
			const requiresNewBlock = containingBlock !== lastBlockContainer;
			lastBlockContainer = containingBlock;
			
			const inHeading = !!ancestors.find(e => e instanceof HTMLHeadingElement);
			const attributes: Partial<SerializedAttributes> = {};
			
			if (!inHeading && !!ancestors.find(e => ["STRONG", "B"].includes(e.tagName)))
				attributes.bold = true;
			
			if (!inHeading && !!ancestors.find(e => ["I", "EM"].includes(e.tagName)))
				attributes.italic = true;
			
			const containingHref = inHeading ? "" : ancestors
				.find((e): e is HTMLAnchorElement  => e instanceof HTMLAnchorElement)
				?.href || "";
			
			if (containingHref)
				attributes.href = containingHref;
			
			const createText = () => (<ITrixSerializedNode>{
				type: "string",
				attributes,
				string: node.nodeValue
			});
			
			const createBlock = () => (<ITrixSerializedBlock>{
				text: [createText()],
				attributes: inHeading ? ["heading1"] : []
			});
			
			let block = blocks.at(-1);
			
			if (requiresNewBlock || inHeading !== block?.attributes.includes("heading1"))
			{
				blocks.push(createBlock());
			}	
			else if (!Util.deepObjectEquals(block.attributes, attributes))
			{
				block.text.push(createText());
			}
			else
			{
				const lastText = block.text.at(-1)!;
				lastText.string = [lastText.string, node.nodeValue].join(" ").trim();
			}
		}
		
		const serializedObject: ITrixSerializedObject = {
			document: blocks,
			selectedRange: [0, 0]
		};
		
		return Htx.div(...renderProseDocument(serializedObject)).innerHTML;
	}
	
	/** */
	function isBlockElement(e: HTMLElement)
	{
		const blockTags = [
			"DIV",
			"SECTION",
			"H1",
			"H2",
			"H3",
			"H4",
			"H5",
			"H6",
			"P",
			"LI",
			"DT",
			"DD",
			"TR",
			"CAPTION",
			"BLOCKQUOTE",
			"ADDRESS"
		];
		
		return blockTags.includes(e.tagName);
	}
}
