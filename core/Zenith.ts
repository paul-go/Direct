
namespace Turf
{
	if (DEBUG && typeof module === "object")
	{
		Object.assign(module.exports, { Turf, Query });
		global["Turf"] = Turf;
		global["Query"] = Query;
		global["When"] = When;
		(global as any)["Origin"] = Origin;
	}
}

