/// <reference path="./ui/ApexView.ts" />

namespace Turf
{
	if (DEBUG && typeof module === "object")
	{
		Object.assign(module.exports, { Turf });
		global["Turf"] = Turf;
	}
	
	export const apex = new ApexView();
	
	/** */
	export function startup()
	{
		Turf.installCss();
		
		Htx.from(document.body)({
			margin: "0",
			padding: "0",
			color: "white",
			backgroundColor: "black",
		});
		
		document.body.append(apex.root);
	}
}

