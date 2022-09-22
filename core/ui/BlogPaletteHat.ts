
namespace App
{
	/** */
	export class BlogPaletteHat
	{
		/** */
		constructor()
		{
			this.head = Hot.div(
				"blog-palette-hat",
				UI.fixed(),
				UI.removeOnClick(),
				UI.removeOnEscape(),
				UI.backdropBlur(4),
				{
					display: "flex",
					alignItems: "end",
					justifyContent: "center",
					transitionProperty: "background-color",
					transitionDuration: "0.3s",
					backgroundColor: UI.black(0),
				},
				When.rendered(e =>
				{
					e.style.backgroundColor = UI.black(0.33);
				}),
				Drop.here({
					accept: [MimeType.zip],
					dropFn: files => files.length > 0 && this.importDatabase(files[0].data),
					center: new Text("Import")
				}),
				Hot.div(
					"blog-palette-window",
					{
						position: "absolute",
						margin: "auto",
						padding: "10px",
						width: "100%",
						maxWidth: "600px",
						borderRadius: UI.borderRadius.large + " " + UI.borderRadius.large + " 0 0",
						backgroundColor: UI.lightGrayBackground,
						boxShadow: "0 0 100px black",
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
						Blog.getAll().map(b => new BlogPaletteItem(b))
					)
				),
			);
			
			Hat.wear(this);
		}
		
		readonly head;
		private readonly itemsElement;
		
		/** */
		private handleNew()
		{
			const items = Hat.map(this.itemsElement, BlogPaletteItem);
			const selectedItem = items.find(i => i.selected) || items.at(0);
			if (!selectedItem)
				return;
			
			const newItem = new BlogPaletteItem();
			selectedItem.head.before(newItem.head);
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
			const blogObject = await BlogFile.parse(bytes);
			
			if (!blogObject)
			{
				const msg = `This .zip archive wasn't exported from ${ConstS.appName}.`;
				await Util.alert(msg);
				return;
			}
			
			if (Blog.get({ friendlyName: blogObject.friendlyName }))
			{
				let name = blogObject.friendlyName;
				
				// The name is already an incremented name
				if (/[^:]\s[0-9]+$/.test(name))
				{
					const parts = name.split(" ");
					parts.push(((Number(parts.pop()) || 0) + 1).toString());
					name = parts.join(" ");
				}
				// Increment the name
				else name += " 2";
				
				blogObject.friendlyName = name;
			}
			
			const blog = await Blog.new(blogObject);
			const items = Hat.map(this.itemsElement, BlogPaletteItem).reverse();
			const refItem = items.find(i => blog.friendlyName < i.friendlyName) || items.at(0);
			if (!refItem)
				return;
			
			const newItem = new BlogPaletteItem(blog);
			newItem.selected = true;
			refItem.head.before(newItem.head);
		}
	}
	
	/** */
	class BlogPaletteItem
	{
		constructor(private blog?: Blog)
		{
			this.isCreatingNew = !blog;
			
			this.head = Hot.div(
				"blog-palette-item",
				{
					data: {
						fixedName: blog?.fixedName || "(empty)"
					},
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
						const prev = Hat.previous(this.head, BlogPaletteItem);
						if (prev)
							prev.selected = true;
					}
					else if (ev.key === "ArrowDown")
					{
						const prev = Hat.next(this.head, BlogPaletteItem);
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
						if (!Query.ancestors(document.activeElement).includes(this.head))
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
					UI.text(blog?.friendlyName || "")
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
						const isOnlyItem = Blog.getAll().length === 1;
						
						UI.springMenu(ev.target, {
							"Export": () => this.export(),
							"Rename": () => this.beginEdit(),
							...(isOnlyItem ? {} : { "Delete": () => this.delete() }),
						})
					})
				),
				When.rendered(() =>
				{
					if (this.friendlyName === AppContainer.of(this).blog.friendlyName)
					{
						this.selected = true;
						
						Hot.get(this.nameElement)(
							{
								fontWeight: 800,
							},
							Hot.css(":after", {
								content: `""`,
								position: "absolute",
								top: "1px",
								left: "8px",
								bottom: 0,
								height: 0,
								margin: "auto",
								borderWidth: "4px 0 4px 6px",
								borderStyle: "solid",
								borderColor: "transparent transparent transparent " + UI.white(0.75),
							})
						);
					}
				})
			);
			
			Hat.wear(this);
		}
		
		readonly head;
		private readonly nameElement;
		private readonly menuElement;
		
		/** A flag that indicates whether this item is being used to create a new database. */
		private isCreatingNew = false;
		
		/** */
		get friendlyName()
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
			this.head.focus();
			
			for (const sibling of Hat.map(Query.siblings(this.head), BlogPaletteItem))
			{
				if (sibling !== this)
					sibling._selected = false;
				
				sibling.head.style.backgroundColor = sibling === this && selected ?
					UI.themeColor : 
					"transparent";
			}
		}
		private _selected = false;
		
		/** */
		private async export()
		{
			const blog = Blog.get({ friendlyName: this.friendlyName });
			if (!blog)
				return;
			
			const createBytes = async () =>
			{
				const blogObject = await blog.export();
				const blogFileBytes = await BlogFile.create(blogObject);
				return blogFileBytes;
			};
			
			if (TAURI)
			{
				const savePath = await Tauri.dialog.save({
					filters: [{
						extensions: [ConstS.portableExtension],
						name: blog.friendlyName,
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
					blog.friendlyName + "." + ConstS.portableExtension);
				
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
			this.storedName = this.friendlyName;
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
			const friendlyName = (this.nameElement.textContent || "").trim();
			//this.isEditing = false;
			
			if (Blog.isValidFriendlyName(friendlyName))
			{
				if (this.isCreatingNew)
				{
					this.isCreatingNew = false;
					this.blog = await Blog.new({ friendlyName });
				}
				
				Not.nullable(this.blog).friendlyName = friendlyName;
				this.nameElement.replaceChildren(new Text(friendlyName));
				this.setName(friendlyName);
				this.head.focus();
				this.isEditing = false;
			}
			else if (isBlurring)
			{
				this.cancelEdit();
			}
			else
			{
				await Util.alert("This name isn't valid. Please choose another.");
				this.nameElement.focus();
			}
		}
		
		/** */
		private cancelEdit()
		{
			if (this.isCreatingNew)
			{
				const fallback = this.getFallbackItem();
				this.head.remove();
				
				if (fallback)
					fallback.selected = true;
			}
			else
			{
				this.isEditing = false;
				this.nameElement.replaceChildren(new Text(this.storedName));
				this.head.focus();
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
				await Blog.delete({ friendlyName: this.friendlyName });
				this.head.remove();
				
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
				Hat.next(this.head, BlogPaletteItem) || 
				Hat.previous(this.head, BlogPaletteItem));
		}
		
		/** */
		private async load(closeDialog?: "close")
		{
			if (!this.blog)
				return;
			
			AppContainer.of(this).changeDatabase(this.blog.fixedName);
			
			if (closeDialog)
				Hat.over(this, BlogPaletteHat).head.remove();
		}
	}
}
