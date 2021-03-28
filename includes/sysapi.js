const ffi = require('ffi-napi')
const ref = require('ref-napi')
const path = require('path')
const { getPathOnUserFolder } = require(require('path').resolve(__dirname, '..', 'core/utils.js'))
const Logger = require('@ptkdev/logger')
const logPath = getPathOnUserFolder('logs')
const logger = new Logger({
  language: 'en',
  colors: true,
  write: true,
  path: { debug_log: `${logPath}\\cl_debug.log`, error_log: `${logPath}\\cl_errors.log` }
})

const voidPtr = ref.refType(ref.types.void)
const stringPtr = ref.refType(ref.types.CString)

const hooks = ffi.Library(path.join(__dirname, 'hooks_x64.dll'), {
  // CallWndProc =
  // LowLevelKeyboardProc =
  CustomWndProc: ['long', ['uint32', 'uint', 'uint64', 'uint64', 'uint', 'ulong']]
  // Unload =
})

const virtualDesktop = ffi.Library(path.join(__dirname, 'x64desktopacessor.dll'), {
  GetCurrentDesktopNumber: ['int', []], // Returns the DesktopID user is currently using.
  GetDesktopCount: ['int', []], // Returns the amount of Virtual Desktops.
  GetDesktopIdByNumber: ['string', ['int']], // Returns zeroed GUID with invalid number found ex: {FF72FFDD-BE7E-43FC-9C03-AD81681E88E4}
  // GetDesktopNumber             : [ 'int', ]                          , // I don't know how to deal with IVirtualDesktop type yet.
  GetDesktopNumberById: ['int', ['string']], // Returns the Desktop ID from the GUID.
  GetWindowDesktopId: ['string', ['uint32']], // Returns the Desktop GUIID from HWND.
  GetWindowDesktopNumber: ['int', ['uint32']], // Returns the Desktop ID from Window handled.
  IsWindowOnCurrentVirtualDesktop: ['bool', ['uint32']], // Returns if window handler is a virtual desktop.
  MoveWindowToDesktopNumber: ['bool', ['uint32', 'int']], // Moves window with said HWND to desktop with said ID, returns true if success.
  GoToDesktopNumber: ['void', ['int']], // Goes to said desktop ID.
  RegisterPostMessageHook: ['void', ['uint32', 'int']], // arg1: HWND listener, arg2: MessageOffset - I don't know what this shit means...
  UnregisterPostMessageHook: ['void', ['uint32']], // I guess it undoes the shit from before?
  IsPinnedWindow: ['int', ['uint32']], // Returns 1 if said HWND is a pinned window (all desktops) and -1 if not valid.
  PinWindow: ['void', ['uint32']], // Pins a window to the desktop, to check if successfull, we need to use IsPinnedWindow right after.
  UnPinWindow: ['void', ['uint32']], // Unpins window from desktop, to check if successfull, we need to use IsPinnedWindow right after.
  IsPinnedApp: ['int', ['uint32']], // Returns 1 if pinned, 0 if not pinned and -1 if not valid
  PinApp: ['void', ['uint32']], // Does same as PinWindow
  UnPinApp: ['void', ['uint32']], // Does the same as UnPinWindows
  IsWindowOnDesktopNumber: ['int', ['uint32', 'int']], // Checks if this window has this desktop ID.
  RestartVirtualDesktopAccessor: ['void', []], // Call this when taskbar created message.

  ViewIsShownInSwitchers: ['int', ['uint32']], // Is this window shown on the alt tab?
  ViewIsVisible: ['int', ['uint32']], // Is this window visible?
  ViewGetThumbnailHwnd: ['uint32', ['uint32']], // Gets the window handle of the taskbar thumbnail for this window.
  ViewSetFocus: ['void', ['uint32']], // Sets focus to this window, like pressing alt+tab.
  ViewGetFocused: ['uint32', []], // Same as ViewGetThumbnailHwnd but uses the current focused window as argument.
  ViewSwitchTo: ['void', ['uint32']], // Switch to window like Alt+Tab switcher
  ViewGetByZOrder: ['uint', ['uint32', 'uint', 'bool']], // Returns windows in Z-Order
  ViewGetByLastActivationOrder: ['uint', ['uint32', 'uint', 'bool']], // Returns windows in Last-open order (Like Alt+tab), if last argument is true, it will only count window from the current virtual desktop.
  ViewGetLastActivationTimestamp: ['uint', ['uint32']] // Returns timestamp of last time this window was used.
})

const win32 = ffi.Library('User32', {
  GetDesktopWindow: ['uint32', []],
  ShowWindow: ['bool', ['uint32', 'int']],
  FindWindowA: ['uint32', ['string', 'uint32']],
  FindWindowW: ['uint32', ['string', 'uint32']],
  FindWindowExW: ['uint32', ['uint32', 'uint32', 'uint32', 'uint32']],
  GetWindowTextW: ['int32', ['uint32', 'string', 'int32']],
  IsWindowVisible: ['bool', ['uint32']],
  GetParent: ['uint32', ['uint32']],
  GetWindowLongPtrA: ['uint32', ['uint32', 'int']],
  EnumWindows: ['bool', [voidPtr, 'int32']],
  GetWindowTextA: ['long', ['long', stringPtr, 'long']],
  GetWindow: ['uint32', ['uint32', 'uint']],
  GetClassNameA: ['int', ['uint32', 'string', 'int']],
  IsHungAppWindow: ['bool', ['uint32']],
  RegisterWindowMessageA: ['uint', ['string']],
  RegisterShellHookWindow: ['bool', ['uint32']],
  PeekMessageA: ['bool', ['uint32', 'uint', 'uint', 'uint']],
  IsIconic: ['bool', ['uint32']]
})

