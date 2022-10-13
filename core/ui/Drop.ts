
namespace App
{
	/** */
	export class FileLike
	{
		/** */
		static async fromFiles(files: FileList | null | undefined)
		{
			if (!files)
				return [];
			
			const fileLikes: FileLike[] = [];
			const buffers = await Promise.all(Array.from(files).map(f => f.arrayBuffer()));
			
			for (let i = -1; ++i < files.length;)
			{
				const droppedFile = files[i];
				const buffer = buffers[i];
				
				fileLikes.push(new FileLike(
					droppedFile.name,
					droppedFile.type as Mime.Type,
					buffer
				));
			}
			
			return fileLikes;
		}
		
		/** */
		constructor(
			readonly name: string,
			readonly type: Mime.Type,
			readonly data: ArrayBuffer)
		{ }
	}
	
	/** */
	export namespace Drop
	{
		/** */
		export interface IDropOptions
		{
			accept?: string[];
			dropFn: (files: FileLike[], x: number, y: number) => void;
			center?: Hot.Param | Hot.Param[];
			top?: Hot.Param | Hot.Param[];
			right?: Hot.Param | Hot.Param[];
			bottom?: Hot.Param | Hot.Param[];
			left?: Hot.Param | Hot.Param[];
		}
		
		/** */
		export function here(options: IDropOptions): Hot.Param
		{
			const acceptedMimes = options.accept || [];
			const unlistenFns: (() => void)[] = [];
			const edge = 10;
			const half = `calc(50% - ${edge * 1.5}px)`;
			
			const createDripper = (
				position: "center" | "top" | "right" | "bottom" | "left",
				...params: Hot.Param[]) =>
			{
				const dripper = Hot.div(
					"dripper",
					CssClass.hide,
					UI.flexCenter,
					position === "center" && UI.anchor(edge),
					(position === "top" || position === "bottom") && { height: half },
					(position === "left" || position === "right") && { width: half },
					position === "top" && UI.anchorTop(edge),
					position === "right" && UI.anchorRight(edge),
					position === "bottom" && UI.anchorBottom(edge),
					position === "left" && UI.anchorLeft(edge),
					{
						pointerEvents: "none",
						margin: "auto",
						zIndex: 9,
						backgroundColor: UI.color({ h: 215, s: 80, l: 50, a: 0.85 }),
						borderRadius: UI.borderRadius.large,
						fontSize: "40px",
						fontWeight: 700,
						color: "white"
					},
					...params
				);
				
				return dripper;
			};
			
			const drippers = [
				options.center && createDripper("center", options.center),
				options.top && createDripper("top", options.top),
				options.right && createDripper("right", options.right),
				options.bottom && createDripper("bottom", options.bottom),
				options.left && createDripper("left", options.left),
			].filter((e): e is HTMLDivElement => !!e);
			
			const show = () => drippers.map(d => d.classList.remove(CssClass.hide));
			const hide = () => drippers.map(d => d.classList.add(CssClass.hide));
			
			const params: Hot.Param[] = [
				Hot.on("dragover", ev => ev.preventDefault()),
				Hot.on("drop", ev => ev.preventDefault()),
				Hot.on("dragleave", ev =>
				{
					if (!Query.ancestors(ev.relatedTarget).includes(ev.currentTarget as HTMLElement))
						hide();
				}),
				drippers
			];
			
			if (TAURI)
			{
				params.push(
					e => [
						// file-drop-hover is similar to the dragenter event, but on the window
						void Tauri.event.listen("tauri://file-drop-hover", ev =>
						{
							if (Array.isArray(ev.payload))
							{
								const paths = ev.payload.filter((s): s is string => typeof s === "string");
								const types = paths.map(path => Mime.fromPath(path));
								draggingTypes.length = 0;
								draggingTypes.push(...types);
							}
						})
						.then(e => unlistenFns.push(e)),
						
						void Tauri.event.listen("tauri://file-drop", async ev =>
						{
							if (!document.elementsFromPoint(cursorX, cursorY).includes(e))
								return;
							
							const files: FileLike[] = [];
							const filePaths = ev.payload as string[];
							const byteArrays = await Promise.all(
								filePaths.map(path => Tauri.fs.readBinaryFile(path)));
							
							for (let i = -1; ++i < filePaths.length;)
							{
								const fileName = filePaths[i].split("/").slice(-1)[0];
								const type = Mime.fromPath(fileName);
								if (!acceptedMimes.includes(type))
									continue;
								
								const data = byteArrays[i];
								files.push(new FileLike(fileName, type, data));
							}
							
							const { x, y } = getLayerCoords(e, cursorX, cursorY);
							hide();
							options.dropFn(files, x, y);
						})
						.then(e => unlistenFns.push(e)),
						
						void Tauri.event.listen("tauri://file-drop-cancelled", () =>
						{
							draggingTypes.length = 0;
							hide();
						})
						.then(e => unlistenFns.push(e)),
					],
					
					When.disconnected(() =>
					{
						unlistenFns.map(fn => fn());
						unlistenFns.length = 0;
					}),
					Hot.on("dragenter", ev =>
					{
						if (draggingTypes.some(type => acceptedMimes.includes(type)))
						{
							ev.preventDefault();
							show();
						}
					}),
					Hot.on("dragover", ev =>
					{
						if (draggingTypes.some(type => acceptedMimes.includes(type)))
						{
							ev.preventDefault();
							cursorX = ev.clientX;
							cursorY = ev.clientY;
						}
					})
				);
			}
			else
			{
				params.push(e => [
					Hot.on("dragenter", ev =>
					{
						const types = Array.from(ev.dataTransfer?.items || []).map(item => item.type);
						if (types.some(t => acceptedMimes.includes(t)))
						{
							ev.preventDefault();
							show();
						}
					}),
					Hot.on("drop", async ev =>
					{
						const { x, y } = getLayerCoords(e, ev.clientX, ev.clientY);
						const files = (await FileLike.fromFiles(ev.dataTransfer?.files))
							.filter(f => acceptedMimes.includes(f.type));
						
						hide();
						options.dropFn(files, x, y);
					})
				]);
			};
			
			return params;
		}
	}
	
	/** */
	function getLayerCoords(target: Element, clientX: number, clientY: number)
	{
		const box = target.getBoundingClientRect();
		const x = clientX - box.left;
		const y = clientY - box.top;
		return { x, y };
	}
	
	// Tauri variables
	let cursorX = 0;
	let cursorY = 0;
	const draggingTypes: string[] = [];
}
