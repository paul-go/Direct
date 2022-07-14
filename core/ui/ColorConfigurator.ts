
namespace Turf
{
	/** */
	export class ColorConfigurator
	{
		/** */
		constructor(
			readonly record: BladeRecord,
			readonly target: HTMLElement)
		{
			this.root = Htx.div(
				"color-configurator",
				{
					display: "flex",
					justifyContent: "center",
					marginTop: "10px",
				},
				() => this.render()
			);
			
			Controller.set(this);
		}
		
		readonly root;
		
		/** */
		private render()
		{
			const meta = AppContainer.of(this.root).meta;
			for (let index = -1; ++index < meta.colorScheme.length;)
			{
				const color = meta.colorScheme[index];
				const configurator = new ColorConfiguratorOption(
					this.record,
					color,
					index,
					this.target);
				
				this.root.append(configurator.root);
			}
		}
	}
	
	/** */
	class ColorConfiguratorOption
	{
		/** */
		constructor(
			private readonly record: BladeRecord,
			private readonly color: UI.IColor,
			private readonly colorIndex: number,
			private readonly target: HTMLElement)
		{
			this.root = Htx.div(
				{
					width: "75px",
					height: "75px",
					margin: "10px",
					backgroundColor: UI.color(color),
					borderRadius: UI.borderRadius.default
				},
				color.l > 20 ? {} : { border: "1px solid " + UI.white(0.2) },
				UI.clickable,
				Htx.on(UI.click, () => this.select()),
				() =>
				{
					if (record.backgroundColorIndex === colorIndex)
						this.select();
				}
			);
		}
		
		readonly root;
		
		/** */
		select()
		{
			this.record.backgroundColorIndex = this.colorIndex;
			
			Query.siblings(this.root)
				.map(e => e.style.removeProperty("box-shadow"));
			
			this.root.style.boxShadow = 
				"inset 0 0 2px 1px " + UI.black(0.5) +
				", 0 0 0 3px white";
			
			this.target.style.backgroundColor = UI.color(this.color);
			Force.use(this, BladeView).backgroundChanged();
		}
	}
}
