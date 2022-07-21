
namespace Turf
{
	/** */
	export class S3Publisher extends Publisher
	{
		/** */
		setSettings(url: string, accessKey: string, secretKey: string)
		{
			this.meta.publishDataTable[S3Publisher.identifier] = { url, accessKey, secretKey };
		}
		
		/** */
		getSettings(): IS3PublishData
		{
			const id = S3Publisher.identifier;
			
			if (id in this.meta.publishDataTable)
			{
				const data = this.meta.publishDataTable[id] as any as IS3PublishData;
				if (data)
					return data;
			}
			
			return { url: "", accessKey: "", secretKey: "" };
		}
		
		/** */
		hasSettings()
		{
			const settings = this.getSettings();
			return !!settings.url && !!settings.accessKey && !!settings.secretKey;
		}
		
		/** */
		deleteSettings()
		{
			delete this.meta.publishDataTable[S3Publisher.identifier];
		}
		
		/** */
		protected async publishFile(file: IRenderedFile)
		{
			
		}
	}
	
	/** */
	export interface IS3PublishData
	{
		url: string;
		accessKey: string;
		secretKey: string;
	}
	
	setTimeout(() => Publisher.register("S3 Storage", S3Publisher));
}
