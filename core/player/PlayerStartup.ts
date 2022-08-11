
namespace Player
{
	//@ts-ignore
	if (typeof document === "undefined") return;
	
	//@ts-ignore
	if (document.documentElement.hasAttribute("data-autostart")) return;
	
	let fn: any;
	document.addEventListener("readystatechange", fn = () =>
	{
		const rs = document.readyState;
		if (rs !== "interactive" && rs !== "complete")
			return;
		
		document.removeEventListener("readystatechange", fn);
		const storiesQuery = document.getElementsByClassName("story");
		const stories = Array.from(storiesQuery) as HTMLElement[];
		
		for (const story of stories)
			new Story(story);
	});
}
