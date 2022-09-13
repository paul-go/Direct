
namespace App
{
	if (DEBUG && typeof module === "object")
	{
		Object.assign(module.exports, { App, Query, Hot, When, Player, Origin });
		global["App"] = App;
		global["Query"] = Query;
		global["Hot"] = Hot;
		global["When"] = When;
		global["Player"] = Player;
		(global as any)["Origin"] = Origin;
	}
}
