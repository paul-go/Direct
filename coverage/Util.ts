
namespace Cover
{
	/** */
	export function display(hat: Hat.IHat)
	{
		Query.find(CssClass.appContainer)?.append(hat.head);
	}
	
	if (typeof module !== "undefined")
		Object.assign(module.exports, { Cover });
}
