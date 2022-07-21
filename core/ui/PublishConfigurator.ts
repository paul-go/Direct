
namespace Turf
{
	/** */
	export type PublishConfiguratorCtor = new(meta: MetaRecord) => PublishConfigurator;
	
	/** */
	export abstract class PublishConfigurator
	{
		/** */
		static register(configuratorType: PublishConfiguratorCtor)
		{
			this.configuratorTypes.push(configuratorType);
		}
		
		/** */
		static get all(): readonly (PublishConfiguratorCtor)[]
		{
			return this.configuratorTypes;
		}
		private static readonly configuratorTypes: (PublishConfiguratorCtor)[] = [];
		
		/** */
		static readonly description: string = "(Unset)";
		
		/** */
		constructor(protected readonly meta: MetaRecord)
		{
			this.root = Htx.div(
				"publish-option",
				{
					display: "flex",
					flex: "1 0",
					margin: "20px 0 30px"
				},
				Htx.div(
					"option-radio",
					{
					},
					this.circle = Htx.div(
						{
							borderRadius: "100%",
							width: "40px",
							height: "40px",
							marginRight: "10px",
							boxShadow: "0 0 0 1px " + UI.black(0.3)
						},
						UI.clickable,
						Htx.on(UI.clickEvt, () => this.selected = true),
					)
				),
				Htx.div(
					{
						flex: "1 0",
						paddingTop: "6px",
					},
					Htx.div(
						...UI.text(this.getDescription(), 24, 500),
						Htx.on(UI.clickEvt, () => this.selected = true),
					),
					this.contents = Htx.div(
						"publish-option-contents",
						{
							marginTop: "20px",
							padding: "20px"
						},
					)
				)
			);
			
			this.selected = false;
			Controller.set(this);
		}
		
		readonly root;
		abstract readonly publisherType: typeof Publisher;
		
		private readonly circle;
		protected readonly contents;
		
		/** */
		private getDescription()
		{
			return (this.constructor as typeof PublishConfigurator).description;
		}
		
		/** */
		protected getPublisher()
		{
			const publisher = Publisher.get(this.publisherType, this.meta);
			return publisher as InstanceType<this["publisherType"]>;
		}
		
		/** */
		get selected()
		{
			return this._selected;
		}
		set selected(selected: boolean)
		{
			if (!this._selected && selected)
			{
				const parent = this.root.parentElement;
				if (parent)
				{
					const siblings = Controller.map(parent, PublishConfigurator);
					for (const sibling of siblings)
						sibling.selected = false;
				}
				
				const id = this.publisherType.identifier;
				this.meta.publishMethod = id;
			}
			
			this.circle.style.backgroundColor = selected ? 
				UI.black(0.1) :
				"transparent";
			
			this.contents.style.display = selected ? "block" : "none";
			this._selected = selected;
		}
		private _selected = false;
		
		/** */
		protected showError(message: string)
		{
			const wc = Controller.over(this, SettingsView).windowContents;
			UI.showInlineNotification(wc, message, "error");
		}
		
		/** */
		protected showInfo(message: string)
		{
			const wc = Controller.over(this, SettingsView).windowContents;
			UI.showInlineNotification(wc, message, "info");
		}
	}
}
