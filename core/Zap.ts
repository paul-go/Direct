
namespace App
{
	if (DEBUG && typeof module === "object")
	{
		Object.assign(module.exports, { App, Query, Hot, When, Player, Origin, BlobUri });
		global["App"] = App;
		global["Query"] = Query;
		global["Hot"] = Hot;
		global["When"] = When;
		global["Player"] = Player;
		global["BlobUri"] = BlobUri;
		global["Mime"] = Mime;
		(global as any)["Origin"] = Origin;
	}
}
