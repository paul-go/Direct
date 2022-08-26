
namespace App
{
	//@ts-ignore
	//if (!DEBUG) return;
	
	/**
	 * 
	 */
	class DebugIdbConsoleHat
	{
		/** */
		constructor()
		{
			this.head = Hot.div(
				UI.anchorBottom(30),
				{
					display: "none",
					borderRadius: UI.borderRadius.large,
					backgroundColor: "white",
					color: "black",
					zIndex: 999,
				},
				When.connected(() => this.redraw())
			);
			
			document.body.addEventListener("keydown", ev =>
			{
				const s = this.head.style;
				
				if (ev.key === "i" && ev.metaKey && ev.shiftKey && !ev.ctrlKey && !ev.altKey)
				{
					ev.preventDefault();
					s.display = s.display === "none" ? "block" : "none";
				}
				else if (ev.key === "Escape")
				{
					s.display = "none";
				}
			});
			
			document.body.append(this.head);
		}
		
		readonly head;
		
		/** */
		private async redraw()
		{
			const table = Hot.table(
				{
					margin: "20px",
					width: "100%",
					textAlign: "left",
				},
				Hot.css("& TD, & TH", {
					padding: "10px",
					borderBottom: "1px solid " + UI.black(0.1),
				})
			);
			
			const databases = await indexedDB.databases();
					
			table.append(
				Hot.tr(
					Hot.th(new Text("ID")),
					Hot.th(new Text("Name In App")),
					Hot.th(new Text(""))
				)
			);
			
			for (const database of databases)
			{
				const id = database.name || "";
				const appName = id ? Database.getName(id) : "(no name)";
				table.append(Hot.tr(
					Hot.td(
						new Text(id)
					),
					Hot.td(
						new Text(appName)
					),
					Hot.td(
						Hot.button(
							{
								padding: "0 20px",
							},
							Hot.on("click", () => this.deleteDatabase(id)),
							new Text("Delete")
						)
					)
				));
			}
			
			this.head.replaceChildren(table)
		}
		
		/** */
		private deleteDatabase(id: string)
		{
			const request = indexedDB.deleteDatabase(id);
			
			request.onerror = e =>
			{
				console.error("Could not delete the database: " + id);
				console.log((e.currentTarget as any).error);
			};
			
			request.onsuccess = () =>
			{
				localStorage.removeItem("database-" + id);
				console.log("Deleted database '" + id + "'");
				this.redraw();
			};
			
			request.onblocked = () =>
			{
				localStorage.removeItem("database-" + id);
				alert("Blocked on deleting database '" + id + "'");
				this.redraw();
			};
		}
	}
	
	setTimeout(() => new DebugIdbConsoleHat(), 500);
}
