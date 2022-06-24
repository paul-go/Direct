
namespace Cover
{
	/** */
	export function coverDefault()
	{
		let a: HTMLDivElement;
		let b: HTMLDivElement;
		let c: HTMLDivElement;
		
		const sec = Htx.section(
			a = Htx.div(),
			b = Htx.div(),
			c = Htx.div(),
		);
		
		document.body.append(sec);
		
		new MutationObserver(records =>
		{
			debugger;
			
			for (const rec of records)
			{
				
			}
			
		}).observe(sec, {
			childList: true
		});
		
		setTimeout(() =>
		{
			sec.append(a);
		},
		400);
		
	}
	
	declare const loki: typeof import("lokijs");
	
	/** */
	export async function coverLoki()
	{
		await Fn.include("/lib/lokijs.js");
		await Fn.include("/lib/loki-indexed-adapter.js");
		await Fn.include("/lib/loki-incremental-adapter.js");
		await Fn.include("/lib/incremental-indexeddb-adapter.js");
		
		const db = new loki("test", {
			
		});
		
		db.collections[0]
		
		const users = db.addCollection("users", {
			
		});
		
		
	}
}
