/// <reference path="core/Definitions.ts" />

namespace Build
{
	const Fs = require("fs") as typeof import("fs");
	const Path = require("path") as typeof import("path");
	const Proc = require("child_process") as typeof import("child_process");
	const Terser = require("terser") as typeof import("terser");
	//const fetch = require("node-fetch") as typeof window.fetch;
	
	/** */
	export function copyResources()
	{
		const files = [
			"loki-incremental-indexeddb-adapter.js",
			"loki-incremental-adapter.js",
			"loki-indexed-adapter.js",
			"loki.js",
			"medium-editor.default.min.css",
			"medium-editor.min.css",
			"medium-editor.min.js",
			"index.html",
		];
		
		for (const fileName of files)
			Fs.copyFileSync("./lib/" + fileName, "./build/" + fileName);
	}
	
	/** */
	export async function compilePlayer()
	{
		const buildDir = Path.join(__dirname, "build");
		const playerDir = Path.join(__dirname, "core", "player");
		const tempDir = Path.join(__dirname, "+temp");
		const tsConfigPath = Path.join(tempDir, "tsconfig.json");
		
		if (!Fs.existsSync(tempDir))
			Fs.mkdirSync(tempDir);
		
		// Stores the files to include in the player JS file,
		// with paths relative to the ./core/player directory.
		const copyFiles = [
			...Fs.readdirSync(playerDir),
			"../!.ts",
			"../Definitions.ts",
		];
		
		for (const sourceFileName of copyFiles)
		{
			if (!sourceFileName.endsWith(".ts"))
				continue;
			
			const sourcePath = Path.join(playerDir, sourceFileName);
			const targetPath = Path.join(tempDir, Path.basename(sourcePath));
			Fs.copyFileSync(sourcePath, targetPath);
		}
		
		Fs.writeFileSync(tsConfigPath, JSON.stringify(
			{
				"compilerOptions": {
					"outFile": "./" + ConstS.jsFileName,
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
		
		Proc.execSync("tsc", { cwd: tempDir });
		
		const inJsFilePath = Path.join(tempDir, ConstS.jsFileName);
		const inJsCode = Fs.readFileSync(inJsFilePath, "utf8");
		const result = await Terser.minify(inJsCode);
		const jsCode = result.code || "";
		const outJsFilePathMin = Path.join(buildDir, ConstS.jsFileNameMin);
		const outJsFilePath = Path.join(buildDir, ConstS.jsFileName);
		Fs.writeFileSync(outJsFilePathMin, jsCode);
		Fs.writeFileSync(outJsFilePath, inJsCode);
	}
	
	/** */
	export function deploy()
	{
		copyResources();
		
		
	}
	
	const fnName = process.argv.at(-1) || "";
	Build[fnName]?.();
}

