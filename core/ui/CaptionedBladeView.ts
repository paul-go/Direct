
/** */
namespace Turf
{
	/** */
	export class CaptionedBladeView extends BladeView
	{
		constructor()
		{
			super();
			
			this.titleView = new CaptionedTitleView();
			this.paragraphView = new CaptionedParagraphView();
			
			this.buttonsContainer = Htx.div("buttons");
			this.buttons = new Controller.Array(this.buttonsContainer, CaptionedButton);
			
			Htx.from(this.sceneContainer)(
				UI.flexCenter,
				Htx.div(
					this.titleView.root,
					this.paragraphView.root,
					this.buttonsContainer,
				)
			);
			
			this.controlsContainer.append(
				this.createBladeButton("Add Button", () => this.addButton()),
				this.createBladeButton("Effects", () => {}),
				this.createBladeButton("Contrast", () => {}),
				this.createBladeButton("Background", () => {}),
			);
			
			//! Temporary
			Htx.defer(this.root, () =>
			{
				this.titleView.insertTitle("Title");
				this.paragraphView.html = "This is <b>strong</b> text.";
			});
			
			Controller.set(this);
		}
		
		private titleView;
		private paragraphView;
		private buttonsContainer;
		private buttons;
		
		/** */
		private addButton()
		{
			const cb = new CaptionedButton();
			this.buttons.insert(cb);
			
			// It's lame that this is in a setTimeout, but I don't care.
			// It's not working otherwise.
			setTimeout(() => cb.focus());
		}
	}
}
