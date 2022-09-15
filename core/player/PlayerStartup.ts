
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
	});
}
