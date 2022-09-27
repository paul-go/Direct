
namespace App
{
	/**
	 * 
	 */
	export class CanvasSceneRenderer extends SceneRenderer<CanvasSceneRecord>
	{
		/** */
		protected async renderContents()
		{
			const scene = this.scene;
			const out: Hot.Param[] = [
				CssClass.canvasScene
			];
			
			// Background
			for (const bg of scene.backgrounds)
			{
				const e = await this.renderBackground(bg);
				if (e)
					out.push(e);
			}
			
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
		private async renderBackground(bg: BackgroundRecord)
		{
			if (!bg.media)
				return null;
			
			const within = (low: number, high: number, pct: number) => low + (high - low) * pct;
			const calc = (pct: number, fixed: number, unit: string) => 
			{
				if (fixed === 0)
					return pct.toFixed(2) + "%";
				
				if (pct === 0)
					return fixed + unit;
				
				const op = fixed < 0 ? "-" : "+";
				return `calc(${pct.toFixed(2)}% ${op} ${Math.abs(fixed).toFixed(2)}${unit})`;
			};
			
			const bpX = bg.position[0];
			const bpY = bg.position[1];
			
			const [x, y] = await RenderUtil.getDimensions(bg.media);
			const isPortrait = y > x;
			const max = ConstN.playerMaxWidth;
			const sizePct = bg.size / 100;
			const sizePxX = (isPortrait ? max * sizePct * (x / y) : max * sizePct);
			const sizePxY = (isPortrait ? max * sizePct : max * sizePct * (y / x));
			const sizeVwX = (isPortrait ? bg.size * (x / y) : bg.size);
			const sizeVwY = (isPortrait ? bg.size : bg.size * (y / x));
			
			const bpXCssVw = within(sizeVwX / -2, sizeVwX / 2, bpX / 100);
			const bpXCssPx = within(max / -2, max / 2, bpX / 100);
			
			let bpYCssPct = 0;
			let bpYCssVw = 0;
			
			const localMin = sizeVwY / 2;
			const localMax = 100 - sizeVwY / 2;
			
			if (bpY < localMin)
			{
				bpYCssPct = 0;
				bpYCssVw = within(sizeVwY / -2, 0, bpY / localMin);
			}
			else if (bpY > localMax)
			{
				bpYCssPct = 100;
				bpYCssVw = within(0, sizeVwY / 2, (bpY - localMax) / localMin);
			}
			else
			{
				bpYCssPct = (bpY - (sizeVwY / 2)) / (localMax - localMin) * 100;
			}
			
			const bpYCssPx = (bpYCssVw / 100) * max;
			
			let element: HTMLElement;
			
			const mimeClass = MimeType.getClass(bg.media.type);
			if (mimeClass === MimeClass.image)
			{
				element = Hot.div(
					CssClass.canvasSceneBackground,
					{
						backgroundImage: "url(" + this.getMediaUrl(bg.media) + ")",
					},
				);
				
				if (bg.size === -1)
				{
					element.style.backgroundSize = "cover";
				}
				else
				{
					const cls = "." + this.classGenerator.classOf(element);
					
					this.cssRules.push(
						Css.media(
							"max-width: " + ConstN.playerMaxWidth + "px", {
								[cls]: {
									"background-position": 
										calc(bpX, bpXCssVw, "vw") + " " +
										calc(bpYCssPct, bpYCssVw, "vw"),
									"background-size": sizeVwX.toFixed(2) + "% auto",
								}
							}
						),
						Css.media(
							"min-width: " + ConstN.playerMaxWidth + "px", {
								[cls]: {
									"background-position": 
										calc(50, bpXCssPx, "px") + " " +
										calc(bpYCssPct, bpYCssPx, "px"),
									"background-size": 
										sizePxX.toFixed(1) + "px " +
										sizePxY.toFixed(1) + "px",
								}
							}
						),
					);
				}
			}
			else if (mimeClass === MimeClass.video)
			{
				element = Hot.video(
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
			else return null;
			
			return element;
		}
		
		/** */
		private renderAction(scene: CanvasSceneRecord, action: ActionRecord)
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
