
namespace App
{
	/**
	 * 
	 */
	export class CanvasSceneRenderer extends SceneRenderer<CanvasSceneRecord>
	{
		/** */
		renderContents()
		{
			const scene = this.scene;
			const out: Hot.Param[] = [
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
						return Hot.div(
							CssClass.canvasSceneBackground,
							{
								backgroundImage: "url(" + this.getMediaUrl(bg.media) + ")",
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
						return Hot.video(
							CssClass.canvasSceneBackground,
							{
								src: this.getMediaUrl(bg.media),
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
				const fg = Hot.div(
					CssClass.canvasSceneForeground,
					{
						data: {
							[DataAttributes.transition]: this.useAnimation(scene.effect)
						},
						color: scene.hasColor ?
							this.colors.foregroundColored :
							this.colors.foregroundUncolored
					},
				);
				
				const island = Hot.div(CssClass.canvasSceneIsland, scene.origin);
				
				if (scene.contrast)
					RenderUtil.setContrast(island, scene.contrast);
				
				if (scene.twist !== 0)
					island.style.transform = `rotate(${scene.twist}deg)`;
				
				const islandElements: HTMLElement[] = [];
				
				if (scene.contentImage)
				{
					islandElements.push(Hot.img(
						CssClass.canvasSceneContentImage,
						{ src: this.getMediaUrl(scene.contentImage) }
					));
				}
				
				if (scene.titles.length > 0)
				{
					const h1 = Hot.h1();
					
					const render = (title: ITitle) => [
						UI.specificWeight(title.weight),
						{
							fontSize: UI.vsizePlayer(title.size),
						},
						title.hasColor && { color: this.colors.foregroundColored },
						new Text(title.text)
					];
					
					if (scene.titles.length === 1)
						Hot.get(h1)(...render(scene.titles[0]));
					
					else for (const title of scene.titles)
						h1.append(Hot.div(...render(title)));
					
					islandElements.push(h1);
				}
				
				if (scene.description.length > 0)
				{
					island.style.fontSize = UI.vsizePlayer(scene.descriptionSize);
					islandElements.push(...this.convertDescriptionToParagraphs(scene));
				}
				
				if (scene.actions.length > 0)
				{
					const actionsElement = Hot.div(
						CssClass.canvasActions,
						scene.actions.map(action => this.renderAction(scene, action))
					);
					
					if (islandElements.length > 0)
					{
						const lastElement = islandElements.pop()!;
						islandElements.push(Hot.div(
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
		private  renderAction(scene: CanvasSceneRecord, action: ActionRecord)
		{
			let styles: Hot.Style = {
				color: action.hasColor ?
					this.colors.foregroundColored :
					this.colors.foregroundUncolored,
			};
			
			if (action.filled)
			{
				styles.backgroundColor = action.hasColor ?
					this.colors.backgroundColored :
					this.colors.backgroundUncolored;
			}
			else
			{
				styles.borderColor = action.hasColor ?
					this.colors.foregroundColored :
					this.colors.foregroundUncolored;
			}
			
			return Hot.a(
				CssClass.canvasAction,
				scene.actionShape,
				action.filled ? 
					CssClass.canvasActionFilled :
					CssClass.canvasActionOutlined,
				{
					href: typeof action.target === "string" ? action.target || "#" : "#"
				},
				styles,
				new Text(action.text)
			);
		}
		
		/** */
		private convertDescriptionToParagraphs(scene: CanvasSceneRecord)
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
				const p = Hot.p();
				
				for (let i = -1; ++i < group.length;)
				{
					const line = group[i];
					p.append(new Text(line));
					
					if (i < group.length - 1)
						p.append(Hot.br());
				}
				
				paragraphs.push(p);
			}
			
			return paragraphs;
		}
	}
}
