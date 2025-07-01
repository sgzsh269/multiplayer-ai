[AI SDK](https://ai-sdk.dev/)

Search…
`⌘ K`

Feedback [GitHub](https://github.com/vercel/ai)

Sign in with Vercel

Sign in with Vercel

Menu

[AI SDK by Vercel](https://ai-sdk.dev/docs/introduction)

[AI SDK 5 Beta](https://ai-sdk.dev/docs/announcing-ai-sdk-5-beta)

[Foundations](https://ai-sdk.dev/docs/foundations)

[Overview](https://ai-sdk.dev/docs/foundations/overview)

[Providers and Models](https://ai-sdk.dev/docs/foundations/providers-and-models)

[Prompts](https://ai-sdk.dev/docs/foundations/prompts)

[Tools](https://ai-sdk.dev/docs/foundations/tools)

[Streaming](https://ai-sdk.dev/docs/foundations/streaming)

[Agents](https://ai-sdk.dev/docs/foundations/agents)

[Getting Started](https://ai-sdk.dev/docs/getting-started)

[Navigating the Library](https://ai-sdk.dev/docs/getting-started/navigating-the-library)

[Next.js App Router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router)

[Next.js Pages Router](https://ai-sdk.dev/docs/getting-started/nextjs-pages-router)

[Svelte](https://ai-sdk.dev/docs/getting-started/svelte)

[Vue.js (Nuxt)](https://ai-sdk.dev/docs/getting-started/nuxt)

[Node.js](https://ai-sdk.dev/docs/getting-started/nodejs)

[Expo](https://ai-sdk.dev/docs/getting-started/expo)

[Guides](https://ai-sdk.dev/docs/guides)

[RAG Chatbot](https://ai-sdk.dev/docs/guides/rag-chatbot)

[Multi-Modal Chatbot](https://ai-sdk.dev/docs/guides/multi-modal-chatbot)

[Slackbot Guide](https://ai-sdk.dev/docs/guides/slackbot)

[Natural Language Postgres](https://ai-sdk.dev/docs/guides/natural-language-postgres)

[Get started with Computer Use](https://ai-sdk.dev/docs/guides/computer-use)

[Get started with Claude 4](https://ai-sdk.dev/docs/guides/claude-4)

[OpenAI Responses API](https://ai-sdk.dev/docs/guides/openai-responses)

[Get started with Claude 3.7 Sonnet](https://ai-sdk.dev/docs/guides/sonnet-3-7)

[Get started with Llama 3.1](https://ai-sdk.dev/docs/guides/llama-3_1)

[Get started with OpenAI GPT-4.5](https://ai-sdk.dev/docs/guides/gpt-4-5)

[Get started with OpenAI o1](https://ai-sdk.dev/docs/guides/o1)

[Get started with OpenAI o3-mini](https://ai-sdk.dev/docs/guides/o3)

[Get started with DeepSeek R1](https://ai-sdk.dev/docs/guides/r1)

[AI SDK Core](https://ai-sdk.dev/docs/ai-sdk-core)

[Overview](https://ai-sdk.dev/docs/ai-sdk-core/overview)

[Generating Text](https://ai-sdk.dev/docs/ai-sdk-core/generating-text)

[Generating Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)

[Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)

[Prompt Engineering](https://ai-sdk.dev/docs/ai-sdk-core/prompt-engineering)

[Settings](https://ai-sdk.dev/docs/ai-sdk-core/settings)

[Embeddings](https://ai-sdk.dev/docs/ai-sdk-core/embeddings)

[Image Generation](https://ai-sdk.dev/docs/ai-sdk-core/image-generation)

[Transcription](https://ai-sdk.dev/docs/ai-sdk-core/transcription)

[Speech](https://ai-sdk.dev/docs/ai-sdk-core/speech)

[Language Model Middleware](https://ai-sdk.dev/docs/ai-sdk-core/middleware)

[Provider & Model Management](https://ai-sdk.dev/docs/ai-sdk-core/provider-management)

[Error Handling](https://ai-sdk.dev/docs/ai-sdk-core/error-handling)

[Testing](https://ai-sdk.dev/docs/ai-sdk-core/testing)

[Telemetry](https://ai-sdk.dev/docs/ai-sdk-core/telemetry)

[AI SDK UI](https://ai-sdk.dev/docs/ai-sdk-ui)

[Overview](https://ai-sdk.dev/docs/ai-sdk-ui/overview)

[Chatbot](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot)

[Chatbot Message Persistence](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence)

[Chatbot Tool Usage](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage)

[Generative User Interfaces](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces)

[Completion](https://ai-sdk.dev/docs/ai-sdk-ui/completion)

[Object Generation](https://ai-sdk.dev/docs/ai-sdk-ui/object-generation)

[OpenAI Assistants](https://ai-sdk.dev/docs/ai-sdk-ui/openai-assistants)

[Streaming Custom Data](https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data)

[Error Handling](https://ai-sdk.dev/docs/ai-sdk-ui/error-handling)

[Smooth streaming japanese text](https://ai-sdk.dev/docs/ai-sdk-ui/smooth-stream-japanese)

[Smooth streaming chinese text](https://ai-sdk.dev/docs/ai-sdk-ui/smooth-stream-chinese)

[Stream Protocols](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)

[AI SDK RSC](https://ai-sdk.dev/docs/ai-sdk-rsc)

[Advanced](https://ai-sdk.dev/docs/advanced)

[Reference](https://ai-sdk.dev/docs/reference)

[AI SDK Core](https://ai-sdk.dev/docs/reference/ai-sdk-core)

[AI SDK UI](https://ai-sdk.dev/docs/reference/ai-sdk-ui)

[AI SDK RSC](https://ai-sdk.dev/docs/reference/ai-sdk-rsc)

[Stream Helpers](https://ai-sdk.dev/docs/reference/stream-helpers)

[AI SDK Errors](https://ai-sdk.dev/docs/reference/ai-sdk-errors)

[Migration Guides](https://ai-sdk.dev/docs/migration-guides)

[Troubleshooting](https://ai-sdk.dev/docs/troubleshooting)

# [AI SDK](https://ai-sdk.dev/docs/introduction\#ai-sdk)

The AI SDK is the TypeScript toolkit designed to help developers build AI-powered applications and agents with React, Next.js, Vue, Svelte, Node.js, and more.

## [Why use the AI SDK?](https://ai-sdk.dev/docs/introduction\#why-use-the-ai-sdk)

Integrating large language models (LLMs) into applications is complicated and heavily dependent on the specific model provider you use.

The AI SDK standardizes integrating artificial intelligence (AI) models across [supported providers](https://ai-sdk.dev/docs/foundations/providers-and-models). This enables developers to focus on building great AI applications, not waste time on technical details.

For example, here’s how you can generate text with various models using the AI SDK:

xAI

OpenAI

Anthropic

Google

Custom

import { generateText } from "ai"

import { xai } from "@ai-sdk/xai"

const { text } = await generateText({

model: xai("grok-3-beta"),

prompt: "What is love?"

})

Love is a universal emotion that is characterized by feelings of affection, attachment, and warmth towards someone or something. It is a complex and multifaceted experience that can take many different forms, including romantic love, familial love, platonic love, and self-love.

The AI SDK has two main libraries:

- **[AI SDK Core](https://ai-sdk.dev/docs/ai-sdk-core):** A unified API for generating text, structured objects, tool calls, and building agents with LLMs.
- **[AI SDK UI](https://ai-sdk.dev/docs/ai-sdk-ui):** A set of framework-agnostic hooks for quickly building chat and generative user interface.

## [Model Providers](https://ai-sdk.dev/docs/introduction\#model-providers)

The AI SDK supports [multiple model providers](https://ai-sdk.dev/providers).

[xAI Grok\\
\\
Image InputImage GenerationObject GenerationTool UsageTool Streaming](https://ai-sdk.dev/providers/ai-sdk-providers/xai) [OpenAI\\
\\
Image InputImage GenerationObject GenerationTool UsageTool Streaming](https://ai-sdk.dev/providers/ai-sdk-providers/openai) [Azure\\
\\
![Azure logo](https://ai-sdk.dev/_next/image?url=%2Ficons%2Fazure.svg&w=256&q=75&dpl=dpl_ENxmcxCkv3fFcq2ficdiYvZbB86a)\\
\\
Image InputObject GenerationTool UsageTool Streaming](https://ai-sdk.dev/providers/ai-sdk-providers/azure) [Anthropic\\
\\
Image InputObject GenerationTool UsageTool Streaming](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) [Amazon Bedrock\\
\\
Image InputImage GenerationObject GenerationTool UsageTool Streaming](https://ai-sdk.dev/providers/ai-sdk-providers/amazon-bedrock) [Groq\\
\\
Object GenerationTool UsageTool Streaming](https://ai-sdk.dev/providers/ai-sdk-providers/groq) [Fal AI\\
\\
Image Generation](https://ai-sdk.dev/providers/ai-sdk-providers/fal) [DeepInfra\\
\\
Image InputObject GenerationTool UsageTool Streaming](https://ai-sdk.dev/providers/ai-sdk-providers/deepinfra) [Google Generative AI\\
\\
![Google Generative AI logo](https://ai-sdk.dev/_next/image?url=%2Ficons%2Fgoogle.svg&w=256&q=75&dpl=dpl_ENxmcxCkv3fFcq2ficdiYvZbB86a)\\
\\
Image InputObject GenerationTool UsageTool Streaming](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai) [Google Vertex AI\\
\\
![Google Vertex AI logo](https://ai-sdk.dev/_next/image?url=%2Ficons%2Fgoogle.svg&w=256&q=75&dpl=dpl_ENxmcxCkv3fFcq2ficdiYvZbB86a)\\
\\
Image InputImage GenerationObject GenerationTool UsageTool Streaming](https://ai-sdk.dev/providers/ai-sdk-providers/google-vertex) [Mistral\\
\\
![Mistral logo](https://ai-sdk.dev/_next/image?url=%2Ficons%2Fmistral.svg&w=256&q=75&dpl=dpl_ENxmcxCkv3fFcq2ficdiYvZbB86a)\\
\\
Image InputObject GenerationTool UsageTool Streaming](https://ai-sdk.dev/providers/ai-sdk-providers/mistral) [Together.ai\\
\\
Object GenerationTool UsageTool Streaming](https://ai-sdk.dev/providers/ai-sdk-providers/togetherai) [Cohere\\
\\
![Cohere logo](https://ai-sdk.dev/_next/image?url=%2Ficons%2Fcohere.svg&w=256&q=75&dpl=dpl_ENxmcxCkv3fFcq2ficdiYvZbB86a)\\
\\
Tool UsageTool Streaming](https://ai-sdk.dev/providers/ai-sdk-providers/cohere) [Fireworks\\
\\
![Fireworks logo](https://ai-sdk.dev/_next/image?url=%2Ficons%2Ffireworks.png&w=256&q=75&dpl=dpl_ENxmcxCkv3fFcq2ficdiYvZbB86a)\\
\\
Image GenerationObject GenerationTool UsageTool Streaming](https://ai-sdk.dev/providers/ai-sdk-providers/fireworks) [DeepSeek\\
\\
![DeepSeek logo](https://ai-sdk.dev/_next/image?url=%2Ficons%2Fdeepseek.svg&w=256&q=75&dpl=dpl_ENxmcxCkv3fFcq2ficdiYvZbB86a)\\
\\
Object GenerationTool UsageTool Streaming](https://ai-sdk.dev/providers/ai-sdk-providers/deepseek) [Cerebras\\
\\
Object GenerationTool UsageTool Streaming](https://ai-sdk.dev/providers/ai-sdk-providers/cerebras) [Perplexity\\
\\
![Perplexity logo](https://ai-sdk.dev/_next/image?url=%2Ficons%2Fperplexity.svg&w=256&q=75&dpl=dpl_ENxmcxCkv3fFcq2ficdiYvZbB86a)](https://ai-sdk.dev/providers/ai-sdk-providers/perplexity) [Luma AI\\
\\
![Luma AI logo](https://ai-sdk.dev/_next/image?url=%2Ficons%2Fluma.png&w=256&q=75&dpl=dpl_ENxmcxCkv3fFcq2ficdiYvZbB86a)\\
\\
Image Generation](https://ai-sdk.dev/providers/ai-sdk-providers/luma)

## [Templates](https://ai-sdk.dev/docs/introduction\#templates)

We've built some [templates](https://vercel.com/templates?type=ai) that include AI SDK integrations for different use cases, providers, and frameworks. You can use these templates to get started with your AI-powered application.

### [Starter Kits](https://ai-sdk.dev/docs/introduction\#starter-kits)

[Chatbot Starter Template\\
\\
Uses the AI SDK and Next.js. Features persistence, multi-modal chat, and more.](https://vercel.com/templates/next.js/nextjs-ai-chatbot) [Internal Knowledge Base (RAG)\\
\\
Uses AI SDK Language Model Middleware for RAG and enforcing guardrails.](https://vercel.com/templates/next.js/ai-sdk-internal-knowledge-base) [Multi-Modal Chat\\
\\
Uses Next.js and AI SDK useChat hook for multi-modal message chat interface.](https://vercel.com/templates/next.js/multi-modal-chatbot) [Semantic Image Search\\
\\
An AI semantic image search app template built with Next.js, AI SDK, and Postgres.](https://vercel.com/templates/next.js/semantic-image-search) [Natural Language PostgreSQL\\
\\
Query PostgreSQL using natural language with AI SDK and GPT-4o.](https://vercel.com/templates/next.js/natural-language-postgres)

### [Feature Exploration](https://ai-sdk.dev/docs/introduction\#feature-exploration)

[Feature Flags Example\\
\\
AI SDK with Next.js, Feature Flags, and Edge Config for dynamic model switching.](https://vercel.com/templates/next.js/ai-sdk-feature-flags-edge-config) [Chatbot with Telemetry\\
\\
AI SDK chatbot with OpenTelemetry support.](https://vercel.com/templates/next.js/ai-chatbot-telemetry) [Structured Object Streaming\\
\\
Uses AI SDK useObject hook to stream structured object generation.](https://vercel.com/templates/next.js/use-object) [Multi-Step Tools\\
\\
Uses AI SDK streamText function to handle multiple tool steps automatically.](https://vercel.com/templates/next.js/ai-sdk-roundtrips)

### [Frameworks](https://ai-sdk.dev/docs/introduction\#frameworks)

[Next.js OpenAI Starter\\
\\
Uses OpenAI GPT-4, AI SDK, and Next.js.](https://github.com/vercel/ai/tree/main/examples/next-openai) [Nuxt OpenAI Starter\\
\\
Uses OpenAI GPT-4, AI SDK, and Nuxt.js.](https://github.com/vercel/ai/tree/main/examples/nuxt-openai) [SvelteKit OpenAI Starter\\
\\
Uses OpenAI GPT-4, AI SDK, and SvelteKit.](https://github.com/vercel/ai/tree/main/examples/sveltekit-openai) [Solid OpenAI Starter\\
\\
Uses OpenAI GPT-4, AI SDK, and Solid.](https://github.com/vercel/ai/tree/main/examples/solidstart-openai)

### [Generative UI](https://ai-sdk.dev/docs/introduction\#generative-ui)

[Gemini Chatbot\\
\\
Uses Google Gemini, AI SDK, and Next.js.](https://vercel.com/templates/next.js/gemini-ai-chatbot) [Generative UI with RSC (experimental)\\
\\
Uses Next.js, AI SDK, and streamUI to create generative UIs with React Server Components.](https://vercel.com/templates/next.js/rsc-genui)

### [Security](https://ai-sdk.dev/docs/introduction\#security)

[Bot Protection\\
\\
Uses Kasada, OpenAI GPT-4, AI SDK, and Next.js.](https://vercel.com/templates/next.js/advanced-ai-bot-protection) [Rate Limiting\\
\\
Uses Vercel KV, OpenAI GPT-4, AI SDK, and Next.js.](https://github.com/vercel/ai/tree/main/examples/next-openai-upstash-rate-limits)

## [Join our Community](https://ai-sdk.dev/docs/introduction\#join-our-community)

If you have questions about anything related to the AI SDK, you're always welcome to ask our community on [GitHub Discussions](https://github.com/vercel/ai/discussions).

## [`llms.txt` (for Cursor, Windsurf, Copilot, Claude etc.)](https://ai-sdk.dev/docs/introduction\#llmstxt-for-cursor-windsurf-copilot-claude-etc)

You can access the entire AI SDK documentation in Markdown format at [ai-sdk.dev/llms.txt](https://ai-sdk.dev/llms.txt). This can be used to ask any LLM (assuming it has a big enough context window) questions about the AI SDK based on the most up-to-date documentation.

### [Example Usage](https://ai-sdk.dev/docs/introduction\#example-usage)

For instance, to prompt an LLM with questions about the AI SDK:

1. Copy the documentation contents from [ai-sdk.dev/llms.txt](https://ai-sdk.dev/llms.txt)
2. Use the following prompt format:

```code-block_code__yIKW2

Documentation:

{paste documentation here}

---

Based on the above documentation, answer the following:

{your question}
```

On this page

[AI SDK](https://ai-sdk.dev/docs/introduction#ai-sdk)

[Why use the AI SDK?](https://ai-sdk.dev/docs/introduction#why-use-the-ai-sdk)

[Model Providers](https://ai-sdk.dev/docs/introduction#model-providers)

[Templates](https://ai-sdk.dev/docs/introduction#templates)

[Starter Kits](https://ai-sdk.dev/docs/introduction#starter-kits)

[Feature Exploration](https://ai-sdk.dev/docs/introduction#feature-exploration)

[Frameworks](https://ai-sdk.dev/docs/introduction#frameworks)

[Generative UI](https://ai-sdk.dev/docs/introduction#generative-ui)

[Security](https://ai-sdk.dev/docs/introduction#security)

[Join our Community](https://ai-sdk.dev/docs/introduction#join-our-community)

[llms.txt (for Cursor, Windsurf, Copilot, Claude etc.)](https://ai-sdk.dev/docs/introduction#llmstxt-for-cursor-windsurf-copilot-claude-etc)

[Example Usage](https://ai-sdk.dev/docs/introduction#example-usage)

Elevate your AI applications with Vercel.

Trusted by OpenAI, Replicate, Suno, Pinecone, and more.

Vercel provides tools and infrastructure to deploy AI apps and features at scale.

[Talk to an expert](https://vercel.com/contact/sales?utm_source=ai_sdk&utm_medium=web&utm_campaign=contact_sales_cta&utm_content=talk_to_an_expert_sdk_docs)