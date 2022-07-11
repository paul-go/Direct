
declare const DEBUG: boolean;
declare const ELECTRON: boolean;

// The globalThis value isn't available in Safari, so a polyfill is necessary:
if (typeof globalThis === "undefined")
	(window as any).globalThis = window;

// If the DEBUG flag is undefined, that means that the executing code
// has not passed through terser, and so we are either running in a
// cover function, or in one of the hosts in debug mode. In this case,
// we set the compilation constants explicitly at runtime.
if (typeof DEBUG === "undefined")
	Object.assign(globalThis, { DEBUG: true });

if (typeof ELECTRON === "undefined")
	Object.assign(globalThis, { ELECTRON: typeof screen + typeof require === "objectfunction" });

namespace Turf
{
	if (DEBUG && typeof module === "object")
	{
		Object.assign(module.exports, { Turf, Query });
		global["Turf"] = Turf;
		global["Query"] = Query;
	}
}
