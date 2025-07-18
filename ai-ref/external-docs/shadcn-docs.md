TITLE: Initializing Shadcn UI Project (Bash)
DESCRIPTION: This command initializes the `components.json` file in your project, setting up the necessary configuration for shadcn/ui components. It is required only if you are using the CLI to add components.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/components-json.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npx shadcn@latest init
```

----------------------------------------

TITLE: Adding Components with shadcn (CLI)
DESCRIPTION: The `add` command is used to integrate specific shadcn components and their associated dependencies into an existing project. This allows developers to easily extend their application with pre-built UI elements.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/cli.mdx#_snippet_2

LANGUAGE: bash
CODE:
```
npx shadcn@latest add [component]
```

----------------------------------------

TITLE: Initializing shadcn/ui in a Gatsby project
DESCRIPTION: Executes the `shadcn` CLI's `init` command to begin the setup process for shadcn/ui components within the current Gatsby project. This command prepares the project for component integration.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/installation/gatsby.mdx#_snippet_4

LANGUAGE: bash
CODE:
```
npx shadcn@latest init
```

----------------------------------------

TITLE: Initialize shadcn/ui in Next.js Project
DESCRIPTION: This command initializes shadcn/ui in a new or existing Next.js project, guiding the user through configuration options such as project type (Next.js or Monorepo).
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/www/content/docs/installation/next.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npx shadcn@latest init
```

----------------------------------------

TITLE: Configuring Sidebar Side Prop in TSX
DESCRIPTION: This snippet demonstrates how to use the `side` prop to position the sidebar on either the `left` or `right` side of the screen. This allows for flexible layout adjustments based on design requirements or user preferences.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/sidebar.mdx#_snippet_13

LANGUAGE: tsx
CODE:
```
import { Sidebar } from "@/components/ui/sidebar"

export function AppSidebar() {
  return <Sidebar side="left | right" />
}
```

----------------------------------------

TITLE: Implement Pagination Controls for TanStack React Table
DESCRIPTION: This snippet adds user interface controls for pagination to the `DataTable` component. It includes 'Previous' and 'Next' buttons, styled with Shadcn UI, which trigger `table.previousPage()` and `table.nextPage()` methods respectively, enabling navigation through table pages.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/www/content/docs/components/data-table.mdx#_snippet_10

LANGUAGE: tsx
CODE:
```
import { Button } from "@/components/ui/button"

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          { // .... }
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
```

----------------------------------------

TITLE: Configuring Alias for Library Functions (JSON)
DESCRIPTION: This setting defines the import alias for library functions, such as `format-date` or `generate-id`, allowing them to be imported from a designated `lib` directory. This requires `paths` configuration in `tsconfig.json` or `jsconfig.json`.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/components-json.mdx#_snippet_13

LANGUAGE: json
CODE:
```
{
  "aliases": {
    "lib": "@/lib"
  }
}
```

----------------------------------------

TITLE: Configuring Alias for Hooks (JSON)
DESCRIPTION: This configuration establishes the import alias for custom React hooks, such as `use-media-query` or `use-toast`, facilitating organized imports from a `hooks` directory. This alias must be configured in `tsconfig.json` or `jsconfig.json`.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/components-json.mdx#_snippet_14

LANGUAGE: json
CODE:
```
{
  "aliases": {
    "hooks": "@/hooks"
  }
}
```

----------------------------------------

TITLE: Configure Alias for UI Components
DESCRIPTION: Sets the import alias specifically for UI components. This configuration allows you to customize the installation directory for your UI components, providing flexibility in project organization.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/www/content/docs/components-json.mdx#_snippet_12

LANGUAGE: json
CODE:
```
{
  "aliases": {
    "ui": "@/app/ui"
  }
}
```

----------------------------------------

TITLE: Installing Accordion Component via Shadcn CLI (Bash)
DESCRIPTION: This command utilizes the `shadcn` CLI to automatically add the Accordion component and its required dependencies to your project. It streamlines the setup process by handling file generation and package installations.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/accordion.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npx shadcn@latest add accordion
```

----------------------------------------

TITLE: Installing Pagination Component via CLI
DESCRIPTION: This snippet provides the command-line interface (CLI) command to quickly add the Pagination component to your project using the shadcn/ui tool. It's the recommended and most straightforward installation method.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/pagination.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npx shadcn@latest add pagination
```

----------------------------------------

TITLE: Import Shadcn UI Button Component
DESCRIPTION: Imports the `Button` component from the Shadcn UI library. The typical import path points to the `src/components/ui/button` directory, assuming a standard project setup.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/www/content/docs/components/button.mdx#_snippet_2

LANGUAGE: tsx
CODE:
```
import { Button } from "@/components/ui/button"
```

