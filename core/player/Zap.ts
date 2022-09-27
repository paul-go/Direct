
namespace Player
{
	if (typeof document !== "undefined")
	{
		const qs = (name: string) => !!document.querySelector(`SCRIPT[src*="${name}"]`);
		if (qs(ConstS.jsFileNamePlayer) || qs(ConstS.jsFileNameAppMin))
		{
			const heroElement = document.getElementsByTagName("SECTION").item(0);
			if (heroElement instanceof HTMLElement)
			{
				// Populate the index path and the other path
				const getLinkHref = (rel: string) => 
					document.head.querySelector(`LINK[rel=${rel}]`)?.getAttribute("href") || "";
				
				new Story(
					heroElement,
					getLinkHref(ConstS.hssIndepth),
					getLinkHref(ConstS.hssIndex)
				);
			}
		}
	}
}
