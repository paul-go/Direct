#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

use cocoa::appkit::{NSWindow, NSWindowStyleMask, NSWindowTitleVisibility};
use tauri::{Runtime, Window, Manager, Size, LogicalSize};

/** */
pub trait WindowExt
{
	#[cfg(target_os = "macos")]
	fn set_transparent_titlebar(&self, title_transparent: bool, remove_toolbar: bool);
}

/** */
impl<R: Runtime> WindowExt for Window<R>
{
	#[cfg(target_os = "macos")]
	fn set_transparent_titlebar(&self, title_transparent: bool, remove_tool_bar: bool)
	{
		unsafe
		{
			let id = self.ns_window().unwrap() as cocoa::base::id;
			NSWindow::setTitlebarAppearsTransparent_(id, cocoa::base::YES);
			let mut style_mask = id.styleMask();
			style_mask.set(
				NSWindowStyleMask::NSFullSizeContentViewWindowMask,
				title_transparent,
			);
			
			if remove_tool_bar
			{
				style_mask.remove(
					NSWindowStyleMask::NSClosableWindowMask |
					NSWindowStyleMask::NSMiniaturizableWindowMask |
					NSWindowStyleMask::NSResizableWindowMask);
			}
			
			id.setStyleMask_(style_mask);
			
			id.setTitleVisibility_(
				if title_transparent
				{
					NSWindowTitleVisibility::NSWindowTitleHidden
				}
				else
				{
					NSWindowTitleVisibility::NSWindowTitleVisible
				}
			);
			
			id.setTitlebarAppearsTransparent_(if title_transparent {
				cocoa::base::YES
			} else {
				cocoa::base::NO
			});
		}
	}
}

/** */
fn main()
{
	let context = tauri::generate_context!();
	tauri::Builder::default()
		.setup(|app|
		{
			let win = app.get_window("main").unwrap();
			win.set_transparent_titlebar(true, false);
			win.set_size(Size::Logical(LogicalSize { width: 800.0, height: 4000.0 })).unwrap();
			Ok(())
		})
		.menu(tauri::Menu::os_default(&context.package_info().name))
		.run(context)
		.expect("error while running tauri application");
}
