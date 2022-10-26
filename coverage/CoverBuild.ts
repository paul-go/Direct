
namespace Cover
{
	const Fs = require("fs") as typeof import("fs");
	const Path = require("path") as typeof import("path");
	const Proc = require("child_process") as typeof import("child_process");
	const Terser = require("terser") as typeof import("terser");
	
	/** */
	export async function coverBuildDev()
	{
		log("Building the development version...");
		
		const emitter = new App.HtmlEmitter();
		const htmlText = emitter.emit([
			Hot.body(),
			Hot.script({ src: ConstS.jsFileNameApp }),
		]);
		
		emitHtml(Dir.build, htmlText);
		const defs = new Defs();
		await emitPlayerJs(Dir.build, defs);
		copyDependencies(Dir.build);
		log("Done.");
	}
	
	/** */
	export async function coverBuildWeb()
	{
		log("Building minified web version...");
		await buildWeb();
	}
	
	/** */
	export async function coverBuildWebDebuggable()
	{
		log("Building non-minified web version...");
		await buildWeb("debuggable");
	}
	
	/** */
	async function buildWeb(debuggable?: "debuggable")
	{
		const homePage = new HomePage();
		const homePageElement = homePage.getElement();
		
		const emitter = new App.HtmlEmitter();
		emitter.title = "Direct";
		emitter.themeColor = "#000000";
		emitter.faviconRoot = "/";
		
		emitHtml(Dir.bundleWeb, emitter.emit([
			Hot.meta({ name: "description", content: "" }),
			Hot.link({ rel: "stylesheet", type: "text/css", href: "/home.css" }),
			Hot.link({ rel: "preconnect", href: "https://fonts.bunny.net" }),
			Hot.link({ rel: "stylesheet", href: "https://fonts.bunny.net/css?family=reggae-one:400" }),
			Hot.body(
				ConstS.launchAppClass,
				homePageElement,
			),
			Hot.script({ src: debuggable ? ConstS.jsFileNameApp : ConstS.jsFileNameAppMin }),
		]));
		
		for (const path of Cover.readDirectory(Dir.home))
			Fs.copyFileSync(path, Dir.bundleWeb + Path.basename(path));
		
		const defs = new Defs();
		await emitAppJs(Dir.bundleWeb, defs);
		await emitPlayerJs(Dir.bundleWeb, defs);
		
		const generalCss = App.Css.createGeneral(true);
		Fs.writeFileSync(Dir.bundleWeb + ConstS.cssFileNameGeneral, generalCss);
		
		const manifest = new App.ManifestJsonEmitter().emit();
		Fs.writeFileSync(Dir.bundleWeb + "manifest.json", manifest);
		
		const faviconPngBlob = Cover.readBlob("resources/icon/icon-16x16.png");
		const faviconEmitter = new App.FaviconEmitter();
		const faviconIcoBlob = await faviconEmitter.emitIco(faviconPngBlob);
		writeBlob(faviconIcoBlob, Dir.bundleWeb, "favicon.ico");
		
		copyDependencies(Dir.bundleWeb);
		log("Done.");
	}
	
	/** */
	export async function coverBuildMac()
	{
		log("Building macOS desktop app (this may take a while)...");
		
		const defs = new Defs({
			TAURI: true,
			MACOS: true,
		});
		
		emitHtmlForDesktop(Dir.bundleMacOS);
		await emitAppJs(Dir.bundleMacOS, defs);
		await emitPlayerJs(Dir.bundleMacOS, defs);
		await emitMacInstaller(Dir.bundleMacOS);
		copyDependencies(Dir.bundleMacOS);
		log("Done.");
	}
	
	/** */
	export async function coverBuildWindows()
	{
		log("Building Windows desktop app (this may take a while)...");
		
		const defs = new Defs({
			TAURI: true,
			WINDOWS: true,
		});
		
		emitHtmlForDesktop(Dir.bundleWindows);
		await emitAppJs(Dir.bundleWindows, defs);
		await emitPlayerJs(Dir.bundleWindows, defs);
		copyDependencies(Dir.bundleWindows);
		log("Done.");
	}
	
	/** */
	export async function coverBuildLinux()
	{
		log("Building Linux desktop app (this may take a while)...");
		
		const defs = new Defs({
			TAURI: true,
			LINUX: true,
		});
		
		emitHtmlForDesktop(Dir.bundleLinux);
		await emitAppJs(Dir.bundleLinux, defs);
		await emitPlayerJs(Dir.bundleLinux, defs);
		copyDependencies(Dir.bundleLinux);
		log("Done.");
	}
	
