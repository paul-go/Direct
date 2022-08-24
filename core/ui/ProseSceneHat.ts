
namespace App
{
	/** */
	export class ProseSceneHat extends SceneHat
	{
		/** */
		constructor(readonly record = new ProseSceneRecord())
		{
			super(record);
			
			this.trixEditorElement = this.createTrixEditor();
			
			Hot.get(this.sceneContainer)(
				{
					height: "auto",
				},
				Hot.div(
					CssClass.proseScene,
					{
						display: "flex",
						flexDirection: "column",
						minHeight: UI.vsize(100),
						color: `var(${ConstS.foreUncolorProperty})`,
					},
					e => void new ForegroundHat(e),
					this.sceneForeground = Hot.div(
						CssClass.proseSceneForeground,
						{
							display: "flex",
							flex: "1 0",
							
							// These values overridden from what is here by default
							// (and and what is rendered in the output).
							paddingTop: "100px",
							paddingBottom: "100px",
						},
						UI.keyable,
						
						Hot.get(this.trixEditorElement)(
							{
								flex: "1 0",
								outline: 0,
							},
							Hot.css("& H1, & A", {
								color: `var(${accentColorProperty})`
							}),
						),
						
						(this.linkEditor = new LinkEditorHat()).head
					)
				),
				When.connected(() =>
				{
					this.updateButtons();
					this.trixEditorElement.focus({ preventScroll: false });
				})
			);
			
			this.setSceneButtons(
				() => this.updateButtons(),
				this.setupButton(this.headingButton, "heading1"),
				this.setupButton(this.paragraphButton, "heading1"),
				this.setupButton(this.boldButton, "bold"),
				this.setupButton(this.italicButton, "italic"),
				this.setupButton(this.linkButton, "href"),
				this.colorButton,
			);
			
			this.head.addEventListener("paste", ev =>
			{
				ev.preventDefault();
				
				const htmlText = ev.clipboardData?.getData("text/html");
				if (htmlText)
				{
					const htmlTextSanitized = App.sanitizeArbitraryHtml(htmlText);
					this.trixEditorElement.editor.recordUndoEntry("Paste HTML");
					this.trixEditorElement.editor.insertHTML(htmlTextSanitized);
					return;
				}
				
				const plainText = ev.clipboardData?.getData("text/plain");
				if (plainText)
				{
					this.trixEditorElement.editor.recordUndoEntry("Paste Text");
					this.trixEditorElement.editor.insertString(plainText);
					return;
				}
				
			}, { capture: true });
			
			this.trixEditorElement.addEventListener("trix-selection-change", () => 
			{
				if (!this.blockSelectionChangeEvents)
				{
					this.updateButtons();
					this.maybeHideColorConfigurator();
				}
			});
			
			// Prevents images from being dragged and dropped
			this.trixEditorElement.addEventListener("trix-file-accept", ev =>
			{
				ev.preventDefault();
			});
			
			this.trixEditorElement.addEventListener("trix-blur", () =>
			{
				this.save();
			});
			
			// Setup the placeholder
			this.trixEditorElement.setAttribute("placeholder", "Write something inspiring here...");
			Hot.get(this.trixEditorElement)(
				Hot.css(":before", {
					fontSize: "30px",
					color: `var(${ConstS.foreUncolorProperty})`,
					opacity: 0.33,
				})
			);
			
			this.linkEditor.setCommitFn(link => this.commitLink(link));
			this.setupAutoSaver();
			
			When.connected(this.head, () =>
			{
				if (record.content)
				{
					// Awkward: You need to clone the JSON object
					// because the record object has a bunch of proxies
					// installed in it, and this is causing Trix to get confused.
					const content = Util.deepObjectClone(record.content);
					this.trixEditorElement.editor.loadJSON(content);
				}
			});
			
			this.hueSwatch = new HueSwatchHat(this.record);
			Hot.get(this.hueSwatch.head)(
				{ tabIndex: 0 },
				Hot.on("focusout", () => setTimeout(() =>
				{
					this.maybeHideColorConfigurator();
				}))
			);
			
			this.lightnessForeSwatch = new LightnessSwatchHat(Origin.topLeft);
			this.lightnessForeSwatch.targetsBackground = false;
			this.lightnessForeSwatch.setChangedFn(() =>
			{
				this.lightnessBackSwatch.isDarkSelected = !this.lightnessForeSwatch.isDarkSelected;
			});
			
			this.lightnessBackSwatch = new LightnessSwatchHat(Origin.bottomRight);
			this.lightnessBackSwatch.targetsBackground = true;
			this.lightnessBackSwatch.setChangedFn(() =>
			{
				this.lightnessForeSwatch.isDarkSelected = !this.lightnessBackSwatch.isDarkSelected;
			});
		}
		
