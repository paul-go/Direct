
namespace Turf
{
	/** */
	export class AddBladeView
	{
		/** */
		static async show(via: Element)
		{
			return new Promise<BladeView | null>(r =>
			{
				const apex = Controller.over(via, ApexView);
				const view = new AddBladeView(r);
				apex.root.append(view.root);
			});
		}
		
		/** */
		private constructor(resultFn: (blade: BladeView | null) => void)
		{
			this.root = Surface.open({
				background: "black",
				acceptFn()
				{
					
				},
				closeFn()
				{
					resultFn(null);
				},
				params: [
					Htx.h1(
						{
							textAlign: "center",
						},
						new Text("Add a Blade")
					),
					this.renderButton("Add Captioned Media", () =>
					{
						resultFn(new CaptionedBladeView());
					}),
					this.renderButton("Add Video", () =>
					{
						resultFn(new VideoBladeView());
					}),
					this.renderButton("Add Photo Gallery", () =>
					{
						resultFn(new GalleryBladeView());
					}),
					this.renderButton("Add A Written Section", () =>
					{
						resultFn(new ProseBladeView());
					}),
				]
			})
		}
		
		readonly root;
		
		/** */
		private renderButton(text: string, clickFn: () => void)
		{
			return Htx.div(
				"blade-type-button",
				new Text(text),
				UI.clickable,
				{
					marginTop: "10px",
					padding: "10px",
					borderRadius: UI.borderRadius.default,
					border: "2px solid " + UI.color({ l: 33 }),
					backgroundColor: UI.black(0.5),
					textAlign: "center",
				},
				Htx.on(UI.click, () =>
				{
					clickFn();
					Surface.close(this.root);
				})
			);
		}
	}
}
