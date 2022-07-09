
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
				this.renderHeader(),
				this.patchesList = Htx.div(
					"patches-list",
					{
						//paddingTop: headerHeight,
					},
					this.renderAddButton(),
			 		() => this.populate()
				)
			);
		}
		
		readonly root;
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
				
				this.patchesList.append(Htx.div(
					"patch-preview",
					...this.defaultItemStyle,
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
					Htx.div(
						{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: "inherit",
							height: "inherit",
							textAlign: "center",
							lineHeight: "1.66",
							fontWeight: "700",
							fontSize: "2.5vw",
						},
						new Text(date.toDateString()),
						Htx.br(),
						new Text(date.toLocaleTimeString()),
					),
					Htx.on(UI.click, () =>
					{
						
					})
				));
			}
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
}