----------------------------------------

TITLE: Creating a Collapsible SidebarGroup in TSX
DESCRIPTION: This example illustrates how to make a `SidebarGroup` collapsible by wrapping it with a `Collapsible` component. It uses `CollapsibleTrigger` within `SidebarGroupLabel` to control the collapse state and `CollapsibleContent` to house the group's content.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/sidebar.mdx#_snippet_22

LANGUAGE: tsx
CODE:
```
export function AppSidebar() {
  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger>
            Help
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent />
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}
```

----------------------------------------

TITLE: Integrate SidebarProvider and Trigger in Root Layout
DESCRIPTION: This snippet demonstrates how to wrap your application with `SidebarProvider` and include `SidebarTrigger` in the main layout (`app/layout.tsx`) to enable sidebar functionality across your application.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/www/content/docs/components/sidebar.mdx#_snippet_3

LANGUAGE: tsx
CODE:
```
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
```

----------------------------------------

TITLE: Nest Link Component within Button using asChild
DESCRIPTION: Shows an alternative method to combine button styling with link functionality. By setting the `asChild` prop on the `Button` component, it renders its child (`Link` in this case) directly, passing down its props and styles. This allows the `Link` to maintain its navigation behavior while appearing as a button.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/www/content/docs/components/button.mdx#_snippet_6

LANGUAGE: tsx
CODE:
```
<Button asChild>
  <Link href="/login">Login</Link>
</Button>
```

----------------------------------------

TITLE: Defining Primary Color CSS Variables (CSS)
DESCRIPTION: This CSS snippet defines two custom properties, `--primary` and `--primary-foreground`, using the `oklch` color function. These variables follow the convention where `--primary` is for background and `--primary-foreground` is for text, demonstrating how to set up custom color palettes for theming.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/theming.mdx#_snippet_4

LANGUAGE: css
CODE:
```
--primary: oklch(0.205 0 0);
--primary-foreground: oklch(0.985 0 0);
```

----------------------------------------

TITLE: Defining Global CSS Variables for Gray Theme (Light and Dark Modes)
DESCRIPTION: This CSS snippet defines a comprehensive set of custom properties (CSS variables) for a UI theme, specifically tailored for a 'Gray' color palette. It includes definitions for both a default (light) mode and a `.dark` class for dark mode, covering various UI components like backgrounds, foregrounds, cards, popovers, primary/secondary elements, borders, inputs, rings, and chart colors, all using the Oklch color format.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/theming.mdx#_snippet_12

LANGUAGE: css
CODE:
```
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.13 0.028 261.692);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.13 0.028 261.692);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.13 0.028 261.692);
  --primary: oklch(0.21 0.034 264.665);
  --primary-foreground: oklch(0.985 0.002 247.839);
  --secondary: oklch(0.967 0.003 264.542);
  --secondary-foreground: oklch(0.21 0.034 264.665);
  --muted: oklch(0.967 0.003 264.542);
  --muted-foreground: oklch(0.551 0.027 264.364);
  --accent: oklch(0.967 0.003 264.542);
  --accent-foreground: oklch(0.21 0.034 264.665);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.928 0.006 264.531);
  --input: oklch(0.928 0.006 264.531);
  --ring: oklch(0.707 0.022 261.325);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0.002 247.839);
  --sidebar-foreground: oklch(0.13 0.028 261.692);
  --sidebar-primary: oklch(0.21 0.034 264.665);
  --sidebar-primary-foreground: oklch(0.985 0.002 247.839);
  --sidebar-accent: oklch(0.967 0.003 264.542);
  --sidebar-accent-foreground: oklch(0.21 0.034 264.665);
  --sidebar-border: oklch(0.928 0.006 264.531);
  --sidebar-ring: oklch(0.707 0.022 261.325);
}

.dark {
  --background: oklch(0.13 0.028 261.692);
  --foreground: oklch(0.985 0.002 247.839);
  --card: oklch(0.21 0.034 264.665);
  --card-foreground: oklch(0.985 0.002 247.839);
  --popover: oklch(0.21 0.034 264.665);
  --popover-foreground: oklch(0.985 0.002 247.839);
  --primary: oklch(0.928 0.006 264.531);
  --primary-foreground: oklch(0.21 0.034 264.665);
  --secondary: oklch(0.278 0.033 256.848);
  --secondary-foreground: oklch(0.985 0.002 247.839);
  --muted: oklch(0.278 0.033 256.848);
  --muted-foreground: oklch(0.707 0.022 261.325);
  --accent: oklch(0.278 0.033 256.848);
  --accent-foreground: oklch(0.985 0.002 247.839);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.551 0.027 264.364);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.21 0.034 264.665);
  --sidebar-foreground: oklch(0.985 0.002 247.839);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0.002 247.839);
  --sidebar-accent: oklch(0.278 0.033 256.848);
  --sidebar-accent-foreground: oklch(0.985 0.002 247.839);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.551 0.027 264.364);
}
```

