
namespace Turf
{
	export namespace UI
	{
		/** */
		export const mul = "✕";
		
		/** */
		export const lineIconThickness = 3;
		
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
		export const primaryColor = UI.color({ s: 70, l: 30 });
		
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
		export function gray(value = 128, alpha = 1)
		{
			return alpha === 1 ?
				`rgb(${value}, ${value}, ${value})` :
				`rgba(${value}, ${value}, ${value}, ${alpha})`;
		}
		
		/** */
		export const borderRadius = {
			default: "5px",
			large: "15px",
			max: "9999px",
		} as const;
		
		/** */
		export const clickable: Htx.Style = {
			userSelect: "none",
			cursor: "pointer"
		} as const;
		
		/** */
		export const presentational: Htx.Style = {
			pointerEvents: "none",
			cursor: "default",
			userSelect: "none",
		};
		
		/** */
		export const keyable: Htx.Param = {
			tabIndex: 0,
			outline: "0",
		};
		
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
		export function anchorTop(amount = 0)
		{
			return <Htx.Style>{
				position: "absolute",
				top: amount + "px",
				left: amount + "px",
				right: amount + "px",
			};
		}
		
		/** */
		export function anchorBottom(amount = 0)
		{
			return <Htx.Style>{
				position: "absolute",
				bottom: amount + "px",
				left: amount + "px",
				right: amount + "px",
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
		export function anchorTopLeft(x = 0, y = x)
		{
			return <Htx.Style>{
				position: "absolute",
				top: y + "px",
				left: x + "px",
			};
		}
		
		/** */
		export function anchorTopRight(x = 0, y = x)
		{
			return <Htx.Style>{
				position: "absolute",
				top: y + "px",
				right: x + "px",
			};
		}
		
		/** */
		export function anchorBottomLeft(x = 0, y = x)
		{
			return <Htx.Style>{
				position: "absolute",
				bottom: y + "px",
				left: x + "px",
			};
		}
		
		/** */
		export function anchorBottomRight(x = 0, y = x)
		{
			return <Htx.Style>{
				position: "absolute",
				bottom: y + "px",
				right: x + "px",
			};
		}
		
		/** */
		export function anchorCenter(width: string | number, height: string | number = width)
		{
			return <Htx.Style>{
				...anchor(),
				margin: "auto",
				width: typeof width === "number" ? width + "px" : width,
				height: typeof height === "number" ? height + "px" : height,
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
		export const flexVCenter: Htx.Style = {
			display: "flex",
			alignItems: "center",
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
		export function specificWeight(weight: number): Htx.Style
		{
			return {
				fontWeight: (Math.round(weight / 100) * 100).toString(),
				fontVariationSettings: "'wght' " + weight,
			};
		}
		
		/** */
		export function text(size: number | bigint, weight: number, label?: string)
		{
			return [
				{
					fontSize: typeof size === "number" ? UI.vsize(size) : size + "px",
					...UI.specificWeight(weight)
				},
				label ? new Text(label) : null
			];
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
		export async function lockBody(innerFn: () => Promise<void>)
		{
			document.body.style.overflow = "hidden";
			document.body.style.pointerEvents = "none";
			
			try
			{
				const result = innerFn();
				if (result instanceof Promise)
					await result;
			}
			catch (e)
			{
				debugger;
			}
			
			document.body.style.removeProperty("overflow");
			document.body.style.removeProperty("pointer-events");
		}
		
		/** */
		export function plusButton(...params: Htx.Param[])
		{
			const bar: Htx.Param = {
				position: "absolute",
				backgroundColor: "white",
			};
			
			return Htx.div(
				e =>
				{
					
				},
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
						left: "50%",
					}
				),
				Htx.div(
					bar,
					{
						height: UI.lineIconThickness + "px",
						left: "0",
						right: "0",
						top: "50%",
					}
				),
				...params,
			);
		}
		
		/** */
		export function settingsIcon(...params: Htx.Param[])
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
		export function chevron(...params: Htx.Param[])
		{
			return Htx.div(
				{
					width: "25px",
					height: "25px",
					border: UI.lineIconThickness + "px solid white",
					borderTopWidth: "0",
					borderRightWidth: "0",
					transformOrigin: "50% 50%",
					transform: "rotate(45deg)"
				},
				...params,
			);
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
					fontWeight: "800",
					padding: "25px",
					fontSize: "25px",
					borderRadius: UI.borderRadius.max
				},
				style === "filled" ?
					{
						backgroundColor: UI.gray(40),
						color: "white",
					} :
					{
						border: "3px solid " + UI.gray(40),
						color: UI.white(),
					},
				...params
			);
		}
		
		/** */
		export function springMenu(
			target: EventTarget | null,
			menu: ObjectLiteral<string, () => void>)
		{
			const overlay = Htx.div(
				UI.fixed(),
				{
					tabIndex: 0,
					zIndex: "0",
				},
				Htx.on("pointerdown", ev =>
				{
					if (ev.target === overlay)
						overlay.remove();
					
				}, { capture: true }),
				
				Htx.on("keydown", ev =>
				{
					if (ev.key === "Escape")
						overlay.remove();
					
				}, { capture: true }),
				
				Htx.div(
					{
						tabIndex: 0,
						position: "absolute",
						minWidth: "200px",
						backgroundColor: UI.gray(100, 0.5),
						backdropFilter: "blur(15px)",
						borderRadius: UI.borderRadius.large,
						overflow: "hidden",
						visibility: "hidden",
						transformOrigin: "50% 100%",
						//transform: "translateZ(-500px)",
						perspective: "1000px",
						transitionDuration: "0.2s",
						transitionProperty: "transform"
					},
					
					...Object.entries(menu).map(([label, callbackFn]) =>
					{
						return Htx.div(
							{
								borderBottom: "1px solid black",
								padding: "20px",
								color: "white",
								fontSize: "22px",
								fontWeight: "600",
							},
							Htx.css(":hover { background-color: #007cd3; }"),
							UI.clickable,
							Htx.on("click", () =>
							{
								callbackFn();
								overlay.remove();
							}),
							new Text(label),
						);
					}),
					
					e =>
					{
						if (target instanceof Element)
						{
							const rect = target.getBoundingClientRect();
							const rectCenterX = rect.left + rect.width / 2;
							const rectCenterY = rect.top + rect.height / 2;
							
							e.style.left = (rectCenterX - e.offsetWidth / 2) + "px";
							
							if (rectCenterY > winCenterY)
								e.style.bottom = (window.innerHeight - rect.top - 10) + "px";
							else
								e.style.top = (rect.bottom + 10) + "px";
						}
						else
						{
							e.style.top = (winCenterX - e.offsetWidth / 2) + "px";
							e.style.left = (winCenterY - e.offsetHeight / 2) + "px";
						}
						
						e.style.visibility = "visible";
						e.focus();
					}
				)
			);
			
			const winCenterX = window.innerWidth / 2;
			const winCenterY = window.innerHeight / 2;
			
			document.body.append(overlay);
		}
	}
}
