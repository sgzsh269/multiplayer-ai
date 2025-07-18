# Zustand

Zustand is a fast, minimal state management library for React and JavaScript. It provides a simple API without context providers or boilerplate.

## Docs

- [Official Docs](https://zustand.docs.pmnd.rs): Complete reference for Zustand.
- [Getting Started](https://zustand.docs.pmnd.rs/getting-started/introduction): Learn the basics and create your first store.

## Core API

- [createStore](https://zustand.docs.pmnd.rs/apis/create-store): Create a standalone store without React.
- [shallow](https://zustand.docs.pmnd.rs/apis/shallow): Utility for shallow comparison of `objects`.

## Middlewares

- [combine](https://zustand.docs.pmnd.rs/middlewares/combine): Combine multiple slices into a single store.
- [devtools](https://zustand.docs.pmnd.rs/middlewares/devtools): Debug state changes using Redux DevTools.
- [immer](https://zustand.docs.pmnd.rs/middlewares/immer): Use `Immer` for immutable state updates.
- [persist](https://zustand.docs.pmnd.rs/middlewares/persist): Persist state to `localStorage` or other storage engines.
- [redux](https://zustand.docs.pmnd.rs/middlewares/redux): Use a reducer-style setup similar to `Redux`.
- [subscribeWithSelector](https://zustand.docs.pmnd.rs/middlewares/subscribe-with-selector): Subscribe to specific slices with selector support.

## React Bindings

- [create](https://zustand.docs.pmnd.rs/apis/create): Bind a store to React for use with hooks.
- [createWithEqualityFn](https://zustand.docs.pmnd.rs/apis/create-with-equality-fn): Like `create`, but allows custom equality functions.

## React Hooks

- [useStore](https://zustand.docs.pmnd.rs/hooks/use-store): Access and subscribe to store state.
- [useStoreWithEqualityFn](https://zustand.docs.pmnd.rs/hooks/use-store-with-equality-fn): Same as `useStore`, but with custom equality checks.
- [useShallow](https://zustand.docs.pmnd.rs/hooks/use-shallow): Use selectors with shallow equality comparison.

## Migration Guides

- [Migrate to v4](https://zustand.docs.pmnd.rs/migrations/migrating-to-v4): How to upgrade from Zustand v3.
- [Migrate to v5](https://zustand.docs.pmnd.rs/migrations/migrating-to-v5): How to upgrade from Zustand v4.

## Tutorials

- [Tic-Tac-Toe Guide](https://zustand.docs.pmnd.rs/guides/tutorial-tic-tac-toe): Build a game using Zustand state.

## More

- [Third-party Libraries](https://zustand.docs.pmnd.rs/integrations/third-party-libraries): Integrations with third-party libraries.
- [Zustand vs Other Libraries](https://zustand.docs.pmnd.rs/getting-started/comparison): Comparison with other state management libraries.
- [TypeScript](https://zustand.docs.pmnd.rs/guides/typescript): Guide to using Zustand with TypeScript.
- [Testing](https://zustand.docs.pmnd.rs/guides/testing): Best practices for testing Zustand stores.
- [Next.js](https://zustand.docs.pmnd.rs/guides/nextjs): Using Zustand with Next.js for state management.
- [Slices Pattern](https://zustand.docs.pmnd.rs/guides/slices-pattern): Organizing state into slices for scalability and maintainability.