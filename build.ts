/// <reference path="core/Definitions.ts" />

namespace Build
{
	const Fs = require("fs") as typeof import("fs");
	const Path = require("path") as typeof import("path");
	const Proc = require("child_process") as typeof import("child_process");
	const Terser = require("terser") as typeof import("terser");
	
	/** */
	export namespace Dir
	{
		export const build = Path.join(__dirname, "build");
		export const player = Path.join(__dirname, "core", "player");
		export const temp = Path.join(__dirname, "+");
	};
	
	/** */
	export function emitHtml()
	{
		const lines = [
			`<!DOCTYPE html>`,
			`<html lang="en-us" data-autostart>`,
			`<meta charset="utf-8">`,
			`<meta name="theme-color" content="#000000">`,
			`<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">`,
			`<meta name="apple-mobile-web-app-capable" content="yes">`,
			`<script src="${ConstS.jsFileNameApp}"></script>`,
			`</html>`
		].join("\n");
		
		Fs.writeFileSync(Path.join(Dir.build, "index.html"), lines);
	}
	
	/** */
	export async function compilePlayer()
	{
		if (!Fs.existsSync(Dir.temp))
			Fs.mkdirSync(Dir.temp);
		
		// Stores the files to include in the player JS file,
		// with paths relative to the ./core/player directory.
		const copyFiles = [
			...Fs.readdirSync(Dir.player),
			"../!.ts",
			"../Definitions.ts",
		];
		
		for (const sourceFileName of copyFiles)
		{
			if (!sourceFileName.endsWith(".ts"))
				continue;
			
			const sourcePath = Path.join(Dir.player, sourceFileName);
			const targetPath = Path.join(Dir.temp, Path.basename(sourcePath));
			Fs.copyFileSync(sourcePath, targetPath);
		}
		
		const tsConfigPath = Path.join(Dir.temp, "tsconfig.json");
		Fs.writeFileSync(tsConfigPath, JSON.stringify(
			{
				"compilerOptions": {
					"outFile": "./" + ConstS.jsFileNamePlayer,
					"module": "system",
					"moduleResolution": "node",
					"declaration": false,
					"target": "es5",
				},
				"include": [
					"*.ts"
				]
			},
			null, "\t"));
		
		Proc.execSync("tsc", { cwd: Dir.temp });
		
		const inJsFilePath = Path.join(Dir.temp, ConstS.jsFileNamePlayer);
		const inJsCode = Fs.readFileSync(inJsFilePath, "utf8");
		const result = await Terser.minify(inJsCode);
		const jsCode = result.code || "";
		const outJsFilePathMin = Path.join(Dir.build, ConstS.jsFileNamePlayerMin);
		const outJsFilePath = Path.join(Dir.build, ConstS.jsFileNamePlayer);
		Fs.writeFileSync(outJsFilePathMin, jsCode);
		Fs.writeFileSync(outJsFilePath, inJsCode);
		Fs.rmdirSync(Dir.temp, { recursive: true });
	}
}

globalThis.Build = Build;

// Function runner
setTimeout(() =>
{
	const args = process.argv.slice(process.argv.findIndex(s => s.startsWith(__dirname)) + 1);
	const fnName = args.shift() || "";
	const fn = (globalThis.Build as any)[fnName];
	
	if (typeof fn === "function")
	{
		fn(...args);
		console.log("Build function executed: " + fnName);
	}
	else
	{
		console.error("Build function not found: " + fnName);
	}
},
10);
