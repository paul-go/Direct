
/** */
namespace Turf
{
	/** */
	export class CaptionedBladeView extends BladeView
	{
		/** */
		constructor(readonly record = new VideoBladeRecord())
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
			
			this.setBladeButtons(
				this.animationButton,
				this.contrastButton,
				this.originButton,
				this.backgroundsButton,
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
		
		private readonly animationButton = new BladeButtonView("Animation");
		private readonly contrastButton = new BladeButtonView("Contrast");
		private readonly originButton = new BladeButtonView("Position");
		private readonly backgroundsButton = new BladeButtonView("Backgrounds");
		
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
