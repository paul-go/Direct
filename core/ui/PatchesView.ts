
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
					this.renderAddButton(),
			 		() => this.populate()
				)
			);
		}
		
		readonly root;
		private readonly headerElement;
		private readonly patchesList;
		
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
		private renderAddButton()
		{
			return Htx.div(
				"new-patch",
				...this.defaultItemStyle,
				{
					backgroundColor: UI.primaryColor,
				},
				Htx.div(
					UI.anchorCenter("max-content"),
					UI.plusButton(
						{
							margin: "0 auto 2.5vw",
							width: "3.3vw",
							height: "3.3vw",
						},
						Htx.on("click", ev =>
						{
							
						}),
					),
					Htx.div(
						...UI.text(2.5, 600, "Add Patch"),
					),
				)
			);
		}
		
		/** */
		private async populate()
		{
			for await (const patch of this.db.each(PatchRecord, "peek"))
			{
				const date = new Date(patch.dateCreated);
				
				let previewTransformable: HTMLElement;
				let previewDisplay: HTMLElement;
				
				this.patchesList.append(Htx.div(
					"patch-preview",
					...this.defaultItemStyle,
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
								backgroundImage: "linear-gradient(45deg, #222, black)",
								aspectRatio: "1 / 1",
								opacity: "1",
								transitionProperty: "opacity",
								transitionDuration,
							},
							new Text(date.toDateString()),
							Htx.br(),
							new Text(date.toLocaleTimeString()),
						),
						Htx.on(UI.click, ev =>
						{
							this.animatePatch(previewTransformable, previewDisplay, patch);
						})
					),
				));
			}
		}
		
		/** */
		private animatePatch(
			transformable: HTMLElement,
			previewDisplay: HTMLElement,
			patch: PatchRecord)
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
			
			patchView.setBackCallback(() =>
			{
				UI.lockBody(async () =>
				{
					this.headerElement.style.removeProperty("transform");
					
					transformable.style.transitionDuration = "0";
					transformable.style.height = (window.innerHeight / 3) + "px";
					this.patchesList.style.display = "block";
					window.scroll(0, scrollY);
					transformable.append(patchView.root);
					patchView.root.classList.add(CssClass.patchViewTransition);
					transformable.style.transitionDuration = transitionDuration;
					
					await new Promise<void>(r => setTimeout(r));
					
					transformable.style.height = (window.innerWidth / 3) + "px";
					transformable.style.removeProperty("transform");
					previewDisplay.style.opacity = "1";
					
					await new Promise<void>(r => transformable.addEventListener("transitionend", () => r()));
					
					transformable.style.removeProperty("z-index");
					parent.style.removeProperty("z-index");
					patchView.root.remove();
				});
			});
		}
		
		/** */
		private gotoNewPatch()
		{
			
		}
		
		/** */
		private gotoPatch(patch: PatchRecord)
		{
			
		}
		
		/** */
		private readonly defaultItemStyle: Readonly<Htx.Param[]> = [
			UI.clickable,
			{
				display: "inline-block",
				verticalAlign: "top",
				width: "33.333vw",
				height: "33.333vw",
			}
		];
	}
	
	const transitionDuration = "0.5s";
}