// ENUMS
const GW = Object.freeze({
  HWNDFIRST: 0, // The retrieved handle identifies the window of the same type that is highest in the Z order.
  HWNDLAST: 1, // The retrieved handle identifies the window of the same type that is lowest in the Z order.
  HWNDNEXT: 2, // The retrieved handle identifies the window below the specified window in the Z order.
  HWNDPREV: 3, // The retrieved handle identifies the window above the specified window in the Z order.
  OWNER: 4, // The retrieved handle identifies the specified window's owner window, if any.
  CHILD: 5, // The retrieved handle identifies the child window at the top of the Z order, if the specified window is a parent window otherwise, the retrieved handle is NULL.
  ENABLEDPOPUP: 6 // The retrieved handle identifies the enabled popup window owned by the specified window (the search uses the first such window found using GW_HWNDNEXT)
})

const WS = Object.freeze({
  BORDER: 0x00800000, // The window has a thin-line border.
  CAPTION: 0x00C00000, // The window has a title bar (includes the BORDER style).
  CHILD: 0x40000000, // The window is a child window.
  CHILDWINDOW: 0x40000000, // same as above.
  CLIPCHILDREN: 0x02000000, // Excludes the area occupied by child windows when drawing occurs within the parent window. This style is used when creating the parent window.
  CLIPSIBLINGS: 0x04000000, // Clips child windows relative to each other
  DISABLED: 0x08000000, // The window is initially disabled. A disabled window cannot receive input from the user. T
  DLGFRAME: 0x00400000, // The window has a border of a style typically used with dialog boxes.
  GROUP: 0x00020000, // The window is the first control of a group of controls.
  HSCROLL: 0x00100000, // The window has a horizontal scroll bar.
  ICONIC: 0x20000000, // The window is initially minimized. Same as the MINIMIZE style.
  MAXIMIZE: 0x01000000, // The window is initially maximized.
  MAXIMIZEBOX: 0x00010000, // The window has a maximize button.
  MINIMIZE: 20000000, // The window is initially minimized.
  MINIMIZEBOX: 0x00020000, // The window has a minimize button.
  OVERLAPPED: 0x00000000, // The window is an overlapped window.
  POPUP: 0x80000000, // The window is a pop-up window.
  POPUPWINDOW: 0x80000000 | 0x00800000 | 0x00080000, // POPUP | BORDER | SYSMENU
  SIZEBOX: 0x00040000, // The window has a sizing border. Same as the THICKFRAME style.
  SYSMENU: 0x00080000, // The window has a window menu on its title bar.
  TABSTOP: 0x00010000, // The window is a control that can receive the keyboard focus when the user presses the TAB key.
  THICKFRAME: 0x00040000, // The window has a sizing border. Same as the SIZEBOX style.
  TILED: 0x00000000, // The window is an overlapped window. An overlapped window has a title bar and a border.
  OVERLAPPEDWINDOW: 0x00000000 | 0x00C00000 | 0x00080000 | 0x00040000 | 0x00020000 | 0x00010000, // OVERLAPPED | CAPTION | SYSMENU | THICKFRAME | MINIMIZEBOX | MAXIMIZEBOX
  TILEDWINDOW: 0x00000000 | 0x00C00000 | 0x00080000 | 0x00040000 | 0x00020000 | 0x00010000 // OVERLAPPED | CAPTION | SYSMENU | THICKFRAME | MINIMIZEBOX | MAXIMIZEBOX
})

const GWL = Object.freeze({
  EXSTYLE: -20, // extended window style.
  HINSTANCE: -6, // Sets a new application instance handle.
  ID: -12, // Sets a new identifier of the child window. The window cannot be a top-level window.
  STYLE: -16, // Sets a new window style.
  USERDATA: -21, // Sets the user data associated with the window.
  WNDPROC: -4, // Sets a new address for the window procedure.
  MSGRESULT: 0 // Sets the return value of a message processed in the dialog box procedure.
})

const SW = Object.freeze({
  HIDE: 0,
  SHOWNORMAL: 1,
  SHOWMINIMIZED: 2,
  MAXIMIZE: 3,
  SHOWMAXIMIZED: 3,
  SHOWNOACTIVATE: 4,
  SHOW: 5,
  MINIMIZE: 6,
  SHOWMINNOACTIVE: 7,
  SHOWNA: 8,
  RESTORE: 9,
  SHOWDEFAULT: 10,
  FORCEMINIMIZE: 11
})



module.exports = {
  virtualDesktop,
  win32,
  ffi,
  ref,
  hooks,
  GW,
  GWL,
  WS
}
