
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
}
