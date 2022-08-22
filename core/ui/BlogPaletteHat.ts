
namespace App
{
	/** */
	export class BlogPaletteHat
	{
		/** */
		constructor()
		{
			let firstItem: BlogPaletteItem | null = null;
			
			this.root = Hot.div(
				UI.fixed(),
				UI.removeOnClick(),
				UI.removeOnEscape(),
				Drop.here({
					accept: [MimeType.zip],
					dropFn: files => files.length > 0 && this.importDatabase(files[0].data),
					center: new Text("Import")
				}),
				Hot.div(
					"blog-palette-window",
					{
						margin: "auto",
						padding: "10px",
						width: "100%",
						maxWidth: "600px",
						borderRadius: "0 0 " + UI.borderRadius.large + " " + UI.borderRadius.large,
						backgroundColor: UI.darkGrayBackground,
						boxShadow: "0 0 100px " + UI.white(0.15),
					},
					Hot.div(
						"blog-palette-header",
						{
							padding: "20px"
						},
						UI.flexCenter,
						UI.toolButton("filled",
							{
								margin: "0 10px",
								flex: "1 0",
							},
							UI.click(() => this.handleNew()),
							new Text("New"),
						),
						UI.toolButton("filled",
							{
								margin: "0 10px",
								flex: "1 0",
							},
							UI.click(() => this.handleImport()),
							new Text("Import"),
						),
					),
					this.itemsElement = Hot.div(
						"blog-palette-items",
						Database.getNames().map(name =>
						{
							const item = new BlogPaletteItem(name);
							if (!firstItem)
								firstItem = item;
							
							return item.root;
						})
					)
				),
				When.rendered(() =>
				{
					if (firstItem)
						firstItem.selected = true;
				})
			);
			
			Hat.wear(this);
		}
		
		readonly root;
		private readonly itemsElement;
		
		/** */
		private handleNew()
		{
			const items = Hat.map(this.itemsElement, BlogPaletteItem);
			const selectedItem = items.find(i => i.selected) || items.at(0);
			if (!selectedItem)
				return;
			
			const newItem = new BlogPaletteItem();
			selectedItem.root.before(newItem.root);
			newItem.selected = true;
			newItem.beginEdit();
		}
		
		/** */
		private async handleImport()
		{
			const input = Hot.input(
				{
					type: "file",
					position: "absolute",
					visibility: "hidden"
				},
				Hot.on("change", async () =>
				{
					input.remove();
					const file = input.files?.[0];
					if (file)
					{
						const buffer = await file.arrayBuffer();
						this.importDatabase(buffer);
					}
				})
			);
			
			document.body.append(input);
			input.click();
		}
		
		/** */
		private async importDatabase(databaseBuffer: ArrayBuffer)
		{
			const bytes = new Uint8Array(databaseBuffer);
			const databaseAbout = await BlogFile.parse(bytes);
			
			if (!databaseAbout)
			{
				const msg = `This .zip archive wasn't exported from ${ConstS.appName}.`;
				await Util.alert(msg);
				return;
			}
			
			const hasId = Database.getIds().includes(databaseAbout.id);
			if (hasId)
				databaseAbout.id = Database.generateId();
			
			const hasName = Database.getNames().includes(databaseAbout.name);
			if (hasName)
			{
				let name = databaseAbout.name;
				
				// The name is already an incremented name
				if (/[^:]\s[0-9]+$/.test(name))
				{
					const parts = name.split(" ");
					parts.push(((Number(parts.pop()) || 0) + 1).toString());
					name = parts.join(" ");
				}
				// Increment the name
				else name += " 2";
				
				databaseAbout.name = name;
			}
			
			const db = await App.createDatabase(databaseAbout);
			const items = Hat.map(this.itemsElement, BlogPaletteItem).reverse();
			const refItem = items.find(i => db.name < i.name) || items.at(0);
			if (!refItem)
				return;
			
			const newItem = new BlogPaletteItem(db.name);
			newItem.selected = true;
			refItem.root.before(newItem.root);
		}
	}
	
	/** */
	class BlogPaletteItem
	{
		constructor(name: string = "")
		{
			this.isCreatingNew = !name;
			
			this.root = Hot.div(
				"blog-palette-item",
				{
					tabIndex: 0,
					display: "flex",
					margin: "10px",
					borderRadius: UI.borderRadius.default,
				},
				Hot.on("keydown", ev =>
				{
					if (this.isEditing)
						return;
					
					if (ev.key === "Enter" && this.selected)
					{
						this.load("close");
					}
					else if (ev.key === "ArrowUp")
					{
						const prev = Hat.previous(this.root, BlogPaletteItem);
						if (prev)
							prev.selected = true;
					}
					else if (ev.key === "ArrowDown")
					{
						const prev = Hat.next(this.root, BlogPaletteItem);
						if (prev)
							prev.selected = true;
					}
					else return;
					
					ev.preventDefault();
				}),
				Hot.on("focusout", () =>
				{
					this.isEditing && setTimeout(() =>
					{
						if (!Query.ancestors(document.activeElement).includes(this.root))
							this.tryAcceptEdit("blurring");
					});
				}),
				UI.click(() =>
				{
					if (this.isEditing)
						return;
					
					if (this.selected)
						this.load("close");
					else
						this.selected = true;
				}),
				this.nameElement = Hot.div(
					"blog-palette-label",
					{
						flex: "1 0",
						padding: "20px",
					},
					UI.text(name)
				),
				this.menuElement = Hot.div(
					this.isCreatingNew && CssClass.hide,
					"blog-palette-menu",
					{
						padding: "20px",
					},
					UI.text("•••"),
					UI.click(ev =>
					{
						this.selected = true;
						ev.stopImmediatePropagation();
						const isOnlyItem = Database.getNames().length === 1;
						
						UI.springMenu(ev.target, {
							"Export": () => this.export(),
							"Rename": () => this.beginEdit(),
							...(isOnlyItem ? {} : { "Delete": () => this.delete() }),
						})
					})
				)
			);
			
			Hat.wear(this);
		}
		
