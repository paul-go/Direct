
namespace Turf
{
	/** */
	export class LocalPublisher extends Publisher
	{
		/** */
		setSettings(folder: string)
		{
			this.meta.publishDataTable[LocalPublisher.identifier] = { folder };
		}
		
		/** */
		getSettings(): ILocalPublishData
		{
			const id = LocalPublisher.identifier;
			
			if (id in this.meta.publishDataTable)
			{
				const data = this.meta.publishDataTable[id] as any as ILocalPublishData;
				if (data)
					if (data.folder && typeof data.folder === "string")
						return data;
			}
			
			return { folder: "" };
		}
		
		/** */
		deleteSettings()
		{
			delete this.meta.publishDataTable[LocalPublisher.identifier];
		}
		
		/** */
		hasSettings()
		{
			return !!this.getSettings().folder;
		}
		
		/** */
		protected async publishFile(file: IRenderedFile)
		{
			const folder = this.getSettings().folder;
			const folderPath = await this.pathJoin(folder, file.folderName);
			const filePath = await this.pathJoin(folderPath, file.fileName);
			
			if (TAURI)
			{
				await Tauri.fs.createDir(folderPath, { recursive: true });
				
				typeof file.data === "string" ?
					await Tauri.fs.writeFile(filePath, file.data) :
					await Tauri.fs.writeBinaryFile(filePath, file.data);
			}
			else if (ELECTRON)
			{
				const payload = typeof file.data === "string" ?
					file.data : 
					Buffer.from(file.data);
				
				if (!Electron.fs.existsSync(folderPath))
					Electron.fs.mkdirSync(folderPath, { recursive: true });
				
				Electron.fs.writeFileSync(filePath, payload);
			}
		}
	}
	
	/** */
	export interface ILocalPublishData
	{
		folder: string;
	}
	
	setTimeout(() => Publisher.register("local", LocalPublisher));
}
