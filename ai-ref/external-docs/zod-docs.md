💎 Zod 4 is now stable! [Read the announcement.](https://zod.dev/v4)

![Zod logo](https://zod.dev/_next/image?url=%2Flogo%2Flogo-glow.png&w=640&q=100)![Zod logo](https://zod.dev/_next/image?url=%2Flogo%2Flogo-glow.png&w=640&q=100)

# Zod

TypeScript-first schema validation with static type inference

by [@colinhacks](https://x.com/colinhacks)

[![Zod CI status](https://github.com/colinhacks/zod/actions/workflows/test.yml/badge.svg?event=push&branch=main)](https://github.com/colinhacks/zod/actions?query=branch%3Amain)[![Created by Colin McDonnell](https://img.shields.io/badge/created%20by-@colinhacks-4BBAAB.svg)](https://twitter.com/colinhacks)[![License](https://img.shields.io/github/license/colinhacks/zod)](https://opensource.org/licenses/MIT)[![npm](https://img.shields.io/npm/dw/zod.svg)](https://www.npmjs.com/package/zod)[![stars](https://img.shields.io/github/stars/colinhacks/zod)](https://github.com/colinhacks/zod)

[Website](https://zod.dev/)  •  [Discord](https://discord.gg/RcG33DQJdf)  •  [𝕏](https://twitter.com/colinhacks)  •  [Bluesky](https://bsky.app/profile/zod.dev)

Zod 4 is now stable! Read the [release notes here](https://zod.dev/v4).

## Featured sponsor: Jazz

[![Jazz logo](https://raw.githubusercontent.com/garden-co/jazz/938f6767e46cdfded60e50d99bf3b533f4809c68/homepage/homepage/public/Zod%20sponsor%20message.png)](https://jazz.tools/?utm_source=zod)

Interested in featuring? [Get in touch.](mailto:sponsorship@colinhacks.com)

## [Introduction](https://zod.dev/?id=introduction)

Zod is a TypeScript-first validation library. Using Zod, you can define _schemas_ you can use to validate data, from a simple `string` to a complex nested object.

```
import * as z from "zod/v4";

const User = z.object({
  name: z.string(),
});

// some untrusted data...
const input = { /* stuff */ };

// the parsed result is validated and type safe!
const data = User.parse(input);

// so you can use it with confidence :)
console.log(data.name);
```

## [Features](https://zod.dev/?id=features)

- Zero external dependencies
- Works in Node.js and all modern browsers
- Tiny: 2kb core bundle (gzipped)
- Immutable API: methods return a new instance
- Concise interface
- Works with TypeScript and plain JS
- Built-in JSON Schema conversion
- Extensive ecosystem

## [Installation](https://zod.dev/?id=installation)

```
npm install zod       # npm
deno add npm:zod      # deno
yarn add zod          # yarn
bun add zod           # bun
pnpm add zod          # pnpm
```

Zod also publishes a canary version on every commit. To install the canary:

```
npm install zod@canary       # npm
deno add npm:zod@canary      # deno
yarn add zod@canary          # yarn
bun add zod@canary           # bun
pnpm add zod@canary          # pnpm
```

## [Requirements](https://zod.dev/?id=requirements)

Zod is tested against _TypeScript v5.5_ and later. Older versions may work but are not officially supported.

### [`"strict"`](https://zod.dev/?id=strict)

You must enable `strict` mode in your `tsconfig.json`. This is a best practice for all TypeScript projects.

```
// tsconfig.json
{
  // ...
  "compilerOptions": {
    // ...
    "strict": true
  }
}
```

### [`"moduleResolution"`](https://zod.dev/?id=moduleresolution)

Your `"moduleResolution"` should be set to one of the following. The legacy `"node"` and `"classic"` modes are not supported, as they do not support subpath imports.

- `"node16"` (default if `"module"` is set to `"node16"`/ `"node18"`)
- `"nodenext"` (default if `"module"` is set to `"nodenext"`)
- `"bundler"`

## [Sponsors](https://zod.dev/?id=sponsors)

Sponsorship at any level is appreciated and encouraged. If you built a paid product using Zod, consider one of the [corporate tiers](https://github.com/sponsors/colinhacks).

### [Platinum](https://zod.dev/?id=platinum)

[![CodeRabbit logo](https://github.com/user-attachments/assets/eea24edb-ff20-4532-b57c-e8719f455d6d)![CodeRabbit logo](https://github.com/user-attachments/assets/d791bc7d-dc60-4d55-9c31-97779839cb74)](https://www.coderabbit.ai/)

Cut code review time & bugs in half

[coderabbit.ai](https://www.coderabbit.ai/)

### [Gold](https://zod.dev/?id=gold)

[![Courier logo (light theme)](https://github.com/user-attachments/assets/6b09506a-78de-47e8-a8c1-792efe31910a)![Courier logo (dark theme)](https://github.com/user-attachments/assets/6b09506a-78de-47e8-a8c1-792efe31910a)](https://www.courier.com/?utm_source=zod&utm_campaign=osssponsors)

The API platform for sending notifications

[courier.com](https://www.courier.com/?utm_source=zod&utm_campaign=osssponsors)

[![Liblab logo (light theme)](https://github.com/user-attachments/assets/3de0b617-5137-49c4-b72d-a033cbe602d8)![Liblab logo (dark theme)](https://github.com/user-attachments/assets/34dfa1a2-ce94-46f4-8902-fbfac3e1a9bc)](https://liblab.com/?utm_source=zod)

Generate better SDKs for your APIs

[liblab.com](https://liblab.com/?utm_source=zod)

[![Neon logo (light theme)](https://github.com/user-attachments/assets/b5799fc8-81ff-4053-a1c3-b29adf85e7a1)![Neon logo (dark theme)](https://github.com/user-attachments/assets/83b4b1b1-a9ab-4ae5-a632-56d282f0c444)](https://neon.tech/)

Serverless Postgres — Ship faster

[neon.tech](https://neon.tech/)

[![Retool logo (light theme)](https://github.com/colinhacks/zod/assets/3084745/5ef4c11b-efeb-4495-90a8-41b83f798600)![Retool logo (dark theme)](https://github.com/colinhacks/zod/assets/3084745/ac65013f-aeb4-48dd-a2ee-41040b69cbe6)](https://retool.com/?utm_source=github&utm_medium=referral&utm_campaign=zod)

Build AI apps and workflows with Retool AI

[retool.com](https://retool.com/?utm_source=github&utm_medium=referral&utm_campaign=zod)

[![Stainless logo (light theme)](https://github.com/colinhacks/zod/assets/3084745/e9444e44-d991-4bba-a697-dbcfad608e47)![Stainless logo (dark theme)](https://github.com/colinhacks/zod/assets/3084745/f20759c1-3e51-49d0-a31e-bbc43abec665)](https://stainlessapi.com/)

Generate best-in-class SDKs

[stainlessapi.com](https://stainlessapi.com/)

[![Speakeasy logo (light theme)](https://github.com/colinhacks/zod/assets/3084745/647524a4-22bb-4199-be70-404207a5a2b5)![Speakeasy logo (dark theme)](https://github.com/colinhacks/zod/assets/3084745/b1d86601-c7fb-483c-9927-5dc24ce8b737)](https://speakeasy.com/?utm_source=zod+docs)

SDKs & Terraform providers for your API

[speakeasy.com](https://speakeasy.com/?utm_source=zod+docs)

### [Silver](https://zod.dev/?id=silver)

[![Nitric logo](https://avatars.githubusercontent.com/u/72055470?s=200&v=4)nitric.io](https://nitric.io/)

[![PropelAuth logo](https://avatars.githubusercontent.com/u/89474619?s=200&v=4)propelauth.com](https://www.propelauth.com/)

[![Cerbos logo](https://avatars.githubusercontent.com/u/80861386?s=200&v=4)cerbos.dev](https://cerbos.dev/)

[![Scalar logo](https://avatars.githubusercontent.com/u/301879?s=200&v=4)scalar.com](https://scalar.com/)

[![Trigger.dev logo](https://avatars.githubusercontent.com/u/95297378?s=200&v=4)trigger.dev](https://trigger.dev/)

[![Transloadit logo](https://avatars.githubusercontent.com/u/125754?s=200&v=4)transloadit.com](https://transloadit.com/?utm_source=zod&utm_medium=referral&utm_campaign=sponsorship&utm_content=github)

[![Infisical logo](https://avatars.githubusercontent.com/u/107880645?s=200&v=4)infisical.com](https://infisical.com/)

[![Whop logo](https://avatars.githubusercontent.com/u/91036480?s=200&v=4)whop.com](https://whop.com/)

[![CryptoJobsList logo](https://avatars.githubusercontent.com/u/36402888?s=200&v=4)cryptojobslist.com](https://cryptojobslist.com/)

[![Plain logo](https://avatars.githubusercontent.com/u/70170949?s=200&v=4)plain.com](https://plain.com/)

[![Inngest logo](https://avatars.githubusercontent.com/u/78935958?s=200&v=4)inngest.com](https://inngest.com/)

[![Storyblok logo](https://avatars.githubusercontent.com/u/13880908?s=200&v=4)storyblok.com](https://storyblok.com/)

[![Mux logo](https://avatars.githubusercontent.com/u/16199997?s=200&v=4)mux.link/zod](https://mux.link/zod)

[![Juno logo](https://avatars.githubusercontent.com/u/147273133?s=200&v=4)juno.build](https://juno.build/?utm_source=zod)

### [Bronze](https://zod.dev/?id=bronze)

[![Val Town logo](https://github.com/user-attachments/assets/95305fc4-4da6-4bf8-aea4-bae8f5893e5d)](https://www.val.town/)[val.town](https://www.val.town/)

[![Route4Me logo](https://avatars.githubusercontent.com/u/7936820?s=200&v=4)](https://www.route4me.com/)[route4me.com](https://www.route4me.com/)

[![Encore logo](https://github.com/colinhacks/zod/assets/3084745/5ad94e73-cd34-4957-9979-37da85fcf9cd)](https://encore.dev/)[encore.dev](https://encore.dev/)

[![Replay logo](https://avatars.githubusercontent.com/u/60818315?s=200&v=4)](https://www.replay.io/)[replay.io](https://www.replay.io/)

[![Numeric logo](https://i.imgur.com/kTiLtZt.png)](https://www.numeric.io/)[numeric.io](https://www.numeric.io/)

[![Marcato Partners logo](https://avatars.githubusercontent.com/u/84106192?s=200&v=4)](https://marcatopartners.com/)[marcatopartners.com](https://marcatopartners.com/)

[![Interval logo](https://avatars.githubusercontent.com/u/67802063?s=200&v=4)](https://interval.com/)[interval.com](https://interval.com/)

[![Seasoned logo](https://avatars.githubusercontent.com/u/33913103?s=200&v=4)](https://seasoned.cc/)[seasoned.cc](https://seasoned.cc/)

[![Bamboo Creative logo](https://avatars.githubusercontent.com/u/41406870?v=4)](https://www.bamboocreative.nz/)[bamboocreative.nz](https://www.bamboocreative.nz/)

[![Jason Laster logo](https://avatars.githubusercontent.com/u/254562?v=4)](https://github.com/jasonLaster)[github.com/jasonLaster](https://github.com/jasonLaster)

[![Clipboard logo](https://avatars.githubusercontent.com/u/28880063?s=200&v=4)](https://www.clipboardhealth.com/engineering)[clipboardhealth.com/engineering](https://www.clipboardhealth.com/engineering)

[Edit on GitHub](https://github.com/colinhacks/zod/blob/v4/packages/docs/content/index.mdx)

[Next\\
\\
Migration guide](https://zod.dev/v4/changelog) [Next\\
\\
Basic usage](https://zod.dev/basics)

### On this page

[Introduction](https://zod.dev/#introduction) [Features](https://zod.dev/#features) [Installation](https://zod.dev/#installation) [Requirements](https://zod.dev/#requirements) [`"strict"`](https://zod.dev/#strict) [`"moduleResolution"`](https://zod.dev/#moduleresolution) [Sponsors](https://zod.dev/#sponsors) [Platinum](https://zod.dev/#platinum) [Gold](https://zod.dev/#gold) [Silver](https://zod.dev/#silver) [Bronze](https://zod.dev/#bronze)