	/**
	 * Recompiles the player.js file, and writes the updated file to every
	 * folder in the +exports directory (in order to update all test cases)
	 */
	export async function massUpdatePlayerJs()
	{
		const playerJs = await emitPlayerJs();
		const exportsPath = Path.join(Dir.cwd, ConstS.debugExportsFolderName);
		const dirs = Fs.readdirSync(exportsPath);
		
		for (const dir of dirs)
		{
			const fullDir = Path.join(exportsPath, dir);
			if (!Fs.lstatSync(fullDir).isDirectory())
				continue;
			
			const writePath = Path.join(fullDir, ConstS.jsFileNamePlayer);
			Fs.writeFileSync(writePath, playerJs);
			log("Wrote player.js file to: " + writePath);
		}
	}
	
	//# Helper Functions
	
	/** */
	function emitHtmlForDesktop(dir: string)
	{
		const emitter = new App.HtmlEmitter();
		emitHtml(dir, emitter.emit([
			Hot.body(),
			Hot.script({ src: ConstS.jsFileNameApp }),
		]));
	}
	
	/** */
	function copyDependencies(targetDirectory: string)
	{
		const copyOne = (dir: string, fileName: string) =>
		{
			const targetPath = Path.join(targetDirectory, fileName);
			const sourcePath = Path.join(dir, fileName);
			Fs.copyFileSync(sourcePath, targetPath);
			log("Copied dependency to: " + targetPath);
		}
		
		for (const jsFile of Fs.readdirSync(Dir.lib))
			if (jsFile.endsWith(".js"))
				copyOne(Dir.lib, jsFile);
		
		for (const fontFile of Fs.readdirSync(Dir.fonts))
			copyOne(Dir.fonts, fontFile);
		
		for (const iconFile of Fs.readdirSync(Dir.icon))
			copyOne(Dir.icon, iconFile);
	}
	
	/** */
	async function emitMacInstaller(saveDirectory: string)
	{
		Fs.mkdirSync(saveDirectory, { recursive: true });
		
		log("Writing macOS app bundle. This may take a while...");
		Proc.execSync("npm run tauri build");
		
		const files = Fs.readdirSync(Dir.tauriDmg, "utf8").filter(name => name.endsWith(".dmg"));
		
		for (const file of files)
		{
			Fs.copyFileSync(
				Path.join(Dir.tauriDmg, file),
				Path.join(saveDirectory, file));
		}
	}
	
	/** */
	async function emitWindowsInstaller(saveDirectory: string)
	{
		Fs.mkdirSync(saveDirectory, { recursive: true });
		
	}
	
	/** */
	function emitHtml(saveDirectory: string, htmlText: string)
	{
		Fs.mkdirSync(saveDirectory, { recursive: true });
		const targetPath = Path.join(saveDirectory, ConstS.indexHtmlFileName);
		Fs.writeFileSync(targetPath, htmlText);
		log("Wrote HTML file to: " + targetPath);
	}
	
	/** */
	async function emitAppJs(saveDirectory: string, defs?: Defs)
	{
		Fs.mkdirSync(saveDirectory, { recursive: true });
		
		Proc.execSync("tsc");
		const inJsFilePath = Path.join(Dir.build, ConstS.jsFileNameApp);
		replaceConsts(inJsFilePath);
		
		const date = new Date();
		const inJsCode = Fs.readFileSync(inJsFilePath, "utf8")
			// Assign the build message
			.replace(
				/const\s+consoleWelcomeMessage\s*=\s*""/g,
				`const consoleWelcomeMessage = ` +
				`"Welcome to Direct. Last updated: ${date.toDateString()} ${date.toLocaleTimeString()}"`);
		
		const targetPath = Path.join(saveDirectory, ConstS.jsFileNameApp);
		Fs.writeFileSync(targetPath, inJsCode);
		log("Wrote App JS file to: " + targetPath);
		
		if (defs)
		{
			const minifiedCode = await minify(inJsCode, defs);
			const targetPathMin = Path.join(saveDirectory, ConstS.jsFileNameAppMin);
			Fs.writeFileSync(targetPathMin, minifiedCode);
			log("Wrote App JS file to: " + targetPathMin);
		}
	}
	
	/** */
	export async function emitPlayerJs(saveDirectory?: string, defs?: Defs)
	{
		if (saveDirectory)
			Fs.mkdirSync(saveDirectory, { recursive: true });
		
		Fs.mkdirSync(Dir.temp, { recursive: true });
		
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
		
		const tsConfigPlayerPath = Path.join(Dir.player, "tsconfig.player.json");
		if (!Fs.existsSync(tsConfigPlayerPath))
			throw "File doesn't exist: " + tsConfigPlayerPath;
		
		const tsConfigText = Fs.readFileSync(tsConfigPlayerPath, "utf-8");
		const tsConfigJson = (new Function("return " + tsConfigText))();
		tsConfigJson.compilerOptions.outFile = "./" + ConstS.jsFileNamePlayer;
		const tsConfigOutPath = Path.join(Dir.temp, "tsconfig.json");
		Fs.writeFileSync(tsConfigOutPath, JSON.stringify(tsConfigJson, null, "\t"));
		Proc.execSync("tsc", { cwd: Dir.temp });
		
		const inJsFilePath = Path.join(Dir.temp, ConstS.jsFileNamePlayer);
		replaceConsts(inJsFilePath);
		
		const inJsCode = Fs.readFileSync(inJsFilePath, "utf8");
		
		if (saveDirectory)
		{
			const outJsFilePath = Path.join(saveDirectory, ConstS.jsFileNamePlayer);
			Fs.writeFileSync(outJsFilePath, inJsCode);
			log("Wrote Player JS file to: " + outJsFilePath);
			Fs.rmdirSync(Dir.temp, { recursive: true });
		}
		
		if (defs)
		{
			const minifiedCode = await minify(inJsCode, defs);
			if (saveDirectory)
			{
				const outJsFilePathMin = Path.join(saveDirectory, ConstS.jsFileNamePlayerMin);
				Fs.writeFileSync(outJsFilePathMin, minifiedCode);
				log("Wrote Player JS file to: " + outJsFilePathMin);
				return minifiedCode;
			}
		}
		
		return inJsCode;
	}
	
