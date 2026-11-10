---
name: new-figma-template
description: Recreate a screen or a flow in the Rift DS Figma kit from an existing source (a template route on the site, a lab, a prototype URL, a mock image or another Figma file), built from kit instances bound to the kit's variables, never pasted as a picture. Lays it out on the kit's Templates page at web and phone sizes, chat closed and open, with each AI step of a flow as its own frame and the flow wired as a prototype. Use when asked to put a template, a prototype or a mock into Figma, or to draw a flow in the kit.
icon: dashboard_customize
displayDescription: "Takes a screen or a flow that already exists (a template on the site, a lab, a prototype, a mock image) and rebuilds it on the Figma kit's Templates page from the kit's own components, bound to its variables so a theme or mode switch still works. Lays it out at web and phone sizes, with the chat closed and open, gives each AI step its own frame, and wires the flow as a clickable prototype."
invoke: ["put the [X] template in Figma","bring this prototype into Figma","draw the [X] flow in the kit"]
---

# new-figma-template

Rebuild an existing screen or flow in the Figma kit from the kit's own components. The source already exists; this skill draws it faithfully and invents nothing.

## When invoked

Use when asked to put a template, a prototype, a mock or a flow into Figma. The source can be:

- **A template route** (`/templates/<slug>` on the site, the template's code under `website/src/components/templates/`). The merchant sales frames on the kit's Templates page are the reference build.
- **A lab or any other route** in the site, local or deployed.
- **A prototype or mock from outside**: a URL, a screenshot or image, or a frame in another Figma file.

Before the first Figma call, do what the `new-figma-component` skill's "Before the first Figma call" section says. Its "The kit's conventions" section is the standard for every frame here.

## Instructions

### 1. Read the source

- **A route**: open it in the built-in browser at the widths you will draw (step 2), with the chat closed and open, and screenshot each. Read the template's code for its composition, its components and its pinned demo data (charts and tables are drawn from that data, never guessed from a picture). Note the theme the route runs, read off its page.
- **An image or outside prototype**: read every screen. List each control and match it to a library component. A control the library has no component for is a stop: report it and ask whether it needs `new-component` (and then `new-figma-component`) first, or a drawn stand-in clearly labelled as one.

List the screens and, for a flow, the steps between them (what the person clicks or types, and what changes).

### 2. Plan the frames

On the kit's Templates page, one section per source, with the kit's header card at its top (the same header the component pages use). Lay out:

- **Chat closed**: the screen at desktop and a large desktop width, and on a phone in a device frame with the platform's top bar and tab bar (the iOS ones, from the kit).
- **Chat open**: the docked panel on web, the full-screen takeover on the phone. The responsive thresholds are the chat widget's (`src/chat/queries.ts`).
- **A mobile web column** when the route has a narrow web layout of its own.
- **Flows**: one viewport-sized frame per step, in order, left to right.

Web frames that scroll run the full length of the page with the sidebar held at viewport height; chat-open and flow frames are viewport size. Skip any row the source does not have. Give each frame a caption naming the state, linked to the source's page under `SITE_URL` when it has one.

### 3. Build from the kit

- **Instances, never pictures.** Every control is an instance of the kit's component in the right variant, every surface a frame bound to the kit's variables, so the page's Theme and Mode still drive it. The only stills are what the kit already treats as stills (shaders, maps, a globe).
- **The app shell** is the kit's shell for the mode the source uses (flush, floating or inset), with the sidebar and top bar from the kit.
- **Data** comes from the source's pinned data, typed as the source shows it. Charts are vectors drawn from the data.
- **Build one frame, check it, then derive the rest** from it (the phone and chat-open frames start as copies of the desktop one), so a fix lands once.

### 4. Wire the flow

For a flow, add prototype reactions: each frame's trigger (the button clicked, the chip pressed, the field submitted) navigates to the next step, with the source's transition where it has one. Set the first frame as the flow's starting point and name the flow after the source.

### 5. Check fidelity

Pin the source's theme on the section temporarily, screenshot each frame beside the source's screenshot at the same size, and fix what differs (spacing, type, a wrong variant, a missing state). Then clear the pin, so the section follows the page's Theme and Mode like everything else.

### 6. Map and report

When the source is a docs route that shows the page links (`website/src/components/PageLinks/`) and has no entry yet, add it to `pages` in `website/src/data/figma-nodes.json` with the section's node id, then run `node scripts/validate-figma-nodes.mjs`, so its Figma link lands on the section. A template route is chromeless and shows no page links, so it needs no entry. Report the frames built, the flow and its starting point, any control drawn as a stand-in, and screenshots. Nothing is committed.
