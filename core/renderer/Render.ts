
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
		folderName?: string;
	}
	
	/** */
	export namespace Render
	{
		/** */
		export async function getStandardFiles()
		{
			const files: IRenderedFile[] = [];
			
			// CSS file
			{
				const cssText = Css.createGeneral();
				files.push({
					data: cssText,
					mime: MimeType.css,
					fileName: ConstS.cssFileNameGeneral,
				});
			}
			
			// JS file
			{
				const jsFileText = await readStandardFile(ConstS.jsFileNamePlayer, "utf8");
				
				files.push({
					data: jsFileText,
					mime: MimeType.js,
					fileName: ConstS.jsFileNamePlayer,
				});
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
		export async function getPostFiles(post: PostRecord, blog: Blog)
		{
			const folderName = post === blog.homePost ? "" : post.slug;
			const postFinal = await createPostFinal(post, blog);
			const files: IRenderedFile[] = [];
			
			if (postFinal.scenes.length === 0)
				return files;
			
			// Index HTML file
			{
				const indexEmitter = new IndexHtmlEmitter();
				indexEmitter.addInlineCss(postFinal.cssText);
				const data = indexEmitter.emit(postFinal.scenes[0], folderName ? 1 : 0);
				
				files.push({
					data,
					mime: MimeType.html,
					fileName: ConstS.indexHtmlFileName,
					folderName,
				});
			}
			
			// Indepth HTML file
			if (postFinal.scenes.length > 1)
			{
				const indepthEmitter = new HtmlEmitter();
				const data = indepthEmitter.emit(postFinal.scenes.slice(1));
				
				files.push({
					data,
					mime: MimeType.html,
					fileName: ConstS.essIndepthDefaultFileName,
					folderName,
				});
			}
			
			// Generate any images
			
			const records: MediaRecord[] = [];
			const promises: Promise<ArrayBuffer>[] = [];
			
			for (const record of Model.recurse(post))
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
		export async function createPostPreview(
			post: PostRecord,
			blog: Blog)
		{
			return await (new PostRenderer(post, blog)).render(true);
		}
		
		/**
		 * 
		 */
		async function createPostFinal(
			post: PostRecord,
			blog: Blog)
		{
			return new PostRenderer(post, blog).render(false);
		}
	}
}
