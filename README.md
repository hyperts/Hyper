<div align="center">

# Electron boilerplate for Typescript + Preact + Tailwind CSS

A minimal [Electron](https://www.electronjs.org/) boilerplate for [Preact](https://preactjs.com/), [Typescript](https://www.typescriptlang.org/) and [Tailwind CSS](https://tailwindcss.com/) and bundled with [Parcel](https://parceljs.org/).
</div>

## Features

- 🤍 **Dead simple usage**. Forget the project setup and just focus on the code.
- 🎨 **Easy to extend**. Parcel brings zero config support for a [dizzyingly array](https://parceljs.org/transforms.html) of plugins.
- 🍕 **Fast development**. The site starts with a single command and automatically refreshes on file changes.
- 💻 **Deployment ready**. Build, optimise, and minify files with a single command.
- 🔎 **Productive typechecking**. Write untyped code while prototyping and only typecheck when it matters.

---

## 👟 Install

> Ensure [node](https://nodejs.org) (v12.13+) is installed.

```
npm install
```

Update the boilerplate with your project details:
- Update the `title` tag with your project name in `index.html`.
- Update `name`, `description`, and `authors` values in `package.json`. Note these are required by the electron packager.

## 🍕 Develop

```
npm start
```

The electron app will open and refresh automatically.

You can also run `npm run main:start` and `npm run render:start` scripts separately.

## 💻 Release

```
npm run build
```

Builds will be available in the `out` folder. Configure your build further via [these instructions](https://www.electronforge.io/configuration).

---

## 🤔 Notes

<details>
  <summary><b>Typescript typecheck notes</b></summary>

- Typescript code is typechecked via the `typecheck` command and at the start of the `start` and `build` commands
- Code is *not* typechecked on automatic files changes like most bundlers. This allows you write scrappy, untyped code whilst prototyping to keep development fast. Simply add types later before committing code.
</details>

---

### Have an issue?

Post an issue and I'll be happy to help 🙂
