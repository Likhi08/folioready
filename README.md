# FolioReady

**Your story. Your style. Your portfolio—ready.**

FolioReady is a guided portfolio-generator MVP for people who want a polished personal website without writing code. Users choose a portfolio direction, template, colours and corner style; add their content; review a responsive live preview; save a local draft; and generate a prototype share link.

This phase intentionally uses only HTML, CSS and vanilla JavaScript. There is no framework, build pipeline, backend or database.

## Features

- Six portfolio categories: Professional, Personal, Student, Creative, Developer and Freelancer
- One consistent, full portfolio structure with five selectable visual themes
- Custom accent colour and corner styling
- Six-step guided progress navigation
- Personal-details form with accessible labels and inline validation
- Email and URL validation
- Résumé file type and 5 MB size validation
- Editable skills (up to 20) and projects (up to three)
- Editable services, experience timeline, education and certifications
- Profile-image upload from the user's computer with local validation, square cropping and compression
- Automatically generated portfolio statistics
- Optional About, Contact, Skills and Projects sections
- Desktop and mobile live-preview modes
- Full-screen preview modal
- Animated template intros with skip controls
- Staggered scroll reveals, active navigation, cursor glow and ambient motion
- Privacy-conscious local draft saving
- Loading, success and error feedback
- Prototype share-link generation and published portfolio viewing
- Responsive layouts, keyboard navigation and visible focus states

## Local setup

Requirements: Node.js 18 or newer.

1. Open a terminal in this folder:

   ```powershell
   cd "C:\Projects\myidea"
   ```

2. Start the dependency-free development server:

   ```powershell
   npm.cmd run dev
   ```

3. Open:

   [http://127.0.0.1:5173/](http://127.0.0.1:5173/)

   The files are served directly from the project root, so this is the canonical
   local URL. The development server also accepts
   [http://127.0.0.1:5173/portfolio-builder/](http://127.0.0.1:5173/portfolio-builder/)
   as a backwards-compatible alias.

Use `npm.cmd` in Windows PowerShell to bypass the Node installation's
`npm.ps1` wrapper. Some PowerShell configurations enable strict variable
checking, which can make that wrapper fail at `exit $LASTEXITCODE` before npm
starts. In Command Prompt, `npm run dev` is also valid.

No `npm install` step is required because the project has no external JavaScript dependencies. Google Fonts are requested by the landing page; system fonts are used if they are unavailable.

## Folder structure

```text
myidea/
├── index.html    # Landing page, builder UI, dialogs and preview frames
├── styles.css    # FolioReady design system and responsive layouts
├── app.js        # State, validation, draft saving, previews and publishing
├── package.json  # Local development command
├── local-server.js # Local-only static development server
└── README.md     # Project documentation
```

## Draft privacy

Drafts are stored only in the current browser through `localStorage`. FolioReady deliberately excludes email, phone, LinkedIn URL, website URL, profile-image data and résumé information from local draft storage. Profile images are resized in memory for the active preview and prototype link. The uploaded résumé is never read, uploaded or persisted in this MVP; only its type and size are validated during the session.

## Current limitations

- Prototype links contain encoded portfolio data in the URL and are not backed by permanent storage.
- Long portfolios can exceed practical browser or messaging URL limits.
- Anyone with a prototype URL can read the content encoded in it.
- Résumé parsing, hosting and download support are not implemented.
- There are no accounts, authentication, private portfolios or cross-device drafts.
- Generated portfolios do not yet support image uploads, custom domains, analytics or search-engine publishing controls.
- Contact forms cannot deliver messages without a server-side service.
- Local drafts remain only in the browser and can be removed when browser storage is cleared.

## Recommended production roadmap

1. Add secure authentication and user accounts.
2. Store portfolio content in a managed database with per-user authorization.
3. Replace encoded URLs with short, permanent public portfolio slugs.
4. Add private object storage, malware scanning and explicit consent for résumé and image uploads.
5. Add server-side validation, rate limiting, audit logs and abuse prevention.
6. Add accessible image cropping, media optimization and alternative-text guidance.
7. Add version history, autosave, draft recovery and cross-device sync.
8. Add domain management, SEO metadata, social sharing cards and analytics controls.
9. Add automated unit, integration, accessibility and browser testing in CI.
10. Publish a full privacy policy and terms before collecting personal information.

## Vercel deployment

FolioReady is deployed as a static website directly from the project root.
Choose the **Other** framework preset and leave the build command and output
directory empty. The root `vercel.json` explicitly publishes only
`index.html`, `styles.css` and `app.js` as static assets and routes browser
requests to `index.html`. The `local-server.js` file is only for local
development and is never deployed as a serverless function.

## Production note

FolioReady currently demonstrates the complete front-end experience. Treat every generated URL as a clearly labelled prototype until a secure backend and database are introduced.