		private readonly sceneForeground;
		private readonly hueSwatch;
		private readonly lightnessForeSwatch;
		private readonly lightnessBackSwatch;
		
		/** */
		updateLightness()
		{
			this.record.hasColorAccents = this.lightnessForeSwatch.isColorSelected;
			this.trixEditorElement.style.setProperty(accentColorProperty, this.record.hasColorAccents ? 
				`var(${ConstS.foreColorProperty})` :
				`var(${ConstS.foreUncolorProperty})`);
			
			this.hasColor = this.lightnessBackSwatch.isColorSelected;
			this.record.setDarkOnLight(!this.lightnessBackSwatch.isDarkSelected);
			super.updateLightness();
		}
		
		/** */
		private maybeHideColorConfigurator()
		{
			const ancestors = Query.ancestors(document.activeElement);
			if (!ancestors.includes(this.hueSwatch.head))
			{
				this.colorButton.selected = false;
				this.setSceneConfigurator(null);
			}
		}
		
		/** */
		private get editor() { return this.trixEditorElement.editor; }
		
		private readonly trixEditorElement: HTMLTrixElement;
		private readonly linkEditor;
		
		private readonly headingButton = new SceneButtonHat("Heading", {
			independent: true,
			selectable: false,
			unselectable: false
		});
		
		private readonly paragraphButton = new SceneButtonHat("Paragraph", {
			independent: true,
			selectable: false,
			unselectable: false
		});
		
		private readonly boldButton = new SceneButtonHat("Bold", {
			independent: true,
			selectable: false,
			unselectable: false
		});
		
		private readonly italicButton = new SceneButtonHat("Italic", {
			independent: true,
			selectable: false,
			unselectable: false
		});
		
		private readonly linkButton = new SceneButtonHat("Link", {
			independent: true,
			selectable: false,
			unselectable: false
		});
		
		private readonly colorButton = new SceneButtonHat("Color", {
			selectable: true,
			unselectable: true,
		});
		
		/**
		 * Creates a Trix editor element and it's associated toolbar element, and returns
		 * both of these elements which can be inserted anywhere in the DOM.
		 */
		private createTrixEditor()
		{
			const trixEditor = document.createElement("trix-editor") as HTMLTrixElement;
			
			const tempElement = Hot.div(
				"temp-element",
				UI.anchor(),
				{ left: "-99999px", pointerEvents: "none", opacity: 0 },
				trixEditor
			);
			
			document.body.append(tempElement);
			tempElement.remove();
			
			return trixEditor;
		}
		
		/** */
		private setupButton(button: SceneButtonHat, attribute: TrixAttribute)
		{
			button.head.addEventListener("click", ev =>
			{
				ev.preventDefault();
				
				if (this.editor.attributeIsActive(attribute))
				{
					if (this.isCollapsed)
					{
						this.editor.recordUndoEntry("(Collapsed) Deactivate Attribute: " + attribute);
						this.doTemporarySelectionExpansion(attribute, () =>
						{
							this.editor.deactivateAttribute(attribute);
						});
					}
					else
					{
						this.editor.recordUndoEntry("Deactivate Attribute: " + attribute);
						this.editor.deactivateAttribute(attribute);
					}
					
					this.updateButtons();
				}
				else
				{
					this.editor.recordUndoEntry("Activate: " + attribute);
					
					if (button === this.linkButton)
					{
						this.editor.activateAttribute(attribute, "");
						this.updateButtons();
						this.linkEditor.focus();
					}
					else
					{
						this.editor.activateAttribute(attribute);
						this.updateButtons();
					}
				}
			});
			
			return button;
		}
		
