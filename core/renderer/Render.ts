
namespace App
{
	/** */
	export interface IRenderedFile
	{
		data: string | ArrayBuffer;
		mime: MimeType;
		fileName: string;
		
		/**
		 * Stores the sub-folder within the file system space where 
		 * the rendered file should be written.
		 */
		folderName: string;
	}
	
	/** */
	export namespace Render
	{
		/** */
		export async function getSupportFiles()
		{
			const files: IRenderedFile[] = [];
			
			// CSS file
			{
				const cssText = App.createGeneralCssText();
				files.push({
					data: cssText,
					mime: MimeType.css,
					fileName: ConstS.cssFileNameGeneral,
					folderName: "",
				});
			}
			
			// JS file
			{
				const jsFileText = await readStandardFile(ConstS.jsFileNamePlayer, "utf8");
				
				files.push({
					data: jsFileText,
					mime: MimeType.js,
					fileName: ConstS.jsFileNamePlayer,
					folderName: "",
				});
			}
			
			// Text Contrast Images
			{
				const blurBlack = await readStandardFile(ConstS.textContrastBlackName);
				const blurWhite = await readStandardFile(ConstS.textContrastWhiteName);
				
				files.push(
					{
						data: blurBlack,
						mime: MimeType.png,
						fileName: ConstS.textContrastBlackName,
						folderName: "",
					},
					{
						data: blurWhite,
						mime: MimeType.png,
						fileName: ConstS.textContrastWhiteName,
						folderName: "",
					}
				);
			}
			
			return files;
		}
		
		/** */
		async function readStandardFile(fileName: string, encoding?: "utf8"): Promise<string | ArrayBuffer>
		{
			if (ELECTRON)
			{
				const path = Electron.path.join(__dirname, fileName);
				return Electron.fs.readFileSync(path, encoding);
			}
			else
			{
				try
				{
					const result = await fetch(fileName);
					return encoding ? 
						await result.text() :
						await result.arrayBuffer();
				}
				catch (e) { }
			}
			
			return "";
		}
		
		/** */
		export async function getPostFiles(post: PostRecord, meta: MetaRecord)
		{
			const files: IRenderedFile[] = [];
			const folderName = post === meta.homePost ? "" : post.slug;
			
			// HTML file
			{
				const storyDiv = Render.createPostFinal(post, meta);
				const htmlFile = new HtmlFile();
				const htmlText = htmlFile.emit(storyDiv, folderName ? 1 : 0);
				
				files.push({
					data: htmlText,
					mime: MimeType.html,
					fileName: ConstS.htmlFileName,
					folderName,
				});
			}
			
			// Generate any images
			
			const records: MediaRecord[] = [];
			const promises: Promise<ArrayBuffer>[] = [];
			
			for (const record of Util.eachDeepRecord(post))
			{
				if (record instanceof MediaRecord)
				{
					records.push(record);
					promises.push(record.blob.arrayBuffer());
				}
			}
			
			const buffers = await Promise.all(promises);
			
			for (let i = -1; ++i < records.length;)
			{
				const record = records[i];
				const buffer = buffers[i];
				files.push({
					data: buffer,
					mime: record.type,
					fileName: record.name,
					folderName,
				});
			}
			
			return files;
		}
		
		/**
		 * 
		 */
		export function createPostPreview(
			post: PostRecord,
			meta: MetaRecord)
		{
			return new PostRenderer(post, meta, true).render();
		}
		
		/**
		 * 
		 */
		export function createPostFinal(
			post: PostRecord,
			meta: MetaRecord)
		{
			return new PostRenderer(post, meta, false).render();
		}
	}
	
	/**
	 * 
	 */
	class PostRenderer
	{
		/** */
		constructor(
			private readonly post: PostRecord,
			private readonly meta: MetaRecord,
			private readonly isPreview: boolean)
		{ }
		
		/** */
		render()
		{
			return Hot.div(
				"story",
				...this.post.scenes.flatMap(scene =>
				{
					if (scene instanceof CanvasSceneRecord)
						return new CanvasSceneRenderer(scene, this.meta, this.isPreview).render();
					
					else if (scene instanceof GallerySceneRecord)
						return new GallerySceneRenderer(scene, this.meta, this.isPreview).render();
					
					else if (scene instanceof ProseSceneRecord)
						return new ProseSceneRenderer(scene, this.meta, this.isPreview).render();
				})
			);
		}
	}
}