----------------------------------------

TITLE: Install Manual Dependencies for Calendar
DESCRIPTION: Installs the necessary `npm` packages, `react-day-picker` and `date-fns`, required for the manual setup of the `Calendar` component.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/calendar.mdx#_snippet_1

LANGUAGE: bash
CODE:
```
npm install react-day-picker date-fns
```

----------------------------------------

TITLE: Installing Input Component via CLI (Bash)
DESCRIPTION: This snippet demonstrates how to install the Shadcn UI Input component using the `npx shadcn@latest add` command-line interface. This is the recommended and easiest way to add the component and its dependencies to your project.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/input.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npx shadcn@latest add input
```

----------------------------------------

TITLE: Install Shadcn UI Switch via CLI
DESCRIPTION: Installs the Shadcn UI Switch component using the command-line interface, automatically adding it to your project's components.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/www/content/docs/components/switch.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npx shadcn@latest add switch
```

----------------------------------------

TITLE: Basic Sidebar Component Usage
DESCRIPTION: Shows a minimal example of rendering the `Sidebar` component within a custom `AppSidebar` wrapper, demonstrating its basic integration.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/www/content/docs/components/sidebar.mdx#_snippet_13

LANGUAGE: tsx
CODE:
```
import { Sidebar } from "@/components/ui/sidebar"

export function AppSidebar() {
  return <Sidebar />
}
```

----------------------------------------

TITLE: Controlling Sidebar State with React in TypeScript
DESCRIPTION: This snippet demonstrates how to create a controlled sidebar component using React's `useState` hook. It wraps the `Sidebar` component with `SidebarProvider`, passing the `open` state and `setOpen` function to manage the sidebar's visibility. This pattern ensures the sidebar's state is managed externally.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/sidebar.mdx#_snippet_43

LANGUAGE: tsx
CODE:
```
export function AppSidebar() {
  const [open, setOpen] = React.useState(false)

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar />
    </SidebarProvider>
  )
}
```

----------------------------------------

TITLE: Adding shadcn/ui Button Component with CLI (Bash)
DESCRIPTION: Uses the `shadcn` CLI to add a specific component, such as the `Button`, to the project, making it available for import and use in the application.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/installation/tanstack.mdx#_snippet_6

LANGUAGE: bash
CODE:
```
npx shadcn@canary add button
```

----------------------------------------

TITLE: Add Row Selection Checkbox to Shadcn UI DataTable Columns
DESCRIPTION: This TypeScript JSX code snippet defines a new column for a Shadcn UI DataTable that enables row selection. It leverages @tanstack/react-table's getIsAllPageRowsSelected, getIsSomePageRowsSelected, toggleAllPageRowsSelected, getIsSelected, and toggleSelected methods to manage the selection state of individual rows and all rows on the current page. The column header includes a master checkbox to select/deselect all visible rows, while each row's cell contains a checkbox for individual selection. This setup provides a standard and intuitive way for users to select multiple rows within the table.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/www/content/docs/components/data-table.mdx#_snippet_15

LANGUAGE: tsx
CODE:
```
"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]
```

----------------------------------------

TITLE: Adding Row Selection to Column Definitions (TSX)
DESCRIPTION: This snippet modifies the column definitions to introduce a checkbox for row selection. It enables selecting individual rows and provides a header checkbox to select/deselect all rows on the current page, integrating seamlessly with `@tanstack/react-table`'s selection capabilities.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/data-table.mdx#_snippet_14

LANGUAGE: tsx
CODE:
```
"use client"\n\nimport { ColumnDef } from "@tanstack/react-table"\n\nimport { Badge } from "@/components/ui/badge"\nimport { Checkbox } from "@/components/ui/checkbox"\n\nexport const columns: ColumnDef<Payment>[] = [\n  {\n    id: "select",\n    header: ({ table }) => (\n      <Checkbox\n        checked={\n          table.getIsAllPageRowsSelected() ||\n          (table.getIsSomePageRowsSelected() && "indeterminate")\n        }\n        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}\n        aria-label="Select all"\n      />\n    ),\n    cell: ({ row }) => (\n      <Checkbox\n        checked={row.getIsSelected()}\n        onCheckedChange={(value) => row.toggleSelected(!!value)}\n        aria-label="Select row"\n      />\n    ),\n    enableSorting: false,\n    enableHiding: false,\n  },\n]
```

----------------------------------------

