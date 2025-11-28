# `@portkey/graphql`

![ES Version](https://img.shields.io/badge/ES-2020-yellow)
![Node Version](https://img.shields.io/badge/node-14.x-green)
[![NPM Package Version][npm-image-version]][npm-url]

It is already possible to follow [the standard apollo tutorial](https://www.apollographql.com/docs/react/why-apollo) to add [apollo client](https://www.apollographql.com/docs/react) to your application. However, Portkey provides graphql integration packages those simplify the integration and usage.
## Installation

### Using NPM

```bash
npm install @portkey/graphql
```

### Using Yarn

```bash
yarn add @portkey/graphql
```

## Prerequisites

- :gear: [NodeJS](https://nodejs.org/) (LTS/Fermium)
- :toolbox: [Yarn](https://yarnpkg.com/)/[Lerna](https://lerna.js.org/)

## Package.json Scripts

| Script   | Description                                        |
| -------- | -------------------------------------------------- |
| clean    | Uses `rm` to remove `dist/`                        |
| build    | Uses `tsc` to build package and dependent packages |
| lint     | Uses `eslint` to lint package                      |
| lint:fix | Uses `eslint` to check and fix any warnings        |
| format   | Uses `prettier` to format the code                 |
| generate | generate files with the following                  |

## Usage

GraphQL Code Generator is a tool that generates code out of your GraphQL schema. Whether you are developing a frontend or backend, you can utilize GraphQL Code Generator to generate output from your GraphQL Schema and GraphQL Documents (query/mutation/subscription/fragment).

### Command to generate files

you can generate files with the following command:

    yarn generate

### Configuration

GraphQL Code Generator relies on a [configuration file](https://the-guild.dev/graphql/codegen/docs/config-reference/codegen-config) named codegen.config.ts to manage all possible options, input, and output document types.

### Links

For more configuration and functions, see [docs page](https://graphql-code-generator.com/docs/getting-started)

### Online web tool

You can do this online through a web page

[the-guild.dev/graphql/codegen](https://the-guild.dev/graphql/codegen)

[npm-image-version]: https://img.shields.io/npm/v/@portkey/graphql
[npm-url]: https://npmjs.org/package/@portkey/graphql