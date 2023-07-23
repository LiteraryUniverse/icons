# Literary Universe icons

## Installation

There are two packages provided through this monorepo:

[@literary-universe/svg-icons](https://www.npmjs.com/package/@literary-universe/svg-icons)

and

[@literary-universe/styled-icons](https://www.npmjs.com/package/@literary-universe/styled-icons)

You can install them as any npm package.


## Usage

You use these packages as you would any [svg-icons](https://github.com/svg-icons/svg-icons) or [styled-icons](https://styled-icons.dev/).

## Adding new icon

### Exporting from Figma

When exporting from Figma select the icon directly so that Figma offers you the SVG code in the sidebar.

![select svg icon in figma](./figma-1.png)

Copy the SVG code:

![copy SVG code](./figma-2.png)

Go then to [Iconly SVG stroke convertor](https://iconly.io/tools/svg-convert-stroke-to-fill), this will convert the SVG code to webfont SVG.

Save the file in `./svg-icons/packages/literary-universe/source`

Open up the file and make sure that `fill="none"` is not present in the top `<svg>` element.

Finally you can optimize the SVG code in [SVGOMG](https://jakearchibald.github.io/svgomg/) tool. Besides the defaults it is recommended to turn on multipass, pretify markup, reduce duplicate elements with links, remove out-of-bounds paths and prefer viewBox to width/height.

Copy the resulting code (or override the existing file) in the resources folder.

### svg-icons

Next step is to generate optimized svg icons from the source files.

Go to `./svg-icons/`

Make sure that you have `pnpm` installed and through it install dependencies.

Then run `npm run build`. This will take the source icons and build them for the package purposes.

You should run `npm run storybook` to check that the new icons are displaying properly.

Finally, if you have the permissions go to the package `./svg-icons/packages/literary-universe` and publish it.

### styled-icons

Once the svg-icons package is published you can make that into styled-icons package.

Go to `./styled-icons/packages/styled-icons/package.json` and in dependencies update `@literary-universe/svg-icons` to the latest version. 

Go to `./styled-icons/`. Install all dependencies via pnpm.

Then run `npm run build:icons`. That is it! You can now publish the package with the latest icons added.
