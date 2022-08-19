
namespace App
{
	/** */
	export class CanvasActionManager
	{
		/** */
		constructor(readonly record: CanvasSceneRecord)
		{
			this.root = Htx.div(
				CssClass.canvasActions,
				{
					width: "fit-content",
				},
				Htx.css(":not(:empty)", { display: "inline-block" }),
				When.connected(() => this.setupSizeObserver())
			);
			
			this.actions = new Cage.Array(this.root, CanvasAction);
			
			for (const action of record.actions)
				this.bindAction(action);
			
			this.actions.observe(() =>
			{
				record.actions = this.actions.map(ca => ca.actionRecord);
				record.save();
			});
			Cage.set(this);
		}
		
		readonly root;
		private readonly actions;
		
		/**
		 * Listens for changes to the size of the titles and the description,
		 * and resizes the root element accordingly.
		 */
		private setupSizeObserver()
		{
			const csv = Cage.over(this, CanvasSceneView);
			const ctv = Not.nullable(Cage.under(csv, CanvasTitleView)?.at(0));
			const cdv = Not.nullable(Cage.under(csv, CanvasDescriptionView)?.at(0));
			
			const ro = new ResizeObserver(() =>
			{
				const widthTarget =
					cdv.text ? cdv.root :
					ctv.getTextBox(-1)?.root || null;
				
				this.root.style.minWidth = widthTarget ?
					widthTarget.offsetWidth + "px" :
					"10em";
			});
			
			ro.observe(cdv.root);
			
			const updateTitleWatchers = () =>
			{
				for (const box of ctv.getTextBoxes())
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
			const ca = new CanvasAction(this.record, actionRecord)
			this.actions.insert(ca);
			return ca;
		}
	}
	
	/** */
	export class CanvasAction
	{
		/** */
		constructor(
			readonly sceneRecord: CanvasSceneRecord,
			readonly actionRecord: ActionRecord)
		{
			this.linkEditor = new LinkEditorView();
			this.linkEditor.setCommitFn(target => this.target = target);
			
			this.root = Htx.div(
				"canvas-action-container",
				this.editableContainer = Htx.div(
					CssClass.canvasAction,
					{
						width: "100%",
					},
					Htx.on("focusout", () => this.actionRecord.text = this.text),
					Htx.on("input", () => this.actionRecord.text = this.text),
					Htx.css(":empty", { textAlign: "left" }),
					
					Editable.single({
						placeholderText: "Enter Button Text...",
						placeholderCss: {
							fontStyle: "italic",
							fontWeight: "500",
						},
					}),
				),
				this.menuContainer = Htx.div(
					"menu-container",
					{
						position: "absolute",
						top: "calc(10px + 0.25em)",
						right: "-3em",
						textShadow: "0 0 10px black, 0 0 10px black",
					},
					Htx.css(`.${Origin.topRight} &, .${Origin.right} &, .${Origin.bottomRight} &`, {
						right: "auto",
						left: "-3em",
					}),
					
					UI.click(() =>
					{
						const canMoveUp = !!Cage.previous(this.root, CanvasAction);
						const canMoveDown = !!Cage.next(this.root, CanvasAction);
						
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
					Cage.over(this, ForegroundMixin).root.append(this.linkEditor.root);
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
			Cage.set(this);
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
			const prev = Cage.previous(this.root, CanvasAction);
			prev?.root.before(this.root);
		}
		
		/** */
		moveDown()
		{
			const next = Cage.next(this.root, CanvasAction);
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
				Cage.map(this.root.parentElement, CanvasAction) :
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
	}
}