		/** */
		private updateButtons()
		{
			const [start, finish] = this.editor.getSelectedRange();
			const hasRangeSelection = start !== finish;
			const hasHeading = this.editor.attributeIsActive("heading1");
			const hasBold = this.editor.attributeIsActive("bold");
			const hasItalic = this.editor.attributeIsActive("italic");
			const hasLink = this.editor.attributeIsActive("href");
			const hasContent = (this.trixEditorElement.textContent?.trim() || "").length > 0;
			
			UI.toggle(this.headingButton.head, hasContent && !hasRangeSelection && !hasHeading);
			UI.toggle(this.paragraphButton.head, hasContent && !hasRangeSelection && hasHeading);
			UI.toggle(this.boldButton.head, hasContent && !hasHeading && (hasRangeSelection || hasBold));
			UI.toggle(this.italicButton.head, hasContent && !hasHeading && (hasRangeSelection || hasItalic));
			UI.toggle(this.linkButton.head, hasContent && !hasHeading && (hasRangeSelection || hasLink));
			this.linkEditor.toggle(hasLink);
			
			if (hasLink)
				this.linkEditor.link = this.getCurrentHref();
			
			if (this.colorButton.selected)
			{
				this.sceneContainer.append(this.lightnessBackSwatch.head);
				
				const firstHeading = this.trixEditorElement.querySelector("H1, H2") as HTMLElement | null;
				if (firstHeading)
				{
					const fgRect = this.sceneForeground.getBoundingClientRect();
					const headingRect = firstHeading.getBoundingClientRect();
					const s = this.lightnessForeSwatch.head.style;
					const swatchHeight = 90; // Hack
					s.padding = "0";
					s.top = ((headingRect.top - fgRect.top) - swatchHeight) + "px";
					s.left = "-" + UI.borderRadius.large;
					this.sceneForeground.append(this.lightnessForeSwatch.head);
				}
				
				this.setSceneConfigurator(this.hueSwatch.head);
			}
			else
			{
				this.lightnessForeSwatch.head.remove();
				this.lightnessBackSwatch.head.remove();
				this.setSceneConfigurator(null);
			}
		}
		
		/** */
		private commitLink(link: string)
		{
			if (this.getCurrentHref() === link)
				return;
			
			this.editor.recordUndoEntry("Update Link");
			
			const update = () =>
			{
				if (link)
					this.editor.activateAttribute("href", link);
				else
					this.editor.deactivateAttribute("href");
			}
			
			if (this.isCollapsed)
				this.doTemporarySelectionExpansion("href", update);
			else
				update();
		}
		
		/** */
		private getCurrentHref(): string
		{
			const editor = this.editor as any;
			return editor.composition?.getCurrentAttributes()?.href || "";
		}
		
		/** */
		private get isCollapsed()
		{
			const [start, end] = this.editor.getSelectedRange();
			return start === end;
		}
		
		/**
		 * Expands the selection to include the range with common formatting,
		 * then executes the specified function, and then returns the selection
		 * back to it's original state.
		 */
		private doTemporarySelectionExpansion(attribute: TrixAttribute, fn: () => void)
		{
			this.blockSelectionChangeEvents = true;
			const [start, end] = this.editor.getSelectedRange();
			const doc = this.editor.getDocument();
			const range = doc.getRangeOfCommonAttributeAtPosition(attribute, start);
			this.editor.setSelectedRange(range);
			fn();
			this.editor.setSelectedRange([start, end]);
			this.blockSelectionChangeEvents = false;
		}
		private blockSelectionChangeEvents = false;
		
		/**
		 * Sets up a recursive auto-saver that runs every 4 seconds, if an edit has occured.
		 */
		private setupAutoSaver()
		{
			let isDirty = false;
			
			const maybeSave = () =>
			{
				setTimeout(() =>
				{
					if (isDirty)
					{
						this.save();
						isDirty = false;
					}
					
					maybeSave();
				},
				500);
			};
			
			maybeSave();
			
			this.trixEditorElement.addEventListener("trix-change", () =>
			{
				isDirty = true;
			});
		}
		
		/** */
		private save()
		{
			this.record.content = Util.deepObjectClone(this.editor.toJSON());
		}
	}
	
	const accentColorProperty = "--accent-color";
}
