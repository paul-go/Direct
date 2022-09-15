/// <reference path="../ui/UI.ts" />

/**
 * Stores a namespace of functions that handle the functionality
 * that is shared between the renderer and the editor.
 */
namespace App.RenderUtil
{
	/**
	 * Returns the aspect ratio of the specified image.
	 */
	export function getDimensions(src: string)
	{
		return new Promise<[number, number]>(r =>
		{
			document.body.append(Hot.img(
				{
					src,
					position: "absolute",
					left: "-1000000px",
				},
				Hot.on("load", ev =>
				{
					const img = ev.target as HTMLImageElement;
					const [w, h] = [img.clientWidth, img.clientHeight];
					img.remove();
					r([w, h]);
				})
			));
		});
	}
	
	/** */
	export function renderColors(record: SceneRecord)
	{
		const [darkHsl, lightHsl] = record.colorPair;
		const dark = UI.color({ h: darkHsl[0], s: darkHsl[1], l: darkHsl[2] });
		const light = UI.color({ h: lightHsl[0], s: lightHsl[1], l: lightHsl[2] });
		return { dark, light };
	}
	
	/**
	 * 
	 */
	export function resolveColors(record: SceneRecord)
	{
		const contrast = record.contrast;
		const [darkHsl, lightHsl] = record.colorPair;
		const darkColor = UI.color({ h: darkHsl[0], s: darkHsl[1], l: darkHsl[2] });
		const lightColor = UI.color({ h: lightHsl[0], s: lightHsl[1], l: lightHsl[2] });
		
		return {
			backgroundColored: contrast < 0 ? lightColor : darkColor,
			foregroundColored: contrast < 0 ? darkColor : lightColor,
			backgroundUncolored: contrast < 0 ? white : black,
			foregroundUncolored: contrast < 0 ? black : white,
		};
	}
	
	const black = UI.color({ h: 0, s: 0, l: 0 });
	const white = UI.color({ h: 0, s: 0, l: 100 });
	
	/**
	 * A number between 0 (fully black) and 100 (fully white) that
	 * indicates the amount of contrast to render with.
	 * A value of 50 removes the text contrast from the element.
	 */
	export function setContrast(e: HTMLElement, amount: number)
	{
		e.classList.remove(
			CssClass.textContrast,
			CssClass.textContrastDark,
			CssClass.textContrastLight);
		
		e.style.removeProperty(ConstS.contrastProperty);
		
		if (amount !== 0)
		{
			amount /= 100;
			
			e.classList.add(
				CssClass.textContrast,
				amount > 0 ?
					CssClass.textContrastDark : 
					CssClass.textContrastLight);
			
			e.style.setProperty(ConstS.contrastProperty, Math.abs(amount).toString());
		}
		
		return e;
	}
	
	/**
	 * 
	 */
	export function createImageFiller(src: string)
	{
		return Hot.div(
			UI.anchor(-ConstN.fillerContentBlur),
			{
				backgroundImage: src,
				backgroundSize: "100% 100%",
				filter: `blur(${ConstN.fillerContentBlur}px)`,
			}
		);
	}
	
	/**
	 * 
	 */
	export function createVideo(
		src: string,
		mimeType: MimeType,
		size: SizeMethod = "contain")
	{
		return Hot.video({
			src,
			type: mimeType,
			playsInline: true,
			controls: true,
			width: "100%",
			height: "100%",
			objectFit: size,
		});
	}
	
	/**
	 * 
	 */
	export function createVideoBackground(src: string, mimeType: string)
	{
		return Hot.video({
			src,
			type: mimeType,
			playsInline: true,
			controls: false,
			autoplay: true,
			muted: true,
			loop: true,
			width: "100%",
			height: "100%",
			objectFit: "cover",
			...UI.anchor()
		});
	}
	
	/**
	 * 
	 */
	export function renderTrixDocument(content: ITrixSerializedObject | null)
	{
		if (!content)
			return [];
		
		const elements: HTMLElement[] = [];
		for (const block of content.document)
		{
			if (block.attributes.includes("heading1"))
			{
				elements.push(Hot.h1(
					...block.text
						.filter(obj => !obj.attributes.blockBreak)
						.map(obj => obj.string)
						.join("")
						.split("\n")
						.map(s => s.trim())
						.filter(s => !!s)
						.flatMap(s => [Hot.br(), new Text(s)])
						.slice(1)
				));
			}
			else
			{
				const paragraphs: HTMLElement[] = [Hot.p()];
				
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
							.flatMap(s => [Hot.br(), new Text(s)])
							.slice(1);
						
						if (trixNode.attributes.bold)
							domNodes = [Hot.strong(...domNodes)];
						
						if (trixNode.attributes.italic)
							domNodes = [Hot.em(...domNodes)];
						
						if (trixNode.attributes.href)
							domNodes = [Hot.a({ href: trixNode.attributes.href }, ...domNodes)];
						
						return domNodes;
					}
					
					const paragraphTexts = trixNode.string
						.split(/\n\s*\n/g)
						.filter(s => !!s);
					
					// Defensive
					if (paragraphTexts.length === 0)
						continue;
					
					currentPara.append(...wrapNode(paragraphTexts[0]));
					
					for (let i = 0; ++i < paragraphTexts.length;)
					{
						const text = paragraphTexts[i];
						paragraphs.push(Hot.p(...wrapNode(text)));
					}
				}
				
				elements.push(...paragraphs);
			}
		}
		
		return elements;
	}
}
