
namespace App.Icon
{
	/** */
	export function plus(...params: Htx.Param[])
	{
		const bar: Htx.Param = {
			position: "absolute",
			backgroundColor: "white",
		};
		
		return Htx.div(
			plus.name,
			UI.clickable,
			{
				width: "25px",
				height: "25px",
			},
			Htx.div(
				bar,
				{
					width: UI.lineIconThickness + "px",
					top: "0",
					bottom: "0",
					left: `calc(50% - ${UI.lineIconThickness / 2}px)`,
				}
			),
			Htx.div(
				bar,
				{
					height: UI.lineIconThickness + "px",
					left: "0",
					right: "0",
					top: `calc(50% - ${UI.lineIconThickness / 2}px)`,
				}
			),
			...params,
		);
	}
	
	/** */
	export function settings(...params: Htx.Param[])
	{
		const circleSize = 14;
		const fromEdge = Math.floor(circleSize / 2) - 1;
		
		const border = UI.lineIconThickness + "px solid white";
		const circle = <Htx.Style>{
			border,
			borderRadius: "100%",
			width: circleSize + "px",
			height: circleSize + "px",
		};
		
		const line = <Htx.Style>{
			border,
			borderWidth: UI.lineIconThickness + "px 0 0 0",
		};
		
		return Htx.div(
			"settings-icon",
			Htx.div(
				UI.anchorTopLeft(),
				circle,
			),
			Htx.div(
				UI.anchorBottomRight(),
				circle,
			),
			Htx.div(
				UI.anchorTop(),
				{
					top: fromEdge + "px",
					left: (circleSize - UI.lineIconThickness) + "px",
				},
				line,
			),
			Htx.div(
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
	
	/** */
	export function openExternal(...params: Htx.Param[])
	{
		
	}
	
	/** */
	export function checkmark(...params: Htx.Param[])
	{
		return Htx.div(
			{
				width: "80px",
				height: "80px",
			},
			Htx.div(
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
	export function chevron(origin: Origin, ...params: Htx.Param[])
	{
		const b = { borderLeftWidth: "0", borderTopWidth: "0" };
		const r = (deg: number) => <Htx.Style>{ transform: `rotate(${deg}deg)` };
		
		const css: Htx.Style = 
			origin === Origin.topLeft ? { borderRightWidth: "0", borderBottomWidth: "0" } :
			origin === Origin.topRight ? { borderLeftWidth: "0", borderBottomWidth: "0" } :
			origin === Origin.bottomLeft ? { borderRightWidth: "0", borderTopWidth: "0" } :
			origin === Origin.bottomRight ? b :
			origin === Origin.top ? { ...b, ...r(225) } :
			origin === Origin.right ? { ...b, ...r(325) } :
			origin === Origin.bottom ? { ...b, ...r(45) } :
			origin === Origin.left ? { ...b, ...r(135) } : {};
		
		return Htx.div(
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