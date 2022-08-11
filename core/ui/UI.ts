
namespace App
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
		export const themeColor = UI.color({ s: 70, l: 30 });
		
		/** */
		export const darkGrayBackground = "rgb(20, 20, 20)";
		
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
		export const toolButtonTheme: Htx.Style = {
			backgroundColor: UI.gray(40, 0.5),
			backdropFilter: "blur(5px)",
			borderRadius: UI.borderRadius.large,
			color: "white",
		};
		
		/** */
		export const clickable: Htx.Style = {
			userSelect: "none",
			webkitUserSelect: "none",
			cursor: "pointer"
		} as const;
		
		export const clickEvt = "pointerdown";
		
		/** */
		export function click(handlerFn: (ev: Event) => void)
		{
			return [
				UI.clickable,
				Htx.on("click", handlerFn)
			];
		}
		
		/** */
		export function clickLabel(...params: Htx.Param[])
		{
			return Htx.div(
				{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontWeight: "600",
					fontSize: "20px",
				},
				...params,
				UI.clickable,
			)
		}
		
		/** */
		export function cueLabel(text: string)
		{
			return [
				{
					fontStyle: "italic",
					fontWeight: "700",
					fontSize: "25px",
					color: UI.white(0.5),
				},
				new Text(text)
			];
		}
		
		/** */
		export function toolButton(...params: Htx.Param[])
		{
			return UI.clickLabel(
				UI.toolButtonTheme,
				{
					padding: "10px 30px",
				},
				...params
			);
		}
		
		/**
		 * Creates a button with the style used in the publish option window.
		 */
		export function createPublishButton(label: string, clickFn: () => void)
		{
			toolButtonCls ||= Htx.css(":not(:first-child)", { marginTop: "10px" });
			
			return UI.toolButton(
				toolButtonCls,
				...UI.text(label),
				{
					backgroundColor: UI.themeColor,
				},
				Htx.on(UI.clickEvt, clickFn));
		}
		let toolButtonCls = "";
		
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
		
		/**
		 * Sets the specified element as hidden or not hidden.
		 * Returns a boolean value that indicates whether the
		 * hidden state was changed.
		 */
		export function toggle(e: Element, show = true)
		{
			const stored = e.classList.contains(CssClass.hide);
			
			if (show)
				e.classList.remove(CssClass.hide);
			else
				e.classList.add(CssClass.hide);
				
			return stored !== e.classList.contains(CssClass.hide);
		}
		
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
				bottom = args[2];
				left = args[3];
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
		
		/** */
		export function vsize(size: number)
		{
			return `min(${size}vmin, ${size * 10}px)`;
		}
		
		/** */
		export function vw(size: number)
		{
			return `min(${size}vw, ${size * 10}px)`;
		}
		
		/** */
		export function extractVSize(value: string)
		{
			const reg = /([0-9\.]+)vmin/;
			const matches = value.match(reg);
			return Number(matches?.[1]) || 5;
		}
		
		/** */
		export function appMaxWidth(): Htx.Style
		{
			return TAURI ? {} : {
				maxWidth: ConstN.appMaxWidth + "px",
				margin: "auto",
			};
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
		export function backdropBlur(pixels = 5): Htx.Style
		{
			const value = pixels > 0 ? `blur(${pixels}px)` : "none";
			return {
				backdropFilter: value,
				webkitBackdropFilter: value,
			};
		}
		
		/** */
		export function text(label: string = "", size: number | string = 20, weight?: number): Htx.Param[]
		{
			return [
				{
					fontSize: typeof size === "number" ? size + "px" : size,
					userSelect: "none",
				},
				weight ? UI.specificWeight(weight) : null,
				label ? new Text(label) : null,
				e =>
				{
					// Only apply this weakly. The goal here is to get away from the I-beam,
					// but other uses of this function could specify a pointer or something else,
					// so this function shouldn't overwrite that.
					if (e.style.cursor === "")
						e.style.cursor = "default";
				}
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
		
		/**
		 * Returns a placeholder DOM Node that is replaced with the contents
		 * of the specified function, when the attached element is connected
		 * to the DOM.
		 */
		export function spaceFor(fn: () => HTMLElement | void): Htx.Param[]
		{
			const comment = document.createComment("pending");
			return [
				comment,
				When.connected(() =>
				{
					const returnedElement = fn();
					if (returnedElement)
						comment.replaceWith(returnedElement);
					else
						comment.remove();
				})
			];
		}
		
		/** */
		export async function wait(ms = 0)
		{
			return new Promise(r => setTimeout(r, ms));
		}
		
		/** */
		export async function waitTransitionEnd(e: Element)
		{
			await new Promise<void>(r => e.addEventListener("transitionend", ev =>
			{
				if (ev.target === e)
					r();
			}));
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
			return Htx.css(":not(:only-child)", { display: "none" });
		}
		
		/** */
		export function visibleWhenNotAlone()
		{
			return Htx.css(":only-child", { display: "none" });
		}
		
		/** */
		export function visibleWhenEmpty(watchTarget: HTMLElement): Htx.Param
		{
			return () => [
				watchTarget.children.length === 0 ? "" : CssClass.hide,
				When.connected(e => addVisibilityObserver(e, watchTarget, true)),
			];
		}
		
		/** */
		export function visibleWhenNotEmpty(watchTarget: HTMLElement): Htx.Param
		{
			return () => [
				watchTarget.children.length === 0 ? CssClass.hide : "",
				When.connected(e => addVisibilityObserver(e, watchTarget, false)),
			];
		}
		
		/** */
		function addVisibilityObserver(
			visibilityTarget: HTMLElement,
			watchTarget: HTMLElement,
			forEmpty: boolean)
		{
			const exec = () =>
			{
				const children = Query.children(watchTarget);
				
				if (forEmpty && children.length > 0)
					visibilityTarget.classList.add(CssClass.hide);
				
				else if (!forEmpty && children.length === 0)
					visibilityTarget.classList.add(CssClass.hide);
				
				else
					visibilityTarget.classList.remove(CssClass.hide);
			};
			
			exec();
			UI.onChildrenChanged(watchTarget, exec);
		}
		
		/** */
		export function onChildrenChanged(e: HTMLElement, fn: () => void)
		{
			new MutationObserver(() => fn()).observe(e, { childList: true });
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
		export function escape(removedFn?: (e: HTMLElement) => void): Htx.Param[]
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
						ev.preventDefault();
						removedFn?.(ev.currentTarget as HTMLElement);
					}
					
				}, { capture: true }),
				When.connected(e => e.focus())
			];
		}
		
		/** */
		export function removeOnEscape(removedFn?: () => void): Htx.Param[]
		{
			return UI.escape(async e =>
			{
				await UI.removeWithFade(e);
				removedFn?.();
			});
		}
		
		/** */
		export function removeOnClick(removedFn?: () => void)
		{
			return Htx.on(UI.clickEvt, async ev =>
			{
				if (ev.target === ev.currentTarget)
				{
					await UI.removeWithFade(ev.currentTarget as HTMLElement);
					removedFn?.();
				}
				
			}, { capture: true });
		}
		
		/** */
		export function toggleEnumClass<T extends Literal<string, string>>(
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
		
		const prefixes = new Map<Literal<string, string>, string>();
		
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
				UI.plusButton.name,
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
				Htx.css(" *", { pointerEvents: "none" }),
				Htx.on("dragleave", ev =>
				{
					ev.preventDefault();
					dripper.classList.add(CssClass.hide);
				}),
				Htx.on("dragend", ev =>
				{
					dripper.classList.add(CssClass.hide);
				}),
				Htx.on("dragenter", ev =>
				{
					ev.preventDefault();
				}),
				onFileDrop(() =>
				{
					dripper.classList.add(CssClass.hide);
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
		export function getMediaDropCue(
			label: string,
			filesFn: (files: FileLike[]) => void,
			...params: Htx.Param[])
		{
			let input: HTMLInputElement;
			
			return Htx.div(
				"drop-cue",
				UI.anchor(),
				UI.flexCenter,
				UI.clickable,
				Htx.on(UI.clickEvt, () => input.click()),
				
				onFileDrop(files => filesFn(files)),
				
				input = Htx.input(
					{
						type: "file",
						position: "absolute",
						left: "-99999px",
						pointerEvents: "none",
						visibility: "hidden",
					},
					Htx.on("change", async () =>
					{
						const files = await FileLike.fromFiles(input.files);
						if (files.length)
							filesFn(files)
					}),
				),
				...UI.cueLabel(label),
				...params,
			);
		}
		
		/** */
		export function actionButton(style: "filled" | "outline", ...params: Htx.Param[])
		{
			return Htx.div(
				UI.clickable,
				{
					margin: "auto",
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
		export function actionButtonFooter(text: string, ...params: Htx.Param[])
		{
			return UI.actionButton(
				"filled", 
				{
					maxWidth: "400px",
				},
				new Text(text),
				...params);
		}
		
		/** */
		export function springMenu(
			target: EventTarget | null,
			menu: Literal<string, () => void>)
		{
			const overlay = Htx.div(
				UI.fixed(),
				{
					tabIndex: 0,
					zIndex: "0",
				},
				Htx.on(document.body, "pointerdown", ev =>
				{
					ev.preventDefault();
					
					if (ev.target === overlay)
						overlay.remove();
				}),
				Htx.on(document.body, "keydown", ev =>
				{
					if (ev.key === "Escape")
					{
						ev.preventDefault();
						overlay.remove();
					}
				}),
				Htx.div(
					{
						position: "absolute",
						minWidth: "200px",
						backgroundColor: UI.gray(100, 0.5),
						backdropFilter: "blur(15px)",
						borderRadius: UI.borderRadius.large,
						overflow: "hidden",
						visibility: "hidden",
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
							Htx.css(":hover", { backgroundColor: "#007cd3" }),
							UI.clickable,
							Htx.on("click", ev =>
							{
								ev.preventDefault();
								callbackFn();
								overlay.remove();
							}),
							new Text(label),
						);
					}),
					
					When.rendered(e =>
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
					})
				)
			);
			
			const winCenterX = window.innerWidth / 2;
			const winCenterY = window.innerHeight / 2;
			
			document.body.append(overlay);
		}
		
		/** */
		export function spinner(color = "white", ...params: Htx.Param[])
		{
			return Htx.div(
				Htx.animation("spin", {
					0: {
						transform: "rotate(0)",
					},
					100: {
						transform: "rotate(360deg)",
					}
				}),
				{
					animationDuration: "1s",
					animationIterationCount: "infinite",
					animationTimingFunction: "linear",
					
					width: "50px",
					height: "50px",
					borderRadius: "100%",
					backgroundImage: `conic-gradient(${color}, transparent)`,
					webkitMaskImage: `radial-gradient(
						transparent 0, transparent 50%, black 51%, black 100%
					)`,
				},
				Htx.css(":before", {
					content: `""`,
					...UI.anchorTop(),
					margin: "auto",
					width: "14%",
					height: "14%",
					backgroundColor: color,
					borderRadius: "100%"
				}),
				...params,
			);
		}
		
		/** */
		export function overlay(...children: Htx.Param[])
		{
			const flipper = createFlipper({
				invisible: {
					backgroundColor: UI.black(0),
					backdropFilter: "blur(0)",
				},
				visible: {
					backgroundColor: UI.black(0.5),
					backdropFilter: "blur(5px)",
				}
			});
			
			const hide = async (e: HTMLElement) =>
			{
				flipper.invisible();
				await UI.waitTransitionEnd(e);
				e.remove();
			}
			
			const element = Htx.div(
				UI.fixed(),
				...UI.escape(e => hide(e)),
				Htx.on("click", async ev =>
				{
					if (ev.target === ev.currentTarget)
						hide(ev.target as HTMLElement);
				}),
				{
					transitionDuration: "0.33s",
					transitionProperty: "background-color",
				},
				flipper.install(),
				When.rendered(() => flipper.visible()),
				...children,
			);
			
			return { element, flipper };
		}
		
		/** */
		export async function showInlineNotification(
			container: HTMLElement,
			message: string,
			type: "error" | "info")
		{
			const clsVisible = Htx.css({
				opacity: "1",
				transform: "translateY(0)",
			});
			
			const clsInvisible = Htx.css({
				opacity: "0",
				transform: "translateY(20px)",
			});
			
			const notificationDiv = Htx.div(
				UI.anchorTop(10),
				{
					padding: "20px",
					borderRadius: UI.borderRadius.large,
					backgroundColor: type === "error" ? "red" : UI.themeColor,
					boxShadow: "0 10px 20px " + UI.black(0.2),
					color: "white",
					pointerEvents: "none",
					transitionProperty: "transform, opacity",
					transitionDuration: "0.2s",
				},
				clsInvisible,
				...UI.text(message, 22, 600)
			);
			
			container.append(notificationDiv);
			await UI.wait();
			
			notificationDiv.classList.remove(clsInvisible);
			
			let cancel = () =>
			{
				cancel = () => {};
				setTimeout(async () =>
				{
					notificationDiv.classList.remove(clsVisible);
					notificationDiv.classList.add(clsInvisible);
					await UI.waitTransitionEnd(notificationDiv);
					notificationDiv.remove();
				},
				200);
			};
			
			Htx.from(notificationDiv)(
				clsVisible,
				Htx.on("pointermove", cancel),
				Htx.on(document.body, "pointerdown", cancel),
				Htx.on(document.body, "keydown", cancel)
			);
		}
	}
}
