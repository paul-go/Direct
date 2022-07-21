
namespace Turf
{
	/** */
	export class S3PublishConfigurator extends PublishConfigurator
	{
		/** */
		static readonly description = "Use my own hosting (S3 storage)";
		
		/** */
		constructor(meta: MetaRecord)
		{
			super(meta);
			
			Htx.from(this.contents)(
				{
					padding: "60px 0",
					textAlign: "center",
					fontStyle: "italic",
					fontSize: "22px",
					opacity: "0.66",
					border: "1px solid " + UI.black(0.25),
					borderRadius: UI.borderRadius.default,
				},
				...UI.text("Coming soon")
			);
		}
		
		readonly publisherType = S3Publisher;
	}
	
	PublishConfigurator.register(S3PublishConfigurator);
}
