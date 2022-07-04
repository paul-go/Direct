
namespace Turf
{
	export namespace UI
	{
		/** */
		export const mul = "✕";
		
		/** */
		export interface IColor
		{
			readonly h: number;
			readonly s: number;
			readonly l: number;
			readonly a?: number;
		}
		
		/** */
		export function color(values: Partial<IColor>)
		{
			const h = values.h ?? 135;
			const s = values.s ?? 50;
			const l = values.l ?? 50;
			const a = values.a ?? 1;
			return a === 1 ?
				`hsl(${h}, ${s}%, ${l}%)` :
				`hsla(${h}, ${s}%, ${l}%, ${a})`;
		}
		
		/** */
		export const primaryColor = UI.color({ s: 60, l: 40 });
		
		/** */
		export function white(alpha = 1)
		{
			return alpha === 1 ? "white" : `rgba(255, 255, 255, ${alpha})`;
		}
		
		/** */
		export function black(alpha = 1)
		{
			return alpha === 1 ? "black" : `rgba(0, 0, 0, ${alpha})`;
		}
		
		/** */
		export const borderRadius = {
			default: "5px"
		} as const;
		
		/** */
		export const clickable = {
			userSelect: "none",
			cursor: "pointer"
		} as const;
		
		/** */
		export function fixed(amount = 0)
		{
			return <Htx.Style>{
				position: "fixed",
				top: amount + "px",
				right: amount + "px",
				bottom: amount + "px",
				left: amount + "px"
			};
		}
		
		/** */
		export function anchor(amount = 0)
		{
			return <Htx.Style>{
				position: "absolute",
				top: amount + "px",
				right: amount + "px",
				bottom: amount + "px",
				left: amount + "px"
			};
		}
		
		/** */
		export function anchorLeft(amount = 0)
		{
			return <Htx.Style>{
				position: "absolute",
				top: amount + "px",
				left: amount + "px",
				bottom: amount + "px",
			};
		}
		
		/** */
		export function anchorRight(amount = 0)
		{
			return <Htx.Style>{
				position: "absolute",
				top: amount + "px",
				right: amount + "px",
				bottom: amount + "px",
			};
		}
		
		/** */
		export function anchorTopLeft(x = 0, y = 0)
		{
			return <Htx.Style>{
				position: "absolute",
				top: y + "px",
				left: x + "px",
			};
		}
		
		/** */
		export function anchorTopRight(x = 0, y = 0)
		{
			return <Htx.Style>{
				position: "absolute",
				top: y + "px",
				right: x + "px",
			};
		}
		
		/** */
		export const flexColumn: Htx.Style = {
			display: "flex",
			flexDirection: "column",
		};
		
		/** */
		export const flexCenter: Htx.Style = {
			display: "flex",
			textAlign: "center",
			alignContent: "center",
			alignItems: "center",
			justifyContent: "center",
		} as const;
		
		/** */
		export function translateZ(z: number)
		{
			return `perspective(500px) translateZ(${z}px)`;
		}
		
		export const click = "pointerdown";
		
		/** */
		export function vsize(size: number)
		{
			return `min(${size}vmin, ${size * 10}px)`;
		}
		
		/** */
		export function extractVSize(value: string)
		{
			const reg = /([0-9\.]+)vmin/;
			const matches = value.match(reg);
			return Number(matches?.[1]) || 5;
		}
		
		/** */
		export function specificWeight(weight: number): Htx.Param
		{
			return {
				fontWeight: weight.toString(),
				fontVariationSettings: "'wght' " + weight,
			};
		}
		
		/** */
		export function disconnectAfterTransition(e: HTMLElement)
		{
			e.addEventListener("transitionend", () =>
			{
				e.remove();
			},
			{ once: true });
		}
		
		/** */
		export function visibleWhenAlone()
		{
			return Htx.css(":not(:only-child) { display: none !important; }");
		}
		
		/** */
		export function removeTogether(contingent: HTMLElement, target: HTMLElement)
		{
			(async () =>
			{
				await new Promise<void>(r =>
					Htx.defer(contingent, () =>
						Htx.defer(target, () =>
							r())));
				
				if (!contingent.parentElement)
					return;
				
				new MutationObserver(records =>
				{
					for (const rec of records)
						if (Array.from(rec.removedNodes).includes(contingent))
							target.remove();
					
				}).observe(contingent.parentElement, { childList: true });
			})();
		}
		
		/** */
		export function dripper(...params: Htx.Param[]): [HTMLElement, Htx.Event]
		{
			const dripper = Htx.div(
				"dripper",
				CssClass.hide,
				UI.anchor(),
				UI.flexCenter,
				{
					margin: "auto",
					zIndex: "9",
					
					backgroundColor: UI.color({ l: 20, a: 0.85 }),
					border: "3px solid " + UI.color({ l: 20 }),
					borderRadius: UI.borderRadius.default,
					fontSize: "40px",
					fontWeight: "700",
					color: "white"
				},
				Htx.on("dragleave", ev =>
				{
					ev.preventDefault();
					dripper.classList.add(CssClass.hide);
				}),
				Htx.on("dragend", ev =>
				{
					dripper.classList.add(CssClass.hide);
				}),
				Htx.on("dragover", ev =>
				{
					ev.preventDefault();
				}),
				Htx.on("drop", ev =>
				{
					dripper.classList.add(CssClass.hide);
					
					if (!ev.dataTransfer)
						ev.stopImmediatePropagation();
				}),
				...params
			);
			
			const evt = Htx.on("dragenter", ev =>
			{
				ev.preventDefault();
				dripper.classList.remove(CssClass.hide);
			});
			
			return [dripper, evt];
		}
		
		/** */
		export function actionButton(style: "filled" | "outline", ...params: Htx.Param[])
		{
			return Htx.div(
				UI.clickable,
				{
					textAlign: "center",
					fontWeight: "500",
					padding: "15px",
					borderRadius: UI.borderRadius.default
				},
				style === "filled" ?
					{
						backgroundColor: UI.primaryColor,
						color: "white",
					} :
					{
						border: "3px solid " + UI.primaryColor,
						color: UI.primaryColor,
					},
				...params
			);
		}
	}
}
