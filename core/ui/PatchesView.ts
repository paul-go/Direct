
namespace Turf
{
	/** */
	export class PatchesView
	{
		/** */
		constructor(private readonly db: Back)
		{
			this.root = Htx.div(
				"patches-view",
				this.headerElement = this.renderHeader(),
				this.patchesList = Htx.div(
					"patches-list",
					this.addPatchButton = this.renderAddPatchButton(),
			 		() => this.populate()
				)
			);
		}
		
		readonly root;
		private readonly headerElement;
		private readonly patchesList;
		private readonly addPatchButton;
		
		/** */
		private renderHeader()
		{
			return Htx.div(
				UI.clickable,
				UI.anchorTopRight(20),
				{
					position: "fixed",
					zIndex: "1",
					padding: "20px",
					borderRadius: "100%",
					backgroundColor: UI.gray(64, 0.5),
					backdropFilter: "blur(15px)",
					transitionDuration,
					transitionProperty: "transform",
				},
				UI.settingsIcon(
					{
						width: "30px",
						height: "30px",
					}
				)
			);
		}
		
		/** */
		private renderAddPatchButton()
		{
			return this.renderTile([
				{
					backgroundColor: UI.primaryColor,
				},
				Htx.div(
					UI.presentational,
					UI.anchorCenter("max-content"),
					UI.plusButton(
						{
							margin: "0 auto 2.5vw",
							width: "3.3vw",
							height: "3.3vw",
						},
					),
					Htx.div(
						...UI.text(2.5, 600, "Add Patch"),
					),
				),
			]);
		}
		
		/** */
		private async populate()
		{
			for await (const patch of this.db.each(PatchRecord, "peek"))
				this.patchesList.append(this.renderPatchTile(patch));
		}
		
		/** */
		private renderPatchTile(patch: PatchRecord)
		{
			const date = new Date(patch.dateCreated);
			
			const params: Htx.Param[] = [
				{
					backgroundImage: "linear-gradient(45deg, #222, black)",
				},
				patch.datePublished > 0 ? null : Htx.div(
					UI.anchorTop(15),
					{
						width: "max-content",
						margin: "auto",
						borderRadius: UI.borderRadius.max,
						color: "white",
						fontSize: "max(16px, 1vw)",
						fontWeight: "700",
						backgroundColor: UI.primaryColor,
						padding: "0.5vw 1.5vw",
					},
					new Text("Draft"),
				),
				new Text(date.toDateString()),
				Htx.br(),
				new Text(date.toLocaleTimeString()),
			];
			
			return this.renderTile(params, patch);
		}
		
		/** */
		private renderTile(
			previewDisplayParams: Htx.Param[],
			patch?: PatchRecord)
		{
			let previewTransformable: HTMLElement;
			let previewDisplay: HTMLElement;
			
			return Htx.div(
				"patch-preview",
				UI.clickable,
				{
					display: "inline-block",
					verticalAlign: "top",
					width: "33.333vw",
					height: "33.333vw",
				},
				previewTransformable = Htx.div(
					"preview-transformable",
					UI.anchor(),
					{
						transform: "scale(1)",
						transitionDuration,
						transitionProperty: "transform, height",
						backgroundColor: "black",
						overflow: "hidden",
					},
					previewDisplay = Htx.div(
						"preview-display",
						UI.anchorTop(),
						{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							textAlign: "center",
							lineHeight: "1.66",
							fontWeight: "700",
							fontSize: "2.5vw",
							aspectRatio: "1 / 1",
							opacity: "1",
							transitionProperty: "opacity",
							transitionDuration,
						},
						...previewDisplayParams
					),
					Htx.on(UI.click, () =>
					{
						this.animateTile(previewTransformable, previewDisplay, patch);
					})
				),
			)
		}
		
		/** */
		private animateTile(
			transformable: HTMLElement,
			previewDisplay: HTMLElement,
			patch?: PatchRecord)
		{
			const patchView = new PatchView(patch);
			const parent = transformable.parentElement!;
			parent.style.zIndex = "2";
			
			const index = Query.indexOf(parent);
			const column = index % 3;
			const bounds = transformable.getBoundingClientRect();
			const transformOriginY = "0%";
			const finalOffsetFromTop = bounds.top;
			
			const transformOriginX = 
				column === 0 ? "0" :
				column === 1 ? "50%" :
				column === 2 ? "100%" : "";
			
			const scrollY = window.scrollY;
			
			UI.lockBody(async () =>
			{
				this.headerElement.style.transform = "translateY(-150%)";
				
				patchView.root.classList.add(CssClass.patchViewTransition);
				transformable.style.height = (window.innerWidth / 3) + "px";
				transformable.append(patchView.root);
				
				await new Promise<void>(r => setTimeout(r));
				
				transformable.style.zIndex = "1";
				transformable.style.transformOrigin = transformOriginX + " " + transformOriginY;
				transformable.style.transform = `scale(3) translateY(${-(finalOffsetFromTop / 3)}px)`;
				transformable.style.height = (window.innerHeight / 3) + "px";
				previewDisplay.style.opacity = "0";
				
				await new Promise<void>(r => transformable.addEventListener("transitionend", () => r()));
				
				Turf.apex.root.append(patchView.root);
				patchView.root.classList.remove(CssClass.patchViewTransition);
				this.patchesList.style.display = "none";
			});
			
			let doingKeep = false;
			
			patchView.setKeepCallback(patch =>
			{
				doingKeep = true;
				this.addPatchButton.remove();
				
				this.patchesList.prepend(
					this.renderAddPatchButton(),
					this.renderPatchTile(patch));
			});
			
			patchView.setBackCallback(() =>
			{
				UI.lockBody(async () =>
				{
					this.headerElement.style.removeProperty("transform");
					this.patchesList.style.display = "block";
					
					if (doingKeep)
					{
						const s = patchView.root.style;
						s.transitionDuration = "0";
						await UI.wait();
						s.opacity = "1";
						s.transformOrigin = "50% 0";
						await UI.wait();
						s.transitionDuration = transitionDuration;
						await UI.wait();
						s.transform = "scale(0.3333)";
						s.opacity = "0";
						await UI.waitTransitionEnd(patchView.root);
						patchView.root.remove();
					}
					else
					{
						transformable.style.transitionDuration = "0";
						transformable.style.height = (window.innerHeight / 3) + "px";
						
						window.scroll(0, scrollY);
						
						transformable.append(patchView.root);
						patchView.root.classList.add(CssClass.patchViewTransition);
						transformable.style.transitionDuration = transitionDuration;
						
						await UI.wait();
						
						transformable.style.height = (window.innerWidth / 3) + "px";
						transformable.style.removeProperty("transform");
						previewDisplay.style.opacity = "1";
						
						await UI.waitTransitionEnd(transformable);
						
						transformable.style.removeProperty("z-index");
						parent.style.removeProperty("z-index");
						patchView.root.remove();
					}
				});
			});
		}
	}
	
	const transitionDuration = "0.5s";
}
