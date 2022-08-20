
namespace App
{
	/** */
	export class CanvasActionSetHat
	{
		/** */
		constructor(readonly record: CanvasSceneRecord)
		{
			this.root = Hot.div(
				CssClass.canvasActions,
				{
					width: "fit-content",
				},
				Hot.css(":not(:empty)", { display: "inline-block" }),
				When.connected(() => this.setupSizeObserver())
			);
			
			this.actions = new Hat.Array(this.root, CanvasActionHat);
			
			for (const action of record.actions)
				this.bindAction(action);
			
			this.actions.observe(() =>
			{
				record.actions = this.actions.map(ca => ca.actionRecord);
				record.save();
			});
			
			Hat.wear(this);
		}
		
		readonly root;
		private readonly actions;
		
		/**
		 * Listens for changes to the size of the titles and the description,
		 * and resizes the root element accordingly.
		 */
		private setupSizeObserver()
		{
			const csv = Hat.over(this, CanvasSceneHat);
			const ctv = Not.nullable(Hat.under(csv, CanvasTitleSetHat)?.at(0));
			const cdv = Not.nullable(Hat.under(csv, CanvasDescriptionHat)?.at(0));
			
			const ro = new ResizeObserver(() =>
			{
				const widthTarget =
					cdv.text ? cdv.root :
					ctv.getCanvasTitles().at(-1)?.root || null;
				
				this.root.style.minWidth = widthTarget ?
					widthTarget.offsetWidth + "px" :
					"10em";
			});
			
			ro.observe(cdv.root);
			
			const updateTitleWatchers = () =>
			{
				for (const box of ctv.getCanvasTitles())
					ro.observe(box.root);
			};
			
			UI.onChildrenChanged(ctv.root, updateTitleWatchers);
			updateTitleWatchers();
		}
		
		/** */
		addAction()
		{
			const actionRecord = new ActionRecord();
			this.record.actions.push(actionRecord);
			const ca = this.bindAction(actionRecord);
			ca.focus();
		}
		
		/** */
		setFontSize(size: number)
		{
			this.root.style.fontSize = UI.vsize(size);
		}
		
		/** */
		private bindAction(actionRecord: ActionRecord)
		{
			const ca = new CanvasActionHat(this.record, actionRecord)
			this.actions.insert(ca);
			return ca;
		}
	}
	
	/** */
	export class CanvasActionHat implements IColorable
	{
		/** */
		constructor(
			readonly sceneRecord: CanvasSceneRecord,
			readonly actionRecord: ActionRecord)
		{
			this.linkEditor = new LinkEditorHat();
			this.linkEditor.setCommitFn(target => this.target = target);
			
			this.root = Hot.div(
				"canvas-action-container",
				this.editableContainer = Hot.div(
					CssClass.canvasAction,
					{
						width: "100%",
					},
					Hot.on("focusout", () => this.actionRecord.text = this.text),
					Hot.on("input", () => this.actionRecord.text = this.text),
					Hot.css(":empty", { textAlign: "left" }),
					
					Editable.single({
						placeholderText: "Enter Button Text...",
						placeholderCss: {
							fontStyle: "italic",
							fontWeight: "500",
						},
					}),
				),
				this.menuContainer = Hot.div(
					"menu-container",
					{
						position: "absolute",
						top: "calc(10px + 0.25em)",
						right: "-3em",
						textShadow: "0 0 10px black, 0 0 10px black",
					},
					Hot.css(`.${Origin.topRight} &, .${Origin.right} &, .${Origin.bottomRight} &`, {
						right: "auto",
						left: "-3em",
					}),
					
					UI.click(() =>
					{
						const canMoveUp = !!Hat.previous(this.root, CanvasActionHat);
						const canMoveDown = !!Hat.next(this.root, CanvasActionHat);
						
						UI.springMenu(this.menuContainer, {
							
							...this.shape === CanvasActionShape.box ?
								{ "Use Round Shape": () => this.shape = CanvasActionShape.round } :
								{ "Use Box Shape": () => this.shape = CanvasActionShape.box },
							
							//...this.filled ?
							//	{ "Use Outline Style": () => this.filled = false } :
							//	{ "Use Filled Style": () => this.filled = true },
							
							"Goes to...": () => this.toggleLinkEditor(true),
							...canMoveUp ? { "Move Up": () => this.moveUp() } : {},
							...canMoveDown ? { "Move Down": () => this.moveDown() } : {},
							"Delete": () => this.delete(),
						});
					}),
					new Text("•••"),
				),
				When.connected(() =>
				{
					Hat.over(this, ForegroundMixin).root.append(this.linkEditor.root);
				}),
				When.disconnected(() =>
				{
					this.linkEditor.root.remove();
				}),
			);
			
			this.shape = this.sceneRecord.actionShape;
			this.filled = actionRecord.filled;
			this.text = actionRecord.text;
			this.target = actionRecord.target;
			this.toggleLinkEditor(false);
			Hat.wear(this);
		}
		
		readonly root;
		private readonly menuContainer;
		private readonly editableContainer;
		private readonly linkEditor;
		
		/** */
		focus()
		{
			this.editableContainer.focus();
		}
		
		/** */
		moveUp()
		{
			const prev = Hat.previous(this.root, CanvasActionHat);
			prev?.root.before(this.root);
		}
		
		/** */
		moveDown()
		{
			const next = Hat.next(this.root, CanvasActionHat);
			next?.root.after(this.root);
		}
		
		/** */
		delete()
		{
			this.root.remove();
		}
		
		/** */
		get text()
		{
			return this.editableContainer.textContent || "";
		}
		set text(text: string)
		{
			this.editableContainer.textContent = text;
			this.actionRecord.text = text;
		}
		
		/** */
		get shape()
		{
			return this.sceneRecord.actionShape;
		}
		set shape(shape: CanvasActionShape)
		{
			this.sceneRecord.actionShape = shape;
			
			const siblings = this.root.parentElement ? 
				Hat.map(this.root.parentElement, CanvasActionHat) :
				[this];
				
			for (const sibling of siblings)
			{
				sibling.editableContainer.classList.remove(
					CanvasActionShape.box,
					CanvasActionShape.round);
				
				sibling.editableContainer.classList.add(shape);
			}
		}
		
		/** (Unused) */
		get filled()
		{
			return this.actionRecord.filled;
		}
		set filled(filled: boolean)
		{
			this.actionRecord.filled = filled
			this.editableContainer.classList.toggle(CssClass.canvasActionFilled, filled);
			this.editableContainer.classList.toggle(CssClass.canvasActionOutlined, !filled);
		}
		
		/** */
		get target()
		{
			return this.actionRecord.target;
		}
		set target(target: string)
		{
			this.actionRecord.target = target;
		}
		
		/** */
		private toggleLinkEditor(visible: boolean)
		{
			this.linkEditor.root.classList.toggle(CssClass.hide, !visible);
			
			if (visible)
				setTimeout(() => this.linkEditor.focus());
		}
		
		/** */
		get hasColor()
		{
			return this._hasColor;
		}
		set hasColor(hasColor: boolean)
		{
			this._hasColor = hasColor;
		}
		private _hasColor = false;
	}
}