	/**
	 * Changes all const enum values in the specified JavaScript file to their "live" variants. 
	 * A value's live variant is determined by taking the name of the constant and appending
	 * the "Live" suffix.
	 */
	export function replaceConsts(jsFilePath: string)
	{
		log("Fixing constants for file: " + jsFilePath);
		
		const constFileText = readDirectory(Dir.constants)
			.map(path => Fs.readFileSync(path, "utf8"))
			.join("\n");
		
		const reg = /\n\s+([a-z0-9]+)\s*=\s*"(.+)"/gi;
		const matches = Array.from(constFileText.matchAll(reg));
		const defaultConsts = new Map<string, string>();
		const liveConsts = new Map<string, string>();
		
		for (const match of matches)
		{
			const name = match[1];
			const value = match[2];
			
			defaultConsts.set(name, value);
			
			if (name.endsWith("Live"))
				liveConsts.set(name.slice(0, -4), value);
			else
				defaultConsts.set(name, value);
		}
		
		const consts = new Map<string, { default: string, live: string }>();
		
		for (const [key, defaultValue] of Array.from(defaultConsts.entries()))
		{
			const liveValue = liveConsts.get(key) || "";
			if (liveConsts.has(key))
				consts.set(key, { default: defaultValue, live: liveValue });
		}
		
		let jsCode = Fs.readFileSync(jsFilePath, "utf8");
		
		for (const [key, values] of Array.from(consts.entries()))
		{
			const reg = new RegExp(`"([^"]+)" \\/\\* ConstS.${key} \\*\\/`, "g");
			jsCode = jsCode.replace(reg, `"${values.live}"`);
		}
		
		Fs.writeFileSync(jsFilePath, jsCode, "utf8");
	}
	
	/** */
	async function minify(jsCode: string, defs: Defs)
	{
		const minified = await Terser.minify(jsCode, {
			compress: {
				unsafe_math: true,
				global_defs: defs
			},
			sourceMap: false,
		});
		
		return minified.code || "";
	}
	
	/** */
	export function log(value: string)
	{
		console.log(value);
		
		if (typeof document !== "undefined")
		{
			const logDiv = Hot.div(
				{
					padding: "10px",
					margin: "10px",
					backgroundColor: "#EEE",
					fontFamily: "sans-serif",
					fontSize: "20px"
				},
				new Text(value)
			);
			
			document.body.style.backgroundColor = "white";
			document.body.style.color = "black";
			document.body.append(logDiv);
			setTimeout(() => logDiv.scrollIntoView({ behavior: "smooth" }));
		}
	}
	
	/** */
	export namespace Dir
	{
		export const cwd = process.cwd() + "/";
		export const build = cwd + "build/";
		export const player = cwd + "core/player/";
		export const temp = cwd + "+/";
		export const bundle = cwd + "+bundle/";
		export const tauriDmg = cwd + "src-tauri/target/release/bundle/dmg/";
		export const constants = cwd + "const/";
		export const lib = cwd + "lib/";
		export const resources = cwd + "resources/";
		export const fonts = resources + "fonts/";
		export const home = resources + "home/";
		export const icon = resources + "icon/";
		export const bundleWeb = bundle + "web/";
		export const bundleMacOS = bundle + "macOS/";
		export const bundleWindows = bundle + "windows/";
		export const bundleLinux = bundle + "linux/";
		export const bundleIOS = bundle + "iOS/";
		export const bundleAndroid = bundle + "android/";
	};
	
	/** */
	export class Defs
	{
		readonly DEBUG: boolean = false;
		readonly ELECTRON: boolean = false;
		readonly TAURI: boolean = false;
		readonly WINDOWS: boolean = false;
		readonly MACOS: boolean = false;
		readonly LINUX: boolean = false;
		readonly IOS: boolean = false;
		readonly ANDROID: boolean = false;
		
		/** */
		constructor(defs: Partial<Defs> = {})
		{
			Object.assign(this, defs);
		}
	}
}
