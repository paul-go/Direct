
namespace App
{
	/** */
	export interface IColorable
	{
		hasColor: boolean;
	}
	
	/** */
	export class ColorSelector
	{
		/** */
		constructor(readonly record: SceneRecord)
		{
			this.root = Htx.div(
				"color-configurator",
				{
					display: "flex",
					justifyContent: "center",
					marginTop: "10px",
				},
				When.connected(() => this.render())
			);
			
			Cage.set(this);
		}
		
		readonly root;
		
		/** */
		private render()
		{
			for (const pair of App.colorPairs)
			{
				const cfg = new ColorOption(this.record, pair);
				this.root.append(cfg.root);
			}
		}
	}
	
	/** */
	class ColorOption
	{
		/** */
		constructor(
			private readonly record: SceneRecord,
			private readonly colorPair: TColorPair)
		{
			const darkColorString = UI.color(colorPair[0]);
			const lightColorString = UI.color(colorPair[1]);
			
			this.root = Htx.div(
				{
					width: "75px",
					height: "75px",
					margin: "10px",
					borderRadius: UI.borderRadius.default,
					backgroundImage: `linear-gradient(
						45deg, 
						${darkColorString} 0,
						${darkColorString} 50%,
						${lightColorString} 50.1%,
						${lightColorString} 100%)`
				},
				UI.clickable,
				Htx.on(UI.clickEvt, () => this.select()),
				When.connected(() =>
				{
					if (record.colorPair.join() === this.colorPair.join())
						this.select();
				})
			);
		}
		
		readonly root;
		
		/** */
		private select()
		{
			this.record.colorPair = this.colorPair;
			
			Query.siblings(this.root)
				.map(e => e.style.removeProperty("box-shadow"));
			
			this.root.style.boxShadow = 
				"inset 0 0 2px 1px " + UI.black(0.5) +
				", 0 0 0 3px white";
			
			Cage.over(this, SceneView).updateColor();
		}
	}
}
