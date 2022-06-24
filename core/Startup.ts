/// <reference path="./ui/ApexView.ts" />

namespace Grassroots
{
	if (DEBUG && typeof module === "object")
	{
		Object.assign(module.exports, { Grassroots });
		global["Grassroots"] = Grassroots;
	}
	
	export const apex = new ApexView();
	
	/** */
	export function startup()
	{
		Grassroots.installCss();
		
		Htx.from(document.body)({
			margin: "0",
			padding: "0",
			color: "white",
			backgroundColor: "black",
		});
		
		document.body.append(apex.root);
	}
}

