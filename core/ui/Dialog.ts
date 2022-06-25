
namespace Turf
{
	/** */
	export namespace Dialog
	{
		/** */
		export function prompt(messageText: string, defaultText = "")
		{
			return new Promise<string | null>(resolve =>
			{
				const root = Surface.open({
					background: "black",
					closeOnEscape: true,
					closeFn: () => resolve(null),
					acceptFn: () => resolve(input.value),
				});
				
				{
					const s = root.style;
					s.padding = "35px";
					s.display = "flex";
					s.alignItems = "flex-start";
					s.justifyContent = "center";
					s.flexDirection = "column";
				}
				
				const heading = Htx.h2("", messageText);
				{
					const s = heading.style;
					s.fontSize = "5vmin";
					s.fontWeight = "500";
				}
				root.append(heading);
				
				const input = document.createElement("input");
				input.type = "text";
				input.value = defaultText;
				
				{
					const s = input.style;
					s.display = "block";
					s.marginBottom = "0.5em";
					s.width = "-webkit-fill-available";
					s.width = "fill-available";
					s.padding = "30px 0 10px";
					s.fontSize = "4vmin";
					s.outline = "0";
					s.border = "0";
					s.borderBottom = "1px solid rgba(255, 255, 255, 0.5)";
					s.backgroundColor = "transparent";
				}
				
				input.addEventListener("keydown", ev =>
				{
					if (ev.key === "Enter")
						Surface.accept(root);
				});
				
				Htx.defer(input, () =>
				{
					setTimeout(() => input.focus());
				});
				
				root.append(input);
				document.body.append(root);
			});
		}
		
		/**
		 * Displays an error message as an overlay.
		 * The message may either be a string containing HTML content,
		 * or an HTMLElement.
		 */
		export function message(message: string | HTMLElement)
		{
			hideLoadingOverlay();
			
			const overlayDiv = Htx.div({
				position: "fixed",
				top: "0",
				left: "0",
				width: "100%",
				height: "100%",
				backgroundColor: "rgba(0, 0, 0, 0.66)",
				color: "white",
				opacity: "0",
				transitionProperty: "opacity",
				transitionDuration: "0.3s",
				display: "flex",
				alignContent: "center",
				alignItems: "center",
				justifyContent: "center",
				justifyItems: "center",
				textAlign: "center",
				backdropFilter: "blur(8px)",
			});
			
			const closeFn = () =>
			{
				overlayDiv.style.opacity = "0";
				overlayDiv.addEventListener("transitionend", () =>
				{
					overlayDiv.remove();
				},
				{ once: true });
			}
			
			overlayDiv.append(Htx.div(
				{
					position: "absolute",
					top: "1vmin",
					right: "1vmin",
					width: "5vmin",
					height:"5vmin",
					transformOrigin: "50% 50%",
					transform: "rotate(45deg)",
					cursor: "pointer",
					background: `
						linear-gradient(white, white) no-repeat 50% 0 / 1px 100%,
						linear-gradient(white, white) no-repeat 0 50% / 100% 1px
					`
				},
				Htx.on(UI.click, () => closeFn())
			));
			
			if (typeof message === "string")
			{
				const messageDiv = Htx.div(
					{
						fontSize: "4wmin"
					}
				);
				
				messageDiv.innerHTML = message;
				overlayDiv.append(messageDiv);
			}
			else overlayDiv.append(message);
			
			document.body.append(overlayDiv);
			setTimeout(() => overlayDiv.style.opacity = "1", 10);
			
			return closeFn;
		}
		
		/** */
		export function showLoadingOverlay()
		{
			if (loadingOverlay === null)
			{
				const lo = loadingOverlay = Htx.div("ui-loading");
				document.body.append(lo);
				setTimeout(() => lo.style.opacity = "1");
			}
		}
		
		/** */
		export function hideLoadingOverlay()
		{
			const lo = loadingOverlay;
			if (lo)
			{
				lo.style.opacity = "0";
				lo.addEventListener("transitionend", () => lo.remove());
				loadingOverlay = null;
			}
		}
		let loadingOverlay: HTMLElement | null = null;
		
	}
}
