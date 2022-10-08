
namespace Cover
{
	/** */
	export async function coverHistory()
	{
		Player.History.triggerProgrammaticEvents = true;
		
		// The browser surface needs to be interacted with,
		// otherwise, popstate events will not fire.
		await new Promise<void>(resolve =>
		{
			document.body.append(Hot.button(
				new Text("Begin"),
				Hot.on("click", () => resolve())
			));
		});
		
		const capturedHistory: string[] = [];
		const slug0 = "/slug-0";
		const slug1 = "/slug-1";
		const slug2 = "/slug-2";
		const slugX = "/slug-X";
		const slugY = "/slug-Y";
		
		Player.History.on("back", () =>
		{
			capturedHistory.push(history.state?.slug || "");
			console.log("Back - " + JSON.stringify(history.state));
		});
		
		Player.History.on("forward", () =>
		{
			capturedHistory.push(history.state?.slug || "");
			console.log("Forward - " + JSON.stringify(history.state));
		});
		
		const goBack = async () =>
		{
			await new Promise<void>(r => setTimeout(r, 10));
			Player.History.back();
			await new Promise<void>(r => setTimeout(r, 10));
		};
		
		const goForward = async () =>
		{
			await new Promise<void>(r => setTimeout(r, 10));
			Player.History.forward();
			await new Promise<void>(r => setTimeout(r, 10));
		};
		
		const push = async (slug: string) =>
		{
			await new Promise<void>(r => setTimeout(r, 10));
			Player.History.push(slug);
			await new Promise<void>(r => setTimeout(r, 10));
		};
		
		await push(slug0);
		await push(slug1);
		await push(slug2);
		
		await goBack(); // 1
		await goBack(); // 0
		await goBack(); // -1 (null)
		await goBack(); // -1 (no change)
		await goForward(); // 0
		await goForward(); // 1
		await goForward(); // 2 (no change)
		await goBack(); // 1
		await goBack(); // 0
		await goBack(); // null
		
		// Erase the forward history
		await push(slugX);
		await push(slugY);
		
		await goBack(); // X
		await goBack(); // null
		await goForward(); // X
		await goForward(); // Y
		await goForward(); // Y (no change)
		
		const expected = [
			slug1,
			slug0,
			"",
			slug0,
			slug1,
			slug2,
			slug1,
			slug0,
			"",
			slugX,
			"",
			slugX,
			slugY,
		];
		
		return () => capturedHistory.join() === expected.join();
	}
}
