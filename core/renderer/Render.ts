
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
		export async function getPostFiles(post: PostRecord, blog: Blog)
		{
			const files: IRenderedFile[] = [];
			const folderName = post === blog.homePost ? "" : post.slug;
			
			// HTML file
			{
				const postFinal = await createPostFinal(post, blog);
				const htmlFile = new HtmlFile();
				htmlFile.addCss(postFinal.cssText);
				const htmlText = htmlFile.emit(postFinal.storyElement, folderName ? 1 : 0);
				
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
			return await (new PostRenderer(post, blog, true)).render();
		}
		
		/**
		 * 
		 */
		async function createPostFinal(
			post: PostRecord,
			blog: Blog)
		{
			return new PostRenderer(post, blog, false).render();
		}
	}
	
	/**
	 * 
	 */
	export class PostRenderer
	{
		/** */
		constructor(
			readonly post: PostRecord,
			readonly blog: Blog,
			readonly isPreview: boolean)
		{ }
		
		/** */
		async render()
		{
			const scenes: any[] = [];
			const classGenerator = new CssClassGenerator();
			const rules: (Css.VirtualCssMediaQuery | Css.VirtualCssRule)[] = [];
			
			for (const scene of this.post.scenes)
			{
				const renderer = 
					scene instanceof CanvasSceneRecord ?
						new CanvasSceneRenderer(scene, this.isPreview) :
					
					scene instanceof GallerySceneRecord ?
						new GallerySceneRenderer(scene, this.isPreview) :
				
					scene instanceof ProseSceneRecord ?
						new ProseSceneRenderer(scene, this.isPreview) : null;
				
				if (!renderer)
					continue;
				
				renderer.classGenerator = classGenerator;
				scenes.push(await renderer.render());
				rules.push(...renderer.cssRules);
			}
			
			const storyElement = Hot.div("story", scenes);
			const cssText = rules.join("\n");
			
			return {
				storyElement,
				cssText,
			};
		}
	}
}