TITLE: Installing Radix UI Slot Dependency Manually (Bash)
DESCRIPTION: This command installs `@radix-ui/react-slot`, a foundational dependency required for the shadcn/ui Button component when opting for a manual installation approach.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/button.mdx#_snippet_1

LANGUAGE: bash
CODE:
```
npm install @radix-ui/react-slot
```

----------------------------------------

TITLE: Render Basic Shadcn UI Button
DESCRIPTION: Demonstrates how to render a fundamental Shadcn UI Button component. This example applies the `outline` variant, providing a styled button with a border.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/www/content/docs/components/button.mdx#_snippet_3

LANGUAGE: tsx
CODE:
```
<Button variant="outline">Button</Button>
```

----------------------------------------

TITLE: Example Usage of FormField with React Hook Form (TSX)
DESCRIPTION: This example demonstrates how to use the <FormField> component with react-hook-form's useForm hook. It shows how to bind an input field to a form control, set its name, and render it within the FormItem structure, including a label, control, description, and message for a 'username' field.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/form.mdx#_snippet_1

LANGUAGE: tsx
CODE:
```
const form = useForm()

<FormField
  control={form.control}
  name="username"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Username</FormLabel>
      <FormControl>
        <Input placeholder="shadcn" {...field} />
      </FormControl>
      <FormDescription>This is your public display name.</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

----------------------------------------

TITLE: Install shadcn/ui Block and Override Primitives
DESCRIPTION: Demonstrates how to install a block from the shadcn/ui registry and override its default primitives (button, input, label) with custom ones by referencing external JSON files.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/registry/examples.mdx#_snippet_5

LANGUAGE: json
CODE:
```
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-login",
  "type": "registry:block",
  "registryDependencies": [
    "login-01",
    "https://example.com/r/button.json",
    "https://example.com/r/input.json",
    "https://example.com/r/label.json"
  ]
}
```

----------------------------------------

TITLE: Example Block File Structure (Plaintext)
DESCRIPTION: This example demonstrates a typical file organization within a new block's folder, showcasing how to structure a complex block with a main page, reusable components, custom hooks, and utility functions. Developers can start with a single file and expand as needed.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/blocks.mdx#_snippet_5

LANGUAGE: plaintext
CODE:
```
dashboard-01
└── page.tsx
└── components
    └── hello-world.tsx
    └── example-card.tsx
└── hooks
    └── use-hello-world.ts
└── lib
    └── format-date.ts
