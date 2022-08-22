
namespace App
{
	/** */
	export interface IColorable
	{
		hasColor: boolean;
	}
	
	/** */
	export class HueSwatchHat
	{
		/** */
		constructor(readonly record: SceneRecord)
		{
			this.head = Hot.div(
				{
					display: "flex",
					justifyContent: "center",
					paddingBottom: "30px",
				},
				When.connected(() =>
				{
					for (const pair of App.colorPairs)
					{
						const cfg = new HueChoiceHat(this.record, pair);
						this.head.append(cfg.head);
					}
				})
			);
			
			Hat.wear(this);
		}
		
		readonly head;
	}
	
	/** */
	class HueChoiceHat
	{
		/** */
		constructor(
			private readonly record: SceneRecord,
			private readonly colorPair: TColorPair)
		{
			const darkColorString = UI.color(colorPair[0]);
			const lightColorString = UI.color(colorPair[1]);
			
			this.head = Hot.div(
				{
					width: "75px",
					height: "75px",
					margin: "10px",
					borderRadius: UI.borderRadius.default,
					backgroundImage: `linear-gradient(
						-45deg, 
						${darkColorString} 0,
						${darkColorString} 50%,
						${lightColorString} 50.1%,
						${lightColorString} 100%)`,
					boxShadow: "0 3px 15px black",
				},
				UI.click(() => this.select()),
				When.connected(() =>
				{
					if (record.colorPair.join() === this.colorPair.join())
						this.select();
				})
			);
			
			Hat.wear(this);
		}
		
		readonly head;
		
		/** */
		private select()
		{
			this.record.colorPair = this.colorPair;
			
			Query.siblings(this.head)
				.map(e => e.style.removeProperty("box-shadow"));
			
			this.head.style.boxShadow = 
				"inset 0 0 2px 1px " + UI.black(0.5) +
				", 0 0 0 3px white";
			
			Hat.up(this, SceneHat)?.updateHue();
		}
	}
}
