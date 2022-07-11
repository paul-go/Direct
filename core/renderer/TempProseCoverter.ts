
namespace Turf
{
	/**
	 * This code should be deleted once the proper prose editor has been built
	 * and generates the HTML properly in the first place.
	 */
	export function tempProseConverter(html: string)
	{
		const div = Htx.div();
		div.innerHTML = html;
		
		const children = Array.from(div.childNodes);
		const blocks: string[] = [];
		let text = "";
		
		for (const child of children)
		{
			if (child instanceof Text)
			{
				text += child.nodeValue || "";
			}
			else if (child instanceof HTMLBRElement)
			{
				if (text !== "")
				{
					blocks.push(text);
					text = "";
				}
			}
		}
		
		if (text !== "")
			blocks.push(text);
		
		const htmlElements: HTMLElement[] = [];
		
		for (const block of blocks)
		{
			if (block.startsWith("#"))
			{
				htmlElements.push(Htx.h2(new Text(block.slice(1).trim())));
			}
			else
			{
				htmlElements.push(Htx.p(new Text(block.trim())));
			}
		}
		
		return htmlElements;
	}
}
