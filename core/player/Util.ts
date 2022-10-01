
namespace Player
{
	/** */
	export namespace Util
	{
		/** */
		export function sectionsOf(doc: Document)
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
		export async function fetch(relativeUrl: string)
		{
			const fetchResult = await window.fetch(relativeUrl);
			const resultText = await fetchResult.text();
			return resultText;
		}
	}
}