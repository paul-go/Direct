
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
					minWidth: "10em",
				},
				Htx.css(":not(:empty)", { display: "inline-block" }),
				When.connected(() => this.setupSizeObserver())
			);
			
			for (const action of record.actions)
				this.bindAction(action);
			
			this.actions = new Cage.Array(this.root, CanvasAction);
			this.actions.observe(() => record.save());
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
			const ctv = Not.nullable(Cage.under(csv, CanvasTitleView));
			const cdv = Not.nullable(Cage.under(csv, CanvasDescriptionView));
			
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
			this.bindAction(actionRecord);
			setTimeout(() => this.root.focus());
		}
		
		/** */
		setFontSize(size: number)
		{
			this.root.style.fontSize = UI.vsize(size);
		}
		
		/** */
		private bindAction(actionRecord: ActionRecord)
		{
			this.actions.insert(new CanvasAction(this.record, actionRecord));
		}
	}
	
	/** */
	class CanvasAction
	{
		/** */
		constructor(
			readonly sceneRecord: CanvasSceneRecord,
			readonly actionRecord: ActionRecord)
		{
			this.root = Htx.div(
				"canvas-action",
				UI.backdropBlur(15),
				{
					marginTop: "20px",
					textAlign: "center",
				},
				this.editableContainer = Htx.div(
					"canvas-action-editable",
					{
						padding: "10px 30px",
						minWidth: "10em",
						lineHeight: ConstN.descriptionLineHeight.toString(),
						fontWeight: "700",
					},
					Editable.single({
						placeholderText: "Enter Button Text...",
					}),
				),
				this.menuContainer = Htx.div(
					"menu-container",
					{
						position: "absolute",
						top: "0.5em",
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
							
							"Goes to...": () => this.showTargetEditor(),
							...canMoveUp ? { "Move Up": () => this.moveUp() } : {},
							...canMoveDown ? { "Move Down": () => this.moveDown() } : {},
							"Delete": () => this.delete(),
						});
					}),
					new Text("•••"),
				)
			);
			
			this.shape = this.sceneRecord.actionShape;
			this.filled = actionRecord.filled;
			this.text = actionRecord.text;
			this.target = actionRecord.target;
			
			Cage.set(this);
		}
		
		readonly root;
		private readonly menuContainer;
		private readonly editableContainer;
		
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
		showTargetEditor()
		{
			
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
			return this._shape;
		}
		set shape(shape: CanvasActionShape)
		{
			this.sceneRecord.actionShape = shape;
			
			const siblings = this.root.parentElement ? 
				Cage.map(this.root.parentElement, CanvasAction) :
				[this];
				
			for (const sibling of siblings)
			{
				sibling.root.classList.remove(
					CanvasActionShape.box,
					CanvasActionShape.round);
				
				sibling._shape = shape;
				sibling.root.classList.add(shape);
			}
		}
		private _shape = CanvasActionShape.round;
		
		/** (Unused) */
		get filled()
		{
			return this._filled;
		}
		set filled(filled: boolean)
		{
			this._filled = filled;
			this.root.classList.toggle(CssClass.canvasActionFilled, filled);
			this.root.classList.toggle(CssClass.canvasActionOutlined, !filled);
		}
		private _filled = false;
		
		/** */
		get target()
		{
			return this._target;
		}
		set target(target: string | Blob)
		{
			this._target = target;
		}
		private _target: string | Blob = "";
	}
}
