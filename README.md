# Lingo Server

This is a basic boilerplate to quickly set up a nodejs server **fully written in [TypeScript](https://www.typescriptlang.org/)** (^3.7.4) based on:

- [NestJS](https://nestjs.com/) (^8.0.0) for the **server**: [> Go to the server package](./packages/server)

  > _« A progressive Node.js framework for building efficient, reliable and scalable server-side applications. »_

- [Nodejs + Typescript + Mongodb](https://nodejs.org/) (^16.x) for the **tools**: [> Go to the client package](./packages/tools)

  > _« Nodejs with native mongodb driver »_
  

## Features

While being minimalistic, this boilerplate offers a number of features which can be very valuable for the Development Experience (DX):

### Global

- Makes use of the [yarn workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) to centralise the package management system for all the internal packages.

- TypeScript ^4.2.3 which comes with, for example, **optional chaining** and customised [import paths](#typescript-import-paths) already defined for each package.

- EditorConfig + Prettier for [code formatting](#code-formatting).

- Full ESLint configurations for [linting](#linting).

- Development scripts: `yarn start:dev` can be run in any package. See [Development & builds](#development--builds) for more information.

### Tools (@lingo/tools)

- [Vite's Hot Module Replacement](https://vitejs.dev/guide/features.html#hot-module-replacement) combined with the [React Fast Refresh](https://github.com/facebook/react/tree/master/packages/react-refresh) offers an incredibly fast development process. When you edit and save a source file, it will only reload the corresponding module in the development server AND only **re-render the depending components without losing their state**!

- Debugger tool so you can avoid using the native but synchronous and greed `console`'s methods. For more information, see the client README section about the [Debug library](./packages/client#debug-library).

- Production ready [NGINX](https://nginx.org/) configuration example to optimise your frontend file delivery.

- Production ready [Dockerfile](#docker-images).

### Server (@lingo/core)

- NestJS basic package with all the Nest tools. See the [server README](./packages/server/) for more information.

- A predefined **global config module** to handle all the configuration you would like to pass to your server at runtime. You can lean more in the server's README [Configuration module](./packages/server/README.md) section.

- Config `.env` files under `packages/server` folder like `packages/server/.env.example`.

- Config `.env` files under `packages/tools` folder like `packages/tools/.env.example`.



### @lingo/core | @lingo/tools

1. BUILD
   - Build all workspaces `yarn build`
   - Or build only workspace `yarn workspace @lingo/core run build` and `yarn workspace @lingo/tools run build`

2. ESLINT & FORMAT
   - `yarn lint` and `yarn format`