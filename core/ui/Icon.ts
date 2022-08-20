
namespace App.Icon
{
	/** */
	export function plus(...params: Hot.Param[])
	{
		const bar: Hot.Param = {
			position: "absolute",
			backgroundColor: "white",
		};
		
		return Hot.div(
			plus.name,
			UI.clickable,
			{
				width: "25px",
				height: "25px",
			},
			Hot.div(
				bar,
				{
					width: UI.lineIconThickness + "px",
					top: 0,
					bottom: 0,
					left: `calc(50% - ${UI.lineIconThickness / 2}px)`,
				}
			),
			Hot.div(
				bar,
				{
					height: UI.lineIconThickness + "px",
					left: 0,
					right: 0,
					top: `calc(50% - ${UI.lineIconThickness / 2}px)`,
				}
			),
			...params,
		);
	}
	
	/** */
	export function settings(...params: Hot.Param[])
	{
		const circleSize = 14;
		const fromEdge = Math.floor(circleSize / 2) - 1;
		
		const border = UI.lineIconThickness + "px solid white";
		const circle = <Hot.Style>{
			border,
			borderRadius: "100%",
			width: circleSize + "px",
			height: circleSize + "px",
		};
		
		const line = <Hot.Style>{
			border,
			borderWidth: UI.lineIconThickness + "px 0 0 0",
		};
		
		return Hot.div(
			"settings-icon",
			Hot.div(
				UI.anchorTopLeft(),
				circle,
			),
			Hot.div(
				UI.anchorBottomRight(),
				circle,
			),
			Hot.div(
				UI.anchorTop(),
				{
					top: fromEdge + "px",
					left: (circleSize - UI.lineIconThickness) + "px",
				},
				line,
			),
			Hot.div(
				UI.anchorBottom(),
				{
					bottom: fromEdge + "px",
					right: (circleSize - UI.lineIconThickness) + "px",
				},
				line,
			),
			...params
		);
	}
	
	/**
	 * Creates an "open in external" icon.
	 * The color of the icon can be configured by modifying the border color.
	 */
	export function openExternal(...params: Hot.Param<Hot.AnchorElementAttribute>[])
	{
		const thickness = 3;
		const rounding = thickness + 2;
		
		return Hot.a(
			{
				width: "30px",
				height: "30px",
				borderColor: "white",
				display: "inline-block",
				textDecoration: "none",
			},
			Hot.span(
				UI.anchorLeft(),
				{
					width: "50%",
					borderWidth: thickness + "px",
					borderStyle: "solid",
					borderColor: "inherit",
					borderRightColor: "transparent",
					borderRadius: `${rounding}px 0 0 ${rounding}px`,
				},
			),
			Hot.span(
				UI.anchorBottom(),
				{
					height: "50%",
					borderWidth: thickness + "px",
					borderStyle: "solid",
					borderColor: "inherit",
					borderTopColor: "transparent",
					borderRadius: `0 0 ${rounding}px ${rounding}px`,
				},
			),
			Hot.span(
				UI.anchorTopRight(-thickness, -thickness),
				{
					width: "40%",
					height: "40%",
					borderWidth: thickness + "px",
					borderBottomWidth: 0,
					borderLeftWidth: 0,
					borderStyle: "solid",
					borderColor: "inherit",
				},
				Hot.span(
					UI.anchorTopRight(-thickness, -thickness + 1),
					{
						border: "inherit",
						height: "250%",
						transformOrigin: "0 0",
						transform: "rotate(45deg)",
					}
				),
			),
			...params
		);
	}
	
	/** */
	export function checkmark(...params: Hot.Param[])
	{
		return Hot.div(
			{
				width: "80px",
				height: "80px",
			},
			Hot.div(
				{
					borderBottom: "8px solid white",
					borderRight: "8px solid white",
					transformOrigin: "50% 50%",
					transform: "translateY(35%) rotate(40deg)",
					width: "22px",
					height: "40px",
					margin: "auto",
				},
			),
			...params,
		);
	}
	
	/** */
	export function chevron(origin: Origin, ...params: Hot.Param[])
	{
		const b: Hot.Style = { borderLeftWidth: 0, borderTopWidth: 0 };
		const r = (deg: number) => <Hot.Style>{ transform: `rotate(${deg}deg)` };
		
		const css: Hot.Style = 
			origin === Origin.topLeft ? { borderRightWidth: 0, borderBottomWidth: 0 } :
			origin === Origin.topRight ? { borderLeftWidth: 0, borderBottomWidth: 0 } :
			origin === Origin.bottomLeft ? { borderRightWidth: 0, borderTopWidth: 0 } :
			origin === Origin.bottomRight ? b :
			origin === Origin.top ? { ...b, ...r(225) } :
			origin === Origin.right ? { ...b, ...r(325) } :
			origin === Origin.bottom ? { ...b, ...r(45) } :
			origin === Origin.left ? { ...b, ...r(135) } : {};
		
		return Hot.div(
			"chevron",
			{
				width: "25px",
				height: "25px",
				border: UI.lineIconThickness + "px solid white",
				transformOrigin: "50% 50%",
			},
			css,
			...params,
		);
	}
}
