
namespace Fn
{
	/**
	 * Loads the specified JavaScript code file into the browser,
	 * if it has not already done so.
	 */
	export async function include(src: string)
	{
		if (includedScripts.has(src))
			return;
		
		includedScripts.add(src);
		
		if (DEBUG && ELECTRON)
			src = "file://" + __dirname + src;
		
		return new Promise<void>(resolve =>
		{
			const script = document.createElement("script");
			script.src = src;
			script.onload = () =>
			{
				script.remove();
				resolve();
			};
			document.body.append(script);
		});
	}
	const includedScripts = new Set<string>();
}

if (typeof module === "object")
{
	Object.assign(module.exports, { Fn });
	global["Fn"] = Fn;
}
