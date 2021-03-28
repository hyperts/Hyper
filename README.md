<p align="center"><img src="https://i.imgur.com/W8xDQCG.png"></p>

<p  align="center">
<img src="https://img.shields.io/badge/PLATFORM-Windows%20x64-%2300A3FF?style=flat-square&logo=window"/> <img src="https://img.shields.io/discord/763847972013342740?color=%2300A9FF&label=Discord&logo=discord&logoColor=%23ffffff&style=flat-square"/> <img src="https://img.shields.io/david/nodgear/hyperbar?color=%2300A3FF&logo=npm&style=flat-square"/> <img src="https://img.shields.io/badge/CODE%20STYLE-Standard-%2300A3FF?logo=javascript&style=flat-square">
</p>

<hr>
<h4 align="center">⚡ Hyperbar - A windows taskbar replacement made with web technology</h1>
<p align="center">
  <a href="#-about">About</a> &#xa0; | &#xa0;
  <a href="#-features">Features</a> &#xa0; | &#xa0;
  <a href="#-technologies">Technologies</a> &#xa0; | &#xa0;
  <a href="#-making-themes">Making Themes</a> &#xa0; | &#xa0;
  <a href="#-license">License</a> &#xa0; | &#xa0;
</p>
<br>

## 🗺️ About ##
[Discord server](https://discord.gg/MEKtpUPBeU)

The project is made using electron, the interaction with windows api is either done with Foreign Function Interface or with binaries compiled for this project.

Being made with electron means the Chrome overhead is existent, if you have a computer with ultra low RAM settings, avoid using Hyperbar. The average ram usage is arround `100MB`

## ✨ Features ##
Hyper is modular and each theme may come with new or modified modules.<br>
Default modules:<br>
 - WebnowPlaying module : Show/control currently playing music/video.
 - Clock
 - Weather
 - Taskbar
 - Workspace manages.

Cool things that i'm proud of:
 - Gui configuration
 - Custom theme and widget support
 - Crafted with love

## 🚀 Technologies ##
- [Node.js](https://nodejs.org/en/)
- [Electron](https://www.electronjs.org/)
- [Windows win32 API](https://docs.microsoft.com/en-us/windows/win32/apiindex/windows-api-list)
- [VirtualDesktopAccessort](https://github.com/Ciantic/VirtualDesktopAccessor)

## 📐 Making Themes ##
You can find your theme folder by right clicking the bar and then selecting Open themes folder.<bR>
The folder is actually located at your user folder (c:/users/<your username>/.hyperbar)<br>

Every theme must follow a specific directory structure with a index.html at it's root directory.<br>
`PS: THE THEME MUST HAVE THE CORE INDEX.JS FILE AT THE BODY END IN ORDER TO USE DEFAULT WIDGETS AND VARIABLES`<br>
Here's a simple theme structure:
```
.hyperbar/themes
└── Theme name/
    ├── widgets/
    │   └── widgetname/
    │       ├── widgetname.css
    │       └── config.yaml
    ├── index.css
    └── index.html
```

Making new widgets for your themes is as simple as creating .js files and including on your index.html

You can access two protocols from your theme:<br>
 - `theme://` Refers to the theme root directory, that is what you're going to use to load css and js files from your theme.
 - `core://` Refers to the hyperbar directory, i advice agains using the core protocol since updates may break your theme.

## 📝 License ##
This project is licensed under GNU-GPL 3.0<br>
What does that mean? it means you can make your own themes and even sell them but when sharing/distributing Hyperbar you must include credits and a copy of the license file with it.
