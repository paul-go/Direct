
namespace Turf
{
	/** */
	export class ColorScheme
	{
		/** */
		static readonly all = [
			
			new ColorScheme("Blue",
				{ h: 209, s: 97, l: 55 },
				{ h: 218, s: 87, l: 54 },
				{ h: 229, s: 78, l: 53 },
				{ h: 241, s: 69, l: 51 },
				{ h: 253, s: 89, l: 43 }),
			
			new ColorScheme("Green",
				{ h: 147, s: 27, l: 40 },
				{ h: 148, s: 27, l: 47 },
				{ h: 136, s: 26, l: 53 }),
			
			new ColorScheme("Brown",
				{ h: 13, s: 25, l: 26 },
				{ h: 31, s: 43, l: 28 },
				{ h: 27, s: 34, l: 38 },
				{ h: 26, s: 49, l: 61 }),
			
			new ColorScheme("Pastel",
				{ h: 28, s: 83, l: 94 },
				{ h: 216, s: 21, l: 79 },
				{ h: 221, s: 25, l: 69 },
				{ h: 262, s: 19, l: 47 },
				{ h: 331, s: 27, l: 63 },
				{ h: 342, s: 30, l: 74 }),
			
			new ColorScheme("American",
				{ h: 212, s: 79, l: 40 },
				{ h: 198, s: 94, l: 43 },
				{ h: 240, s: 0, l: 85 },
				{ h: 0, s: 87, l: 59 },
				{ h: 360, s: 64, l: 49 }),
			
			new ColorScheme("Retro",
				{ h: 10, s: 55, l: 59 },
				{ h: 359, s: 23, l: 35 },
				{ h: 13, s: 27, l: 49 },
				{ h: 35, s: 39, l: 58 },
				{ h: 40, s: 23, l: 74 },
				{ h: 184, s: 25, l: 22 }),
			
		] as const;
		
		/** */
		constructor(
			readonly name: string,
			...colors: UI.IColor[])
		{
			this.colors = colors;
		}
		
		/** */
		readonly colors: UI.IColor[];
	}
}