		readonly root;
		private readonly nameElement;
		private readonly menuElement;
		
		/** A flag that indicates whether this item is being used to create a new database. */
		private isCreatingNew = false;
		
		/** */
		get name()
		{
			return this.nameElement.textContent || "";
		}
		private setName(name: string)
		{
			this.nameElement.textContent = name;
		}
		
		/** */
		get selected()
		{
			return this._selected;
		}
		set selected(selected: boolean)
		{
			this._selected = selected;
			this.root.focus();
			
			for (const sibling of Hat.map(Query.siblings(this.root), BlogPaletteItem))
			{
				if (sibling !== this)
					sibling._selected = false;
				
				sibling.root.style.backgroundColor = sibling === this && selected ?
					UI.themeColor : 
					"transparent";
			}
		}
		private _selected = false;
		
		/** */
		private async export()
		{
			const db = await App.getDatabase(this.name);
			if (!db)
				return;
			
			const createBytes = async () =>
			{
				const about = await db.export();
				const blogFileBytes = await BlogFile.create(about);
				return blogFileBytes;
			};
			
			if (TAURI)
			{
				const savePath = await Tauri.dialog.save({
					filters: [{
						extensions: [ConstS.portableExtension],
						name: db.name,
					}]
				});
				
				if (!savePath)
					return;
				
				const bytes = await createBytes();
				await Tauri.fs.writeBinaryFile(savePath, bytes);
			}
			else if (DEBUG && ELECTRON)
			{
				const bytes = await createBytes();
				const fs = require("node:fs") as typeof import("node:fs");
				const path = require("node:path") as typeof import("node:path");
				const savePath = path.join(
					process.cwd(), 
					ConstS.debugExportsFolderName,
					db.name + "." + ConstS.portableExtension);
				
				fs.writeFileSync(savePath, bytes);
				await Util.alert("(DEBUG MESSAGE) Database saved to:\n" + savePath);
			}
			else
			{
				const bytes = await createBytes();
				BlogFile.triggerDownload("File." + ConstS.portableExtension, bytes);
			}
		}
		
		/** */
		beginEdit()
		{
			this.isEditing = true;
			this.storedName = this.name;
			this.nameElement.replaceChildren();
			
			Hot.get(this.nameElement)(
				new Text(this.storedName),
				Editable.single({
					placeholderText: "Enter the name of the blog",
				}),
				UI.escape(() => this.cancelEdit()),
				UI.enter(() => this.tryAcceptEdit()),
				When.connected(e =>
				{
					e.focus();
					document.getSelection()!.selectAllChildren(e);
				}),
			);
		}
		
		/** */
		private async tryAcceptEdit(isBlurring?: "blurring")
		{
			const newName = (this.nameElement.textContent || "").trim();
			this.isEditing = false;
			let success = false;
			
			if (this.isCreatingNew)
			{
				if (newName && !Database.getNames().includes(newName))
				{
					await App.createDatabase({ name: newName });
					this.isCreatingNew = false;
					success = true;
				}
			}
			else
			{
				success = Database.tryRename(this.storedName, newName);
			}
			
			if (success)
			{
				this.nameElement.replaceChildren(new Text(newName));
				this.setName(newName);
				this.root.focus();
			}
			else if (isBlurring)
			{
				this.cancelEdit();
			}
			else
			{
				await Util.alert("This name is already in use. Please choose another.");
				this.nameElement.focus();
			}
		}
		
		/** */
		private cancelEdit()
		{
			if (this.isCreatingNew)
			{
				const fallback = this.getFallbackItem();
				this.root.remove();
				
				if (fallback)
					fallback.selected = true;
			}
			else
			{
				this.isEditing = false;
				this.nameElement.replaceChildren(new Text(this.storedName));
				this.root.focus();
			}
		}
		
		private storedName = "";
		
		/** */
		private get isEditing()
		{
			return this._isRenaming;
		}
		private set isEditing(value: boolean)
		{
			this._isRenaming = value;
			UI.toggle(this.menuElement, !value);
			this.nameElement.style.cursor = value ? "text" : "default";
			Editable.toggle(this.nameElement, value);
		}
		private _isRenaming = false;
		
		/** */
		private async delete()
		{
			const fallbackItem = this.getFallbackItem();
			
			// Additional check to make sure the user doesn't delete
			// the last database. The UI should also prevent this from
			// happening the first place.
			if (!fallbackItem)
				return;
			
			const accept = await Util.confirm(
				"Are you sure you want to delete this blog?\n\n" +
				"This operation CANNOT be undone.");
			
			if (accept)
			{
				await Database.delete(this.name);
				this.root.remove();
				
				if (fallbackItem)
					fallbackItem.selected = true;
			}
		}
		
		/**
		 * Returns the BlogPaletteItem that should be activated in the case
		 * when this BlogPaletteItem disappears.
		 */
		private getFallbackItem()
		{
			return (
				Hat.next(this.root, BlogPaletteItem) || 
				Hat.previous(this.root, BlogPaletteItem));
		}
		
		/** */
		private async load(closeDialog?: "close")
		{
			AppContainer.of(this).changeDatabase(this.name);
			
			if (closeDialog)
				Hat.over(this, BlogPaletteHat).root.remove();
		}
	}
}
