
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
				const cssText = Css.createGeneral();
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
			const files: IRenderedFile[] = [];
			const folderName = post === blog.homePost ? "" : post.slug;
			
			// HTML file
			{
				const postFinal = await createPostFinal(post, blog);
				const htmlFile = new HtmlFile();
				htmlFile.addCss(postFinal.cssText);
				const htmlText = htmlFile.emit(postFinal.scenes, folderName ? 1 : 0);
				
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
		
		/**
		 * Rasterizes the specified HTML content to a CanvasRenderingContext2D,
		 * whose dimensions are equal to the specified viewport width and height.
		 */
		export async function rasterizeHtml(
			html: string | HTMLElement,
			viewportWidth: number,
			viewportHeight: number)
		{
			const htmlContent = typeof html === "string" ? html : html.outerHTML;
			const image = new Image();
			const [w, h] = [viewportWidth, viewportHeight];
			const canvas = Hot.canvas({ width: w, height: h });
			const ctx = canvas.getContext("2d")!;
			const svgText = 
				`<svg xmlns="http://www.w3.org/2000/svg" width="${w}px" height="${h}px">` +
					`<foreignObject width="100%" height="100%">` +
						`<div xmlns="http://www.w3.org/1999/xhtml">` +
							htmlContent +
						`</div>` +
					`</foreignObject>` +
				`</svg>`;
			
			return new Promise<CanvasRenderingContext2D>(resolve =>
			{
				image.onload = () =>
				{
					ctx.drawImage(image, 0, 0, w, h);
					resolve(ctx);
				};
				
				image.src = `data:image/svg+xml;charset=utf-8,` + svgText;
			});
		}
	}
}
