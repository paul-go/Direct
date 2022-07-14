
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
		export const shadow = {
			window: { boxShadow: `0 20px 70px 20px ` + UI.black(0.5) }
		};
		
		/** */
		export const clickable: Htx.Style = {
			userSelect: "none",
			cursor: "pointer"
		} as const;
		
		/** */
		export function clickLabel(...params: Htx.Param[])
		{
			return Htx.div(
				UI.clickable,
				{
					display: "flex",
					alignItems: "center",
					fontWeight: "600",
					fontSize: "20px",
				},
				...params
			)
		}
		
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
		export function anchor(): Htx.Style;
		export function anchor(all: number): Htx.Style;
		export function anchor(v: number, h: number): Htx.Style;
		export function anchor(top: number, h: number, bottom: number): Htx.Style;
		export function anchor(top: number, right: number, bottom: number, left: number): Htx.Style;
		export function anchor(...args: number[])
		{
			let top = 0;
			let right = 0;
			let bottom = 0;
			let left = 0;
			
			if (args.length === 1)
			{
				top = right = bottom = left = args[0];
			}
			else if (args.length === 2)
			{
				top = bottom = args[0];
				left = right = args[1];
			}
			else if (args.length === 3)
			{
				top = args[0];
				left = right = args[1];
				bottom = args[2];
			}
			else if (args.length === 4)
			{
				top = args[0];
				right = args[1];
				left = args[2];
				bottom = args[3];
			}
			
			return <Htx.Style>{
				position: "absolute",
				top: top + "px",
				right: right + "px",
				bottom: bottom + "px",
				left: left + "px"
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
				fontWeight: weight.toString(),
				...(weight % 100 === 0 ? {} : { fontVariationSettings: "'wght' " + weight })
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
		export function dripperStyle(position: "top" | "right" | "bottom" | "left")
		{
			return <Htx.Style>{
				pointerEvents: "none",
				...UI.flexCenter,
				...(position === "top" || position === "bottom" ? { height: "50%" } : {}),
				...(position === "left" || position === "right" ? { width: "50%" } : {}),
				...(position === "top" ? UI.anchorTop() : {}),
				...(position === "right" ? UI.anchorRight() : {}),
				...(position === "bottom" ? UI.anchorBottom() : {}),
				...(position === "left" ? UI.anchorLeft() : {}),
			};
		}
		
		/** */
		export async function wait(ms = 0)
		{
			return new Promise(r => setTimeout(r, ms));
		}
		
		/** */
		export async function waitTransitionEnd(e: Element)
		{
			await new Promise<void>(r => e.addEventListener("transitionend", () => r()));
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
		export async function removeWithFade(e: HTMLElement)
		{
			const s = e.style;
			s.opacity = "1";
			s.transitionDuration = "0.2s";
			s.transitionProperty = "opacity";
			await UI.wait();
			s.opacity = "0";
			await UI.waitTransitionEnd(e);
			e.remove();
		}
		
		/** */
		export function removeOnEscape(removedFn?: () => void): Htx.Param[]
		{
			return [
				{
					tabIndex: 0,
					outline: "0",
				},
				Htx.on("keydown", async ev =>
				{
					if (ev.key === "Escape")
					{
						await UI.removeWithFade(ev.currentTarget as HTMLElement);
						removedFn?.();
					}
				}, { capture: true }),
				e => e.focus()
			];
		}
		
		/** */
		export function removeOnClick(removedFn?: () => void)
		{
			return Htx.on(UI.click, async ev =>
			{
				if (ev.target === ev.currentTarget)
				{
					await UI.removeWithFade(ev.currentTarget as HTMLElement);
					removedFn?.();
				}
				
			}, { capture: true });
		}
		
		/** */
		export function toggleEnumClass<T extends ObjectLiteral<string, string>>(
			e: HTMLElement,
			enumType: T,
			enumValue: string)
		{
			const prefix = prefixes.get(enumType) || (() =>
			{
				const values = Object.values(enumType);
				const shortest = values.sort((a, b) => a.length < b.length ? 1 : -1)[0];
				let prefix = "";
				
				for (let i = -1; ++i < shortest.length;)
				{
					if (!values.every(k => k.startsWith(prefix + shortest[i])))
						break;
					
					prefix += shortest[i];
				}
				
				if (prefix === "")
					throw "Cannot flip this class. All members of enum need a common prefix.";
				
				prefixes.set(enumType, prefix);
				return prefix;
			})();
			
			for (const cls of Array.from(e.classList))
				if (cls.startsWith(prefix))
					e.classList.remove(cls);
			
			e.classList.add(enumValue);
		}
		
		const prefixes = new Map<ObjectLiteral<string, string>, string>();
		
		/** */
		export function getLayerCoords(target: HTMLElement, ev: DragEvent | MouseEvent)
		{
			const box = target.getBoundingClientRect();
			const x = ev.clientX - box.left;
			const y = ev.clientY - box.top;
			return { x, y };
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
				UI.removeOnClick(),
				...UI.removeOnEscape(),
				UI.fixed(),
				{
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
