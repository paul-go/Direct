
namespace App
{
	if (DEBUG && typeof module === "object")
	{
		Object.assign(module.exports, { App, Query });
		global["App"] = App;
		global["Query"] = Query;
		global["Hot"] = Hot;
		global["When"] = When;
		(global as any)["Origin"] = Origin;
	}
}
