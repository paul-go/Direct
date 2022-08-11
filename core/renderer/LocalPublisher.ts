
namespace App
{
	/** */
	export class LocalPublisher extends Publisher
	{
		/** */
		constructor(post: PostRecord, meta: MetaRecord)
		{
			super(post, meta);
			
			this.root = Htx.div(
				"local-publisher",
				
				this.renderTitle("Publish folder:"),
				
				this.saveLocationElement = Htx.div(
					{
						padding: "10px 0",
						margin: "20px 0",
						overflow: "auto",
						whiteSpace: "nowrap",
						border: "3px solid " + UI.gray(70),
						borderRadius: UI.borderRadius.default,
						backgroundColor: "black",
						textIndent: "10px"
					},
					...UI.text(this.folder, 20)
				),
				
				this.renderActionButton("Change Publish Folder", () =>
				{
					this.requestSaveLocation();
				}),
				
				this.renderPublishButton(),
			);
		}
		
		readonly root;
		readonly key = "local";
		readonly label = "My Device";
		private readonly saveLocationElement;
		
		/** */
		async shouldInsert()
		{
			if (this.folder)
				return true;
			
			const loc = await this.requestSaveLocation();
			return !!loc;
		}
		
		/** */
		private async requestSaveLocation()
		{
			let saveFolder = "";
			
			if (ELECTRON)
			{
				const exportsFolder = getExportsFolder();
				const result = confirm("Set save location to exports folder?");
				
				if (result)
					saveFolder = exportsFolder;
			}
			else if (TAURI)
			{
				const dialogResult = await Tauri.dialog.open({
					recursive: true,
					directory: true,
					multiple: false,
					defaultPath: saveFolder || undefined // Prevents Tauri crash
				});
				
				if (typeof dialogResult === "string")
					saveFolder = dialogResult;
			}
			
			if (saveFolder)
				this.folder = saveFolder;
			
			return !!saveFolder;
		}
		
		/** */
		get folder()
		{
			return this.meta.getPublishParam(this.key, "folder", "");
		}
		set folder(folder: string)
		{
			this.setPublishParam("folder", folder);
			this.saveLocationElement.textContent = folder;
		}
		
		/** */
		getPublishDestinationRoot()
		{
			let f = this.folder;
			return f.endsWith("/") ? f : f + "/";
		}
		
		/** */
		protected async executePublish(files: IRenderedFile[])
		{
			for (const file of files)
			{
				const folderPath = await this.pathJoin(this.folder, file.folderName);
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
			
			return "";
		}
	}
	
	setTimeout(() =>
	{
		Publisher.register(LocalPublisher, 2);
	});
}
