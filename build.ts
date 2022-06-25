
const Fs = require("fs") as typeof import("fs");
const Path = require("path") as typeof import("path");
const Proc = require("child_process") as typeof import("child_process");
const Terser = require("terser") as typeof import("terser");
//const fetch = require("node-fetch") as typeof window.fetch;

/** */
function copyResources()
{
	const files = [
		"loki-incremental-indexeddb-adapter.js",
		"loki-incremental-adapter.js",
		"loki-indexed-adapter.js",
		"loki.js",
		"index.html",
	];
	
	for (const fileName of files)
		Fs.copyFileSync("./lib/" + fileName, "./build/" + fileName);
}

/** */
function deploy()
{
	copyResources();
	
	
}

eval(process.argv.at(-1) || "");