```

----------------------------------------

TITLE: Enabling CSS Variables in components.json
DESCRIPTION: Configures `components.json` to enable CSS variables for Tailwind CSS theming by setting `tailwind.cssVariables` to `true`. This allows for dynamic theme changes via CSS variables, providing a flexible theming solution.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/styleguide.mdx#_snippet_12

LANGUAGE: json
CODE:
```
{
  "style": "default",
  "rsc": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/registry/new-york-v4/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

----------------------------------------

TITLE: Capturing Block Screenshots (Bash)
DESCRIPTION: This command captures screenshots of the block in both light and dark modes, which are used for the block's preview on the website. If previous screenshots exist, they might need to be manually deleted from `apps/www/public/r/styles/new-york` before re-running this command.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/blocks.mdx#_snippet_9

LANGUAGE: bash
CODE:
```
pnpm registry:capture
```

----------------------------------------

TITLE: Implementing a Theme Mode Toggle in React (TypeScript)
DESCRIPTION: This snippet provides a `ModeToggle` component that allows users to switch between light, dark, and system themes. It utilizes the `useTheme` hook to access the `setTheme` function and integrates with UI components like `DropdownMenu` and `Button` to create an interactive theme selection interface.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/dark-mode/vite.mdx#_snippet_2

LANGUAGE: tsx
CODE:
```
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

----------------------------------------

TITLE: Override Tailwind CSS Variables in shadcn/ui Theme
DESCRIPTION: Shows how to customize default Tailwind CSS variables, such as spacing and breakpoints, within your shadcn/ui theme configuration to align with specific design requirements.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/registry/examples.mdx#_snippet_7

LANGUAGE: json
CODE:
```
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-theme",
  "type": "registry:theme",
  "cssVars": {
    "theme": {
      "spacing": "0.2rem",
      "breakpoint-sm": "640px",
      "breakpoint-md": "768px",
      "breakpoint-lg": "1024px",
      "breakpoint-xl": "1280px",
      "breakpoint-2xl": "1536px"
    }
  }
}
```

----------------------------------------

TITLE: Add Custom CSS Animations to shadcn/ui
DESCRIPTION: Demonstrates how to define custom CSS animations using `@keyframes` and link them to theme variables for use in shadcn/ui components. Requires both `cssVars` and `css` definitions.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/registry/examples.mdx#_snippet_14

LANGUAGE: json
CODE:
```
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-component",
  "type": "registry:component",
  "cssVars": {
    "theme": {
      "--animate-wiggle": "wiggle 1s ease-in-out infinite"
    }
  },
  "css": {
    "@keyframes wiggle": {
      "0%, 100%": {
        "transform": "rotate(-3deg)"
      },
      "50%": {
        "transform": "rotate(3deg)"
      }
    }
  }
}
```

----------------------------------------

TITLE: Updating DataTable Component for Column Visibility (TSX)
DESCRIPTION: This snippet updates the `DataTable` component to include state management for sorting, filtering, and column visibility using `@tanstack/react-table`. It adds a dropdown menu allowing users to dynamically toggle the visibility of table columns, enhancing user control over data presentation.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/data-table.mdx#_snippet_13

LANGUAGE: tsx
CODE:
```
"use client"\n\nimport * as React from "react"\nimport {\n  ColumnDef,\n  ColumnFiltersState,\n  SortingState,\n  VisibilityState,\n  flexRender,\n  getCoreRowModel,\n  getFilteredRowModel,\n  getPaginationRowModel,\n  getSortedRowModel,\n  useReactTable,\n} from "@tanstack/react-table"\n\nimport { Button } from "@/components/ui/button"\nimport {\n  DropdownMenu,\n  DropdownMenuCheckboxItem,\n  DropdownMenuContent,\n  DropdownMenuTrigger,\n} from "@/components/ui/dropdown-menu"\n\nexport function DataTable<TData, TValue>({\n  columns,\n  data,\n}: DataTableProps<TData, TValue>) {\n  const [sorting, setSorting] = React.useState<SortingState>([])\n  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(\n    []\n  )\n  const [columnVisibility, setColumnVisibility] =\n    React.useState<VisibilityState>({})\n\n  const table = useReactTable({\n    data,\n    columns,\n    onSortingChange: setSorting,\n    onColumnFiltersChange: setColumnFilters,\n    getCoreRowModel: getCoreRowModel(),\n    getPaginationRowModel: getPaginationRowModel(),\n    getSortedRowModel: getSortedRowModel(),\n    getFilteredRowModel: getFilteredRowModel(),\n    onColumnVisibilityChange: setColumnVisibility,\n    state: {\n      sorting,\n      columnFilters,\n      columnVisibility,\n    },\n  })\n\n  return (\n    <div>\n      <div className="flex items-center py-4">\n        <Input\n          placeholder="Filter emails..."\n          value={table.getColumn("email")?.getFilterValue() as string}\n          onChange={(event) =>\n            table.getColumn("email")?.setFilterValue(event.target.value)\n          }\n          className="max-w-sm"\n        />\n        <DropdownMenu>\n          <DropdownMenuTrigger asChild>\n            <Button variant="outline" className="ml-auto">\n              Columns\n            </Button>\n          </DropdownMenuTrigger>\n          <DropdownMenuContent align="end">\n            {table\n              .getAllColumns()\n              .filter(\n                (column) => column.getCanHide()\n              )\n              .map((column) => {\n                return (\n                  <DropdownMenuCheckboxItem\n                    key={column.id}\n                    className="capitalize"\n                    checked={column.getIsVisible()}\n                    onCheckedChange={(value) =>\n                      column.toggleVisibility(!!value)\n                    }\n                  >\n                    {column.id}\n                  </DropdownMenuCheckboxItem>\n                )\n              })}\n          </DropdownMenuContent>\n        </DropdownMenu>\n      </div>\n      <div className="rounded-md border">\n        <Table>{ ... }</Table>\n      </div>\n    </div>\n  )\n}
```

----------------------------------------

TITLE: Using Custom Warning Colors in a React Component
DESCRIPTION: This React/TSX snippet demonstrates how to apply the previously defined custom warning colors to a `div` element using Tailwind CSS utility classes. The `bg-warning` class sets the background color, and `text-warning-foreground` sets the text color, leveraging the CSS variables defined earlier.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/theming.mdx#_snippet_8

LANGUAGE: tsx
CODE:
```
<div className="bg-warning text-warning-foreground" />
```

----------------------------------------

TITLE: Adding Actions Column to Payment Table (TypeScript)
DESCRIPTION: This snippet demonstrates how to extend a TanStack React Table's column definition to include an 'actions' column. It utilizes `row.original` to access the current row's data and renders a `DropdownMenu` component from shadcn/ui, providing options like copying the payment ID or viewing details.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/data-table.mdx#_snippet_7

LANGUAGE: tsx
CODE:
```
"use client"\n\nimport { ColumnDef } from "@tanstack/react-table"\nimport { MoreHorizontal } from "lucide-react"\n\nimport { Button } from "@/components/ui/button"\nimport {\n  DropdownMenu,\n  DropdownMenuContent,\n  DropdownMenuItem,\n  DropdownMenuLabel,\n  DropdownMenuSeparator,\n  DropdownMenuTrigger,\n} from "@/components/ui/dropdown-menu"\n\nexport const columns: ColumnDef<Payment>[] = [\n  // ...\n  {\n    id: "actions",\n    cell: ({ row }) => {\n      const payment = row.original\n\n      return (\n        <DropdownMenu>\n          <DropdownMenuTrigger asChild>\n            <Button variant="ghost" className="h-8 w-8 p-0">\n              <span className="sr-only">Open menu</span>\n              <MoreHorizontal className="h-4 w-4" />\n            </Button>\n          </DropdownMenuTrigger>\n          <DropdownMenuContent align="end">\n            <DropdownMenuLabel>Actions</DropdownMenuLabel>\n            <DropdownMenuItem\n              onClick={() => navigator.clipboard.writeText(payment.id)}\n            >\n              Copy payment ID\n            </DropdownMenuItem>\n            <DropdownMenuSeparator />\n            <DropdownMenuItem>View customer</DropdownMenuItem>\n            <DropdownMenuItem>View payment details</DropdownMenuItem>\n          </DropdownMenuContent>\n        </DropdownMenu>\n      )\n    },\n  },\n  // ...\n]
```

----------------------------------------

TITLE: Implementing SidebarFooter with User Dropdown in TSX
DESCRIPTION: This snippet demonstrates how to add a sticky `SidebarFooter` to the sidebar, wrapping it within `SidebarProvider` and `Sidebar`. It includes a `DropdownMenu` for user-related actions like account, billing, and sign out, positioned at the top of the footer.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/sidebar.mdx#_snippet_19

LANGUAGE: tsx
CODE:
```
export function AppSidebar() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader />
        <SidebarContent />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> Username
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}
```

----------------------------------------

TITLE: Fixing useSidebar Hook Error Message Typo in TypeScript
DESCRIPTION: This `diff` snippet shows a correction in the error message for the `useSidebar` hook. It changes the expected context from 'Sidebar' to 'SidebarProvider', ensuring the error message accurately reflects the required component for the hook's usage.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/sidebar.mdx#_snippet_48

LANGUAGE: diff
CODE:
```
-  throw new Error("useSidebar must be used within a Sidebar.")
+  throw new Error("useSidebar must be used within a SidebarProvider.")
```

----------------------------------------

TITLE: Wrapping Sidebar Content with SidebarContent in TSX
DESCRIPTION: This example illustrates the use of `SidebarContent` to encapsulate the main scrollable area of the sidebar. It demonstrates how `SidebarGroup` components are placed inside `SidebarContent` to organize the sidebar's navigational elements.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/sidebar.mdx#_snippet_20

LANGUAGE: tsx
CODE:
```
import { Sidebar, SidebarContent } from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
    </Sidebar>
  )
}
```

----------------------------------------

TITLE: Implementing Basic SidebarGroup in TSX
DESCRIPTION: This snippet demonstrates the fundamental structure of a `SidebarGroup` within a `Sidebar` and `SidebarContent`. It shows how to include a `SidebarGroupLabel` for the section title and an optional `SidebarGroupAction` for interactive elements like an "Add Project" button.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/sidebar.mdx#_snippet_21

LANGUAGE: tsx
CODE:
```
import { Sidebar, SidebarContent, SidebarGroup } from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className="sr-only">Add Project</span>
          </SidebarGroupAction>
          <SidebarGroupContent></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
