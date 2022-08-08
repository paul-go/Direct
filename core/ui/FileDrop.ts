
namespace App
{
	let cursorX = 0;
	let cursorY = 0;
	
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
					droppedFile.type as MimeType,
					buffer
				));
			}
			
			return fileLikes;
		}
		
		/** */
		constructor(
			readonly name: string,
			readonly type: MimeType,
			readonly data: ArrayBuffer)
		{ }
	}
	
	/** */
	export function onFileDrop(handler: (
		files: FileLike[],
		layerX: number,
		layerY: number) => void): Htx.Param
	{
		if (TAURI)
		{
			let target: Element | null = null;
			
			Tauri.event.listen("tauri://file-drop", async ev =>
			{
				if (!target)
					return;
				
				if (!document.elementsFromPoint(cursorX, cursorY).includes(target))
					return;
				
				const files: FileLike[] = [];
				const filePaths = ev.payload as string[];
				const byteArrays = await Promise.all(
					filePaths.map(path => Tauri.fs.readBinaryFile(path)));
				
				for (let i = -1; ++i < filePaths.length;)
				{
					const fileName = filePaths[i].split("/").slice(-1)[0];
					const type = MimeType.fromFileName(fileName)
					const data = byteArrays[i];
					files.push(new FileLike(fileName, type, data));
				}
				
				const { x, y } = getLayerCoords(target, cursorX, cursorY);
				handler(files, x, y);
			});
			
			return Htx.on("dragover", ev =>
			{
				ev.preventDefault();
				
				cursorX = ev.clientX;
				cursorY = ev.clientY;
				
				if (!target && ev.currentTarget instanceof Element)
					target = ev.currentTarget;
			});
		}
		
		return () =>
		[
			Htx.on("dragover", ev =>
			{
				ev.preventDefault();
			}),
			Htx.on("drop", async ev =>
			{
				ev.preventDefault();
				const files = await FileLike.fromFiles(ev.dataTransfer?.files);
				
				const { x, y } = getLayerCoords(
					ev.target as Element,
					ev.clientX,
					ev.clientY);
				
				handler(files, x, y);
			})
		];
	}
	
	/** */
	function getLayerCoords(target: Element, clientX: number, clientY: number)
	{
		const box = target.getBoundingClientRect();
		const x = clientX - box.left;
		const y = clientY - box.top;
		return { x, y };
	}
}
