
namespace App
{
	/** */
	export class LightnessSwatchHat
	{
		/** */
		constructor(origin: Origin)
		{
			this.root = Hot.div(
				{
					position: "absolute",
					padding: "20px",
					pointerEvents: "none",
					zIndex: 1,
				},
				Hot.div(
					UI.toolButtonTheme,
					{
						padding: "10px",
						pointerEvents: "all",
						display: "flex",
					},
					this.choices = [
						new this.LightnessChoiceHat(Lightness.black),
						new this.LightnessChoiceHat(Lightness.dark),
						new this.LightnessChoiceHat(Lightness.light),
						new this.LightnessChoiceHat(Lightness.white),
					]
				)
			);
			
			this.setOrigin(origin);
			Hat.wear(this);
		}
		
		readonly root;
		private readonly choices;
		
		/** */
		setOrigin(origin: Origin)
		{
			const classes = Object.keys(Origin).filter(k => k.startsWith("origin"));
			this.root.classList.remove(...classes);
			this.root.classList.add(origin);
		}
		
		/** */
		get lightness()
		{
			return this._lightness;
		}
		private _lightness = Lightness.black;
		
		/** */
		get isDarkSelected()
		{
			return this.lightness < 0;
		}
		set isDarkSelected(dark: boolean)
		{
			const lightness: Lightness = (this.isColorSelected ? 1 : 2) * (dark ? -1 : 1);
			this.setLightnessInner(lightness, false);
		}
		
		/** */
		get isColorSelected()
		{
			return Math.abs(this.lightness) === 1;
		}
		set isColorSelected(colored: boolean)
		{
			const lightness: Lightness = (colored ? 1 : 2) * (this.isDarkSelected ? -1 : 1);
			this.setLightnessInner(lightness, false);
		}
		
		/**
		 * A property that is used to indicate whether this LightnessSwatchHat
		 * updates the lightness value of a scene background, or a foreground
		 * object. This is used to properly inform the containing scene about
		 * how the contrast value should be stored.
		 */
		targetsBackground = false;
		
		/** */
		private setLightnessInner(lightness: Lightness, triggerChanged: boolean)
		{
			this._lightness = lightness;
			const choice = Not.nullable(this.choices.find(c => c.lightness === lightness));
			
			for (const choice of this.choices)
				choice.root.style.boxShadow = defaultShadow;
			
			choice.root.style.boxShadow = [
				defaultShadow,
				"inset 0 0 2px 1px " + UI.black(0.5),
				"0 0 0 3px white"
			].join();
			
			const scene = Hat.up(this, SceneHat);
			if (!scene)
				return;
			
			scene.record.setDarkOnLight(this.targetsBackground !== this.isDarkSelected);
			
			if (triggerChanged)
				this.changedFn();
			
			Hat.up(this, SceneHat)?.updateLightness();
		}
		
		/** */
		setChangedFn(fn: () => void)
		{
			this.changedFn = fn;
		}
		private changedFn = () => {};
		
		/** */
		private readonly LightnessChoiceHat = class LightnessChoiceHat
		{
			/** */
			constructor(readonly lightness: Lightness)
			{
				this.root = Hot.div(
					{
						width: "50px",
						height: "50px",
						margin: "10px",
						borderRadius: UI.borderRadius.default,
						backgroundColor: this.getCssValueFromLightness(lightness),
					},
					UI.click(() => this.handleClick()),
					lightness === Lightness.black && Hot.div(
						UI.anchor(),
						{
							boxShadow: "0 0 2px " + UI.white(0.33),
							borderRadius: "inherit",
						},
					)
				);
				
				Hat.wear(this);
			}
			
			readonly root;
			
			/** */
			private handleClick()
			{
				const swatch = Hat.over(this, LightnessSwatchHat);
				swatch.setLightnessInner(this.lightness, true);
			}
			
			/** */
			private getCssValueFromLightness(lightness: Lightness)
			{
				switch (lightness)
				{
					case Lightness.black: return `black`;
					case Lightness.dark: return `var(${ConstS.darkColorProperty})`;
					case Lightness.light: return `var(${ConstS.lightColorProperty})`;
					case Lightness.white: return `white`;
				}
			}
		}
	}
	
	const defaultShadow = "0 5px 10px rgba(0, 0, 0, 0.2)";
	
	/** */
	export const enum Lightness
	{
		black = -2,
		dark = -1,
		light = 1,
		white = 2,
	}
}
