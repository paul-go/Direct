
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
			
			Htx.get(this.sceneContainer)(
				{
					height: "auto",
				},
				Htx.div(
					CssClass.proseScene,
					{
						display: "flex",
						flexDirection: "column",
						minHeight: UI.vsize(100),
					},
					e => void new ForegroundMixin(e),
					Htx.div(
						CssClass.proseSceneForeground,
						{
							display: "flex",
							flex: "1 0",
							
							// These values are different from what gets rendered in the output.
							paddingTop: "10vmin",
							paddingBottom: "10vmin",
						},
						UI.keyable,
						
						Htx.get(this.trixEditorElement)({
							flex: "1 0",
							outline: "0",
						}),
						
						(this.linkEditor = new LinkEditorHat()).root
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
				this.backgroundButton,
			);
			
			this.root.addEventListener("paste", ev =>
			{
				ev.preventDefault();
				
				const htmlText = ev.clipboardData?.getData("text/html");
				if (!htmlText)
					return;
				
				const htmlTextSanitized = App.sanitizeArbitraryHtml(htmlText);
				this.trixEditorElement.editor.recordUndoEntry("Paste HTML");
				this.trixEditorElement.editor.insertHTML(htmlTextSanitized);
				
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
			Htx.get(this.trixEditorElement)(
				Htx.css(":before", {
					fontSize: "30px"
				})
			);
			
			this.linkEditor.setCommitFn(link => this.commitLink(link));
			this.setupAutoSaver();
			
			When.connected(this.root, () =>
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
			
			this.colorConfigurator = new ColorSelectorHat(this.record);
			
			Htx.get(this.colorConfigurator.root)(
				{ tabIndex: 0 },
				Htx.on("focusout", () => setTimeout(() =>
				{
					this.maybeHideColorConfigurator();
				}))
			);
		}
		
		private readonly colorConfigurator;
		
		/** */
		private maybeHideColorConfigurator()
		{
			const ancestors = Query.ancestors(document.activeElement);
			if (!ancestors.includes(this.colorConfigurator.root))
			{
				this.backgroundButton.selected = false;
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
		
		private readonly backgroundButton = new SceneButtonHat("Background", {
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
			
			const tempElement = Htx.div(
				"temp-element",
				UI.anchor(),
				{ left: "-99999px", pointerEvents: "none", opacity: "0" },
				trixEditor
			);
			
			document.body.append(tempElement);
			tempElement.remove();
			
			return trixEditor;
		}
		
		/** */
		private setupButton(button: SceneButtonHat, attribute: TrixAttribute)
		{
			button.root.addEventListener("click", ev =>
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
			
			UI.toggle(this.headingButton.root, hasContent && !hasRangeSelection && !hasHeading);
			UI.toggle(this.paragraphButton.root, hasContent && !hasRangeSelection && hasHeading);
			UI.toggle(this.boldButton.root, hasContent && !hasHeading && (hasRangeSelection || hasBold));
			UI.toggle(this.italicButton.root, hasContent && !hasHeading && (hasRangeSelection || hasItalic));
			UI.toggle(this.linkButton.root, hasContent && !hasHeading && (hasRangeSelection || hasLink));
			this.linkEditor.toggle(hasLink);
			
			if (hasLink)
				this.linkEditor.link = this.getCurrentHref();
			
			this.setSceneConfigurator(
				this.backgroundButton.selected ?
					this.colorConfigurator.root :
					null);
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
}
