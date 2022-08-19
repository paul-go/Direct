
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
			return renderPost(post, meta, true);
		}
		
		/**
		 * 
		 */
		export function createPostFinal(
			post: PostRecord,
			meta: MetaRecord)
		{
			return renderPost(post, meta, false);
		}
	}
	
	/**
	 * 
	 */
	class Bundle<T extends SceneRecord = SceneRecord>
	{
		constructor(
			readonly scene: T,
			readonly meta: MetaRecord,
			readonly isPreview: boolean)
		{ }
		
		/** */
		getMediaUrl(media: MediaRecord, css?: "css")
		{
			if (this.isPreview)
				return css ? media.getBlobCssUrl() : media.getBlobUrl();
			
			const url = media.getHttpUrl();
			return css ? `url(${url})` : url;
		}
		
		/** */
		useAnimation(animationName: string)
		{
			const animation = Animation.fromName(animationName);
			this.usedTransitions.add(animation);
			return animationName;
		}
		
		readonly usedTransitions = new Set<Animation>();
	}
	
	/**
	 * 
	 */
	function renderPost(
		post: PostRecord,
		meta: MetaRecord,
		isPreview: boolean)
	{
		return Htx.div(
			"story",
			...post.scenes.flatMap(scene => renderScene(new Bundle(scene, meta, isPreview)))
		);
	}
	
	/**
	 * 
	 */
	function renderScene(bun: Bundle)
	{
		const foregroundColor = RenderUtil.resolveForegroundColor(
			bun.scene.backgroundColorIndex, 
			bun.meta);
		
		const backgroundColor = RenderUtil.resolveBackgroundColor(
			bun.scene.backgroundColorIndex, 
			bun.meta);
		
		let snapFooter: HTMLElement | null = null;
		const includeSnapFooter = () => snapFooter = Htx.div(CssClass.snapFooter);
		
		const sceneParams = (() =>
		{
			if (bun.scene instanceof CanvasSceneRecord)
				return renderCanvasScene(bun as Bundle<CanvasSceneRecord>);
			
			if (bun.scene instanceof ProseSceneRecord)
			{
				includeSnapFooter();
				return renderProseScene(bun as Bundle<ProseSceneRecord>);
			}
			
			if (bun.scene instanceof GallerySceneRecord)
				return renderGalleryScene(bun as Bundle<GallerySceneRecord>);
			
			return [];
		})();
		
		return [
			Htx.section(
				CssClass.scene,
				{
					color: UI.color(foregroundColor),
					backgroundColor: UI.color(backgroundColor),
					height: "100vh",
					data: {
						[DataAttributes.transition]: bun.useAnimation(bun.scene.transition)
					}
				},
				...sceneParams
			),
			snapFooter,
		];
	}
	
	/**
	 * 
	 */
	function renderCanvasScene(bun: Bundle<CanvasSceneRecord>)
	{
		const scene = bun.scene;
		const out: Htx.Param[] = [
			CssClass.canvasScene
		];
		
		// Background
		out.push(...scene.backgrounds.map(bg =>
		{
			if (bg.media)
			{
				const cls = MimeType.getClass(bg.media.type);
				if (cls === MimeClass.image)
				{
					return Htx.div(
						CssClass.canvasSceneBackground,
						{
							backgroundImage: "url(" + bun.getMediaUrl(bg.media) + ")",
							backgroundPosition: `${bg.position[0]}% ${bg.position[1]}%`,
						},
						bg.size === -1 ?
							{
								backgroundSize: "cover"
							} :
							{
								maxWidth: ConstN.playerMaxWidth + "px",
								margin: "auto",
								backgroundSize: 
									`min(${ConstN.playerMaxWidth}px, ${bg.size}vmin) `
							}
					);
				}
				else if (cls === MimeClass.video)
				{
					return Htx.video(
						CssClass.canvasSceneBackground,
						{
							src: bun.getMediaUrl(bg.media),
							autoplay: true,
							controls: false,
							loop: true,
							playsInline: true,
						}
					);
				}
			}
		}).filter(b => !!b));
		
		// Foreground
		if (scene.titles.length > 0 || scene.description.length > 0 || scene.actions.length > 0)
		{
			const fg = Htx.div(
				CssClass.canvasSceneForeground,
				{
					data: {
						[DataAttributes.transition]: bun.useAnimation(scene.effect)
					},
				},
			);
			
			const island = Htx.div(CssClass.canvasSceneIsland, scene.origin);
			
			if (scene.textContrast)
				RenderUtil.setContrast(island, scene.textContrast);
			
			if (scene.twist !== 0)
				island.style.transform = `rotate(${scene.twist}deg)`;
			
			const islandElements: HTMLElement[] = [];
			
			if (scene.contentImage)
			{
				islandElements.push(Htx.img(
					CssClass.canvasSceneContentImage,
					{ src: bun.getMediaUrl(scene.contentImage) }
				));
			}
			
			if (scene.titles.length > 0)
			{
				const h2 = Htx.h2();
				
				const render = (title: ITitle) => [
					UI.specificWeight(title.weight),
					{ fontSize: UI.vsizePlayer(title.size) },
					new Text(title.text)
				];
				
				if (scene.titles.length === 1)
					Htx.from(h2)(...render(scene.titles[0]));
				
				else for (const title of scene.titles)
					h2.append(Htx.div(...render(title)));
				
				islandElements.push(h2);
			}
			
			if (scene.description.length > 0)
			{
				island.style.fontSize = UI.vsizePlayer(scene.descriptionSize);
				islandElements.push(...convertDescriptionToParagraphs(scene));
			}
			
			if (scene.actions.length > 0)
			{
				const actionsElement = Htx.div(
					CssClass.canvasActions,
					scene.actions.map(action => Htx.a(
						CssClass.canvasAction,
						scene.actionShape,
						action.filled ? 
							CssClass.canvasActionFilled :
							CssClass.canvasActionOutlined,
						{
							href: typeof action.target === "string" ? action.target || "#" : "#"
						},
						new Text(action.text)
					))
				);
				
				if (islandElements.length > 0)
				{
					const lastElement = islandElements.pop()!;
					islandElements.push(Htx.div(
						CssClass.inheritMargin,
						lastElement,
						actionsElement
					));
				}
				else islandElements.push(actionsElement);
			}
			
			if (islandElements.length > 0)
			{
				island.append(...islandElements);
				fg.append(island);
			}
			
			out.push(fg);
		}
		
		return out;
	}
	
	/** */
	function convertDescriptionToParagraphs(scene: CanvasSceneRecord)
	{
		const groups = scene.description
			.split("\n")
			.map(line => line.trimEnd())
			.join("\n")
			.split(/\n\s*\n/g)
			.map(s => s.split("\n"));
		
		const paragraphs: HTMLParagraphElement[] = [];
		for (const group of groups)
		{
			const p = Htx.p();
			
			for (let i = -1; ++i < group.length;)
			{
				const line = group[i];
				p.append(new Text(line));
				
				if (i < group.length - 1)
					p.append(Htx.br());
			}
			
			paragraphs.push(p);
		}
		
		return paragraphs;
	}
	
	/**
	 * Unused code. This was another attempt to convert descriptions
	 * that were created from content-editable HTML divs into the
	 * HTML format necessary for preview.
	 */
	function convertHtmlDescriptionToParagraphs(scene: CanvasSceneRecord)
	{
		interface IRegion { text: string, bold: boolean; href: string }
		const regions: IRegion[] = [];
		const empty: IRegion = { text: "", bold: false, href: "" };
		const shim = Htx.div();
		shim.innerHTML = scene.description;
		
		const recurse = (e: Element, bold: boolean, href: string) =>
		{
			for (const node of Array.from(e.childNodes))
			{
				if (node instanceof Element)
				{
					if (node.tagName === "B")
						recurse(node, true, href);
					
					else if (node.tagName === "A")
						recurse(node, bold, node.getAttribute("href") || "");
					
					else if (node.tagName === "BR")
						regions.push(empty);
				}
				else if (node instanceof Text)
				{
					if (regions.length > 0 && 
						regions[regions.length - 1].bold === bold &&
						regions[regions.length - 1].href === href && 
						regions[regions.length - 1] !== empty)
					{
						regions[regions.length - 1].text += node.textContent || "";
					}
					else
					{
						regions.push({ text: node.textContent || "", bold, href });
					}
				}
			}
		};
		
		recurse(shim, false, "");
		
		for (let i = regions.length; i-- > 0;)
		{
			const region = regions[i];
			region.text = region.text.replace("&nbsp;", " ");
			
			if (region !== empty)
			{
				if (region.text === "")
					regions.splice(i, 1);
			}
			else if (i < regions.length - 1 && regions[i + 1] === empty)
			{
				regions.splice(i, 1);
			}
		}
		
		// Remove leading br's
		for (;;)
		{
			if (regions.length === 0 || regions[0] !== empty)
				break;
			
			regions.splice(0, 1);
		}
		
		// Remove trailing br's
		for (;;)
		{
			if (regions.length === 0 || regions.at(-1) !== empty)
				break;
			
			regions.length--;
		}
		
		const htmlParts: string[] = ["<p>"];
		
		for (const region of regions)
		{
			if (region !== empty)
			{
				let html = region.text;
				
				if (region.bold)
					html = "<b>" + html + "</b>";
				
				if (region.href !== "")
					html = `<a href="${region.href}">` + html + "</a>";
				
				htmlParts.push(html);
			}
			else htmlParts.push("</p><p>");
		}
		
		htmlParts.push("</p>");
		
		const container = Htx.div({
			fontSize: UI.vsizePlayer(scene.descriptionSize)
		});
		
		container.innerHTML = htmlParts.join("");
		
		return Array.from(container.children) as HTMLParagraphElement[];
	}
	
	/**
	 * 
	 */
	function renderGalleryScene(bun: Bundle<GallerySceneRecord>)
	{
		return [
			CssClass.galleryScene,
			...bun.scene.frames.map(frame =>
			{
				if (!frame.media)
					return null;
				
				const frameDiv = Htx.div(CssClass.galleryFrame);
				const htmlSrc = bun.getMediaUrl(frame.media);
				const isImage = MimeType.getClass(frame.media.type) === MimeClass.image;
				
				if (isImage)
				{
					const cssSrc = bun.getMediaUrl(frame.media, "css");
					Htx.from(frameDiv)(
						frame.size === "contain" && RenderUtil.createImageFiller(cssSrc),
						Htx.img(
							{ src: htmlSrc },
							frame.size === "cover" ? { objectFit: "cover" } : {}
						)
					);
				}
				else
				{
					const mainVideo = RenderUtil.createVideo(htmlSrc, frame.media.type, frame.size);
					const fillerVideo = frame.size === "contain" ?
						RenderUtil.createVideoFiller(htmlSrc, mainVideo) :
						null;
					
					Htx.from(frameDiv)(
						fillerVideo,
						mainVideo,
					);
				}
				
				if (frame.captionLine1 || frame.captionLine2)
				{
					const legend = Htx.div(
						CssClass.galleryFrameLegend,
						frame.captionLine1 && Htx.p(new Text(frame.captionLine1)),
						frame.captionLine2 && Htx.p(new Text(frame.captionLine2)),
					);
					
					if (frame.size === "contain")
					{
						(async () =>
						{
							const [width, height] = await RenderUtil.getDimensions(htmlSrc);
							legend.style.aspectRatio = width + " / " + height;
							frameDiv.append(legend);
						})();
					}
					else frameDiv.append(legend);
				}
				
				return frameDiv;
			})
		];
	}
	
	/**
	 * 
	 */
	function renderProseScene(bun: Bundle<ProseSceneRecord>)
	{
		return [
			CssClass.proseScene,
			Htx.div(
				CssClass.proseSceneForeground,
				...renderProseDocument(bun.scene.content)
			)
		];
	}
	
	/**
	 * 
	 */
	export function renderProseDocument(content: ITrixSerializedObject | null)
	{
		if (!content)
			return [];
		
		const elements: HTMLElement[] = [];
		for (const block of content.document)
		{
			if (block.attributes.includes("heading1"))
			{
				elements.push(Htx.h2(
					...block.text
						.filter(obj => !obj.attributes.blockBreak)
						.map(obj => obj.string)
						.join("")
						.split("\n")
						.map(s => s.trim())
						.filter(s => !!s)
						.flatMap(s => [Htx.br(), new Text(s)])
						.slice(1)
				));
			}
			else
			{
				const paragraphs: HTMLElement[] = [Htx.p()];
				
				for (const trixNode of block.text)
				{
					if (trixNode.attributes.blockBreak)
						continue;
					
					const currentPara = paragraphs.at(-1);
					
					// Defensive
					if (!currentPara)
						continue;
					
					const wrapNode = (textContent: string) =>
					{
						let domNodes: Node[] = textContent
							.split(/\n/g)
							.map(s => s.trim())
							.filter(s => !!s)
							.flatMap(s => [Htx.br(), new Text(s)])
							.slice(1);
						
						if (trixNode.attributes.bold)
							domNodes = [Htx.strong(...domNodes)];
						
						if (trixNode.attributes.italic)
							domNodes = [Htx.em(...domNodes)];
						
						if (trixNode.attributes.href)
							domNodes = [Htx.a({ href: trixNode.attributes.href }, ...domNodes)];
						
						return domNodes;
					}
					
					const paragraphTexts = trixNode.string
						.split(/\n\s*\n/g)
						.map(s => s.trim())
						.filter(s => !!s);
					
					// Defensive
					if (paragraphTexts.length === 0)
						continue;
					
					currentPara.append(...wrapNode(paragraphTexts[0]));
					
					for (let i = 0; ++i < paragraphTexts.length;)
					{
						const text = paragraphTexts[i];
						paragraphs.push(Htx.p(...wrapNode(text)));
					}
				}
				
				elements.push(...paragraphs);
			}
		}
		
		return elements;
	}
}