```

----------------------------------------

TITLE: Fetching Projects in a Server Component (RSC, TSX)
DESCRIPTION: This `NavProjects` component is a React Server Component that asynchronously fetches project data using `fetchProjects()`. It then renders the fetched projects within a `SidebarMenu`, displaying each project's icon and name as a clickable link.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/sidebar.mdx#_snippet_39

LANGUAGE: tsx
CODE:
```
async function NavProjects() {
  const projects = await fetchProjects()

  return (
    <SidebarMenu>
      {projects.map((project) => (
        <SidebarMenuItem key={project.name}>
          <SidebarMenuButton asChild>
            <a href={project.url}>
              <project.icon />
              <span>{project.name}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
```

----------------------------------------

TITLE: Setting Multiple Sidebar Widths via Style Prop in TSX
DESCRIPTION: This example demonstrates how to set the width of multiple sidebars using inline CSS variables `--sidebar-width` and `--sidebar-width-mobile` within the `style` prop of the `SidebarProvider`. This approach allows for dynamic or instance-specific width adjustments, overriding global defaults.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/sidebar.mdx#_snippet_8

LANGUAGE: tsx
CODE:
```
<SidebarProvider
  style={{
    "--sidebar-width": "20rem",
    "--sidebar-width-mobile": "20rem"
  }}
>
  <Sidebar />
</SidebarProvider>
```

----------------------------------------

TITLE: Forcing npm Package Installation with Flags
DESCRIPTION: These commands demonstrate how to force install a package using either the `--force` or `--legacy-peer-deps` flag with `npm`. These flags bypass strict peer dependency checks, allowing installation of packages even if their declared peer dependencies are not met, which is useful for React 19 compatibility issues.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/react-19.mdx#_snippet_2

LANGUAGE: Shell
CODE:
```
npm i <package> --force

npm i <package> --legacy-peer-deps
```

----------------------------------------

TITLE: Customizing Resizable Handle Visibility in TypeScript/React
DESCRIPTION: This snippet illustrates how to explicitly show the resizable handle by adding the `withHandle` prop to the `ResizableHandle` component, providing a visual indicator for resizing.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/resizable.mdx#_snippet_5

LANGUAGE: tsx
CODE:
```
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function Example() {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>One</ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>Two</ResizablePanel>
    </ResizablePanelGroup>
  )
}
```

----------------------------------------

TITLE: Importing Select Components (TypeScript/TSX)
DESCRIPTION: Imports the necessary components (Select, SelectContent, SelectItem, SelectTrigger, SelectValue) from the local UI library for use in a TypeScript/TSX file. These imports are essential to utilize the Select component in your application.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/select.mdx#_snippet_2

LANGUAGE: tsx
CODE:
```
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
```

----------------------------------------

TITLE: Basic Checkbox Component Usage (TSX)
DESCRIPTION: This snippet shows the basic JSX usage of the `Checkbox` component. It renders a simple, uncontrolled checkbox element.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/checkbox.mdx#_snippet_3

LANGUAGE: tsx
CODE:
```
<Checkbox />
```

----------------------------------------

TITLE: Installing Radix UI Aspect Ratio Dependency
DESCRIPTION: Installs the core `@radix-ui/react-aspect-ratio` dependency, which is a prerequisite for manually setting up the `AspectRatio` component in your project.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/aspect-ratio.mdx#_snippet_1

LANGUAGE: bash
CODE:
```
npm install @radix-ui/react-aspect-ratio
```

----------------------------------------

TITLE: Installing Collapsible Component Dependencies Manually (NPM)
DESCRIPTION: Installs the core `@radix-ui/react-collapsible` dependency required for the Collapsible component when performing a manual installation.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/collapsible.mdx#_snippet_1

LANGUAGE: bash
CODE:
```
npm install @radix-ui/react-collapsible
```

----------------------------------------

TITLE: Installing Vaul Dependency Manually
DESCRIPTION: This command installs the 'vaul' library, which is a core dependency for the Shadcn UI Drawer component, when performing a manual installation. It ensures the underlying functionality for the drawer is available.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/drawer.mdx#_snippet_1

LANGUAGE: bash
CODE:
```
npm install vaul
```

----------------------------------------

TITLE: Integrating PaginationLink with Next.js Link Component
DESCRIPTION: This diff snippet illustrates how to modify the PaginationLink component in 'pagination.tsx' to utilize Next.js's <Link /> component instead of a standard <a> tag. This change enables client-side routing and improved navigation performance within a Next.js application.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/pagination.mdx#_snippet_3

LANGUAGE: diff
CODE:
```
+ import Link from "next/link"

- type PaginationLinkProps = ... & React.ComponentProps<"a">
+ type PaginationLinkProps = ... & React.ComponentProps<typeof Link>

const PaginationLink = ({...props }: ) => (
  <PaginationItem>
-   <a>
+   <Link>
      // ...
-   </a>
+   </Link>
)
```

----------------------------------------

TITLE: Importing Progress Component for Usage
DESCRIPTION: This TypeScript/React snippet demonstrates how to import the `Progress` component from its defined path within the project's UI library. This import makes the component available for rendering in your application.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/progress.mdx#_snippet_2

LANGUAGE: tsx
CODE:
```
import { Progress } from "@/components/ui/progress"
```

----------------------------------------

TITLE: Installing Input OTP via CLI
DESCRIPTION: This command uses the shadcn/ui CLI to add the Input OTP component and its dependencies to your project, simplifying the installation process by automating file creation and configuration.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/input-otp.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npx shadcn@latest add input-otp
```

----------------------------------------

TITLE: Importing Pagination Components in TSX
DESCRIPTION: This code snippet shows the necessary import statements for using the various Pagination sub-components provided by the shadcn/ui library within a TypeScript React (TSX) file. These imports are essential before utilizing the components in your application.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/pagination.mdx#_snippet_1

LANGUAGE: tsx
CODE:
```
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
```

----------------------------------------

TITLE: Using Skeleton Component with Tailwind CSS (TypeScript/React)
DESCRIPTION: This TypeScript/React snippet demonstrates how to render the `Skeleton` component. It applies Tailwind CSS utility classes to define its height, width, and border-radius, creating a placeholder shape.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/skeleton.mdx#_snippet_2

LANGUAGE: tsx
CODE:
```
<Skeleton className="h-[20px] w-[100px] rounded-full" />
```

----------------------------------------

TITLE: Installing Tooltip Component via CLI
DESCRIPTION: Installs the Tooltip component using the shadcn CLI, which automates the setup process by adding the necessary files and configurations to your project.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/tooltip.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npx shadcn@latest add tooltip
```

----------------------------------------

TITLE: Importing Menubar Components for Usage (TypeScript React)
DESCRIPTION: This snippet illustrates how to import the necessary Menubar components (e.g., Menubar, MenubarContent, MenubarItem) from the local shadcn/ui path, making them available for building interactive menus in a TypeScript React application.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/menubar.mdx#_snippet_2

LANGUAGE: tsx
CODE:
```
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger
} from "@/components/ui/menubar"
```

----------------------------------------

TITLE: Importing Dropdown Menu Components in TSX
DESCRIPTION: This snippet imports the necessary components for constructing a dropdown menu from the local Shadcn UI library. These components include the main `DropdownMenu` wrapper, `Trigger`, `Content`, `Label`, `Item`, and `Separator`.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/dropdown-menu.mdx#_snippet_2

LANGUAGE: tsx
CODE:
```
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
```

----------------------------------------

TITLE: Anatomy of a FormField Component in React Hook Form (TSX)
DESCRIPTION: This snippet illustrates the basic structure and composition of a form field using the <Form>, <FormField>, and related Radix UI components. It shows how to wrap a form field with FormItem, FormLabel, FormControl, FormDescription, and FormMessage for proper accessibility and styling within a React Hook Form context.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/form.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
<Form>
  <FormField
    control={...}
    name="..."
    render={() => (
      <FormItem>
        <FormLabel />
        <FormControl>
          { /* Your form field */}
        </FormControl>
        <FormDescription />
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

----------------------------------------

TITLE: Importing Popover Components in TypeScript
DESCRIPTION: Imports the necessary Popover components (Popover, PopoverContent, PopoverTrigger) from the local UI library path for use in a TypeScript React application.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/popover.mdx#_snippet_2

LANGUAGE: tsx
CODE:
```
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
```

----------------------------------------

TITLE: Importing Drawer Components in TSX
DESCRIPTION: This snippet imports various sub-components of the Shadcn UI Drawer, such as `Drawer`, `DrawerClose`, `DrawerContent`, and others, from the local UI components path. These imports are essential for constructing a drawer in a TypeScript React application.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/drawer.mdx#_snippet_2

LANGUAGE: tsx
CODE:
```
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer"
```

----------------------------------------

TITLE: Install Toggle Component Dependencies Manually
DESCRIPTION: If you prefer manual installation, run this npm command to install the core Radix UI dependency required for the Toggle component to function correctly in your project.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/www/content/docs/components/toggle.mdx#_snippet_1

LANGUAGE: bash
CODE:
```
npm install @radix-ui/react-toggle
```

----------------------------------------

TITLE: Combine SidebarMenuButton and SidebarMenuAction
DESCRIPTION: Illustrates the usage of `SidebarMenuAction` alongside `SidebarMenuButton` within a `SidebarMenuItem`. `SidebarMenuAction` functions independently, allowing for separate clickable elements within the same menu item, such as a link and an action button.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/www/content/docs/components/sidebar.mdx#_snippet_31

LANGUAGE: tsx
CODE:
```
<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <a href="#">
      <Home />
      <span>Home</span>
    </a>
  </SidebarMenuButton>
  <SidebarMenuAction>
    <Plus /> <span className="sr-only">Add Project</span>
  </SidebarMenuAction>
</SidebarMenuItem>
```

----------------------------------------

TITLE: Rendering Icon and Label in SidebarMenuButton (TSX)
DESCRIPTION: This snippet demonstrates how to include an icon and a text label within a `SidebarMenuButton`. The `asChild` prop allows the button to render its child element, in this case, an anchor tag. The label text is wrapped in a `<span>` for proper truncation and styling.
SOURCE: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/sidebar.mdx#_snippet_26

LANGUAGE: tsx
CODE:
```
<SidebarMenuButton asChild>
  <a href="#">
    <Home />
    <span>Home</span>
  </a>
</SidebarMenuButton>
```