import type { HelpArticle } from "./types";

export const articles: HelpArticle[] = [
  /* ──────────────────────────────────────────────────────
     GETTING STARTED
     ────────────────────────────────────────────────────── */
  {
    id: "getting-started-overview",
    title: "Welcome to Mix Architect",
    category: "getting-started",
    summary:
      "A quick tour of the platform: your dashboard, releases, tracks, and collaboration tools.",
    tags: ["overview", "intro", "dashboard", "getting started"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Your Dashboard",
        body: "After signing in you land on the [Dashboard](/app). It shows all your releases in a responsive grid, sorted by most recent activity. Each release card displays its cover art, title, artist name, status dot (color-coded for Draft, In Progress, or Ready), release type pill (Single, EP, or Album), format pill (Stereo, Dolby Atmos, or Stereo + Atmos), and a track completion count like \"1 of 6 tracks briefed\". If [payment tracking](/app/settings) is enabled, you will also see payment summary stats at the top: Outstanding, Earned, and Total fees across all releases, with a \"View all\" link to the [Payments](/app/payments) page. Use the pin icon on any release card to pin it to the top of your dashboard, and the three-dot menu for quick actions. The sort dropdown lets you order releases by Last Modified, Title, or Date Created.",
        mockup: "dashboard",
      },
      {
        heading: "Grid vs Timeline View",
        body: "The dashboard header has two view toggle buttons: Grid and Timeline. Grid view (the default) displays your releases as cards in a responsive grid. Timeline view arranges releases chronologically based on their target release dates, showing countdowns and scheduling information. Your view preference is saved automatically. Learn more in [Using the Timeline View](/app/help?article=timeline-overview).",
      },
      {
        heading: "Navigating the App",
        body: "The sidebar (desktop) or bottom bar (mobile) gives you quick access to every section of the app: [Dashboard](/app) for your releases, Search (or Cmd+K / Ctrl+K) to jump to any release or track instantly, [Templates](/app/templates) for reusable release presets, [Payments](/app/payments) for fee tracking (if enabled), [Settings](/app/settings) for your profile, defaults, and subscription, and [Help](/app/help) for documentation. The sidebar also includes Notifications for activity updates, Auto for automation features, and Sign Out. Theme switching between Light, Dark, and System modes is available in [Settings](/app/settings) under Appearance.",
        tip: "Press Cmd+K (Mac) or Ctrl+K (Windows) from anywhere in the app to instantly search for and jump to any release or track.",
        mockup: "nav-rail",
      },
      {
        heading: "Key Concepts",
        body: "Releases are your top-level projects (albums, EPs, or singles). Each release contains one or more tracks. On desktop, the release detail page has a two-column layout: the track list on the left and an inspector sidebar on the right showing the cover art, Release Info (artist, type, format, status, target date, genre), Global Mix Direction, Global References, and Payment status. Each track has four tabs: Brief, Audio, Delivery, and Notes. Click the settings gear icon in the release header to open Release Settings, where you can edit all metadata, manage your team, and configure payment. The header also has buttons for the Portal toggle (with a link to open the portal), Save as Template, and the settings gear.",
        mockup: "key-concepts",
      },
    ],
  },
  {
    id: "signing-in",
    title: "Signing In & Creating an Account",
    category: "getting-started",
    summary:
      "Sign in with email and password or use Google for one-click access.",
    tags: ["sign in", "login", "google", "oauth", "account", "create account", "register"],
    updatedAt: "2026-03-18",
    content: [
      {
        heading: "Sign In Options",
        body: "Mix Architect supports two ways to sign in: email and password, or Google. Both options are available on the sign-in page. If you already have an account, enter your email and password and click \"Sign In\". To use Google instead, click \"Continue with Google\" below the form. You will be redirected to Google to select your account, then brought back to the app automatically.",
        mockup: "sign-in-page",
      },
      {
        heading: "Creating a New Account",
        body: "If you do not have an account yet, click \"Create one\" at the bottom of the sign-in page to switch to sign-up mode. Enter your full name, email, and a password, then click \"Create Account\". You will receive a confirmation email — click the link in the email to activate your account. Alternatively, click \"Continue with Google\" to create your account instantly using your Google credentials. No confirmation email is needed when signing up with Google.",
        tip: "If you sign up with email and later click \"Continue with Google\" using the same email address, your accounts are automatically linked. You can use either method to sign in going forward.",
      },
      {
        heading: "After Signing In",
        body: "New accounts are guided through a short onboarding flow where you set your persona (Artist, Engineer, or Both), preferred language, and default mix settings. After onboarding, you land on the [Dashboard](/app) where you can create your first release. Returning users go directly to the Dashboard.",
      },
    ],
  },
  {
    id: "create-first-release",
    title: "Creating Your First Release",
    category: "getting-started",
    summary:
      "Step-by-step guide to creating a release, adding cover art, uploading tracks, and setting your status.",
    tags: ["create", "release", "new project", "setup"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Create a New Release",
        body: "From the [Dashboard](/app), click the \"+ New Release\" button in the top right corner. If you have saved [templates](/app/templates), a template picker is shown first where you can select a template or click \"Start from scratch\". The creation form asks for a title, an optional artist/client name, release type (Single, EP, or Album), format (Stereo, Dolby Atmos, or Stereo + Atmos), genre tags (choose from suggestions like Rock, Pop, Hip-Hop, Electronic, etc. or add your own), and a target release date.",
        tip: "When you create a Single, a track is automatically created with the release title and your default specs from [Settings](/app/settings) applied.",
        mockup: "create-release",
      },
      {
        heading: "The Release Detail Page",
        body: "After creation, you land on the release detail page. On desktop this has a two-column layout: the track list on the left with a \"Flow\" button and \"+ Add Track\" button, and an inspector sidebar on the right. The inspector sidebar shows the cover art, Release Info (Artist, Type, Format, Status, Target Date, Genre), Global Mix Direction (click the pencil icon to update), and Global References (click \"+ Add\" to search and add reference tracks). If payment tracking is enabled, the Payment section appears at the bottom of the sidebar. To add or change the cover art, click the pencil icon on the artwork in the sidebar. This reveals options below the image: an Upload button to choose a file, a Remove button (if art already exists), and an \"Or paste URL\" field to link an image directly. New releases show a dashed upload area with \"Click to upload\" (JPEG or PNG, min 1400x1400). To edit other release metadata, click the settings gear icon in the header to open Release Settings.",
        mockup: "cover-art-upload",
      },
      {
        heading: "Add Tracks",
        body: "In the release detail view, click \"+ Add Track\" in the header next to the Flow button. Give your track a title and it will be created with your default specs from [Settings](/app/settings) applied. Each track appears in the list with a number, title, intent preview, status dot, and approval badge. You can drag tracks to reorder them using the grip handle on the left, or use the move up/down buttons. Delete tracks with the trash icon on the right. Click any track to open it and start working in its four tabs.",
        mockup: "track-upload",
      },
      {
        heading: "Set Release Status",
        body: "Each release has a status: Draft, In Progress, or Ready. You can change the status from the inspector sidebar by clicking the status badge next to \"Status\" in the Release Info section, or from Release Settings (gear icon). A release automatically changes to In Progress once work has started on it (for example, uploading audio or adding tracks). The status badge color appears on your [Dashboard](/app) release cards (orange for Draft, blue for In Progress, green for Ready) and is visible to all collaborators and in the client portal.",
        mockup: "release-status",
      },
    ],
  },
  {
    id: "invite-collaborators",
    title: "Inviting Collaborators to a Release",
    category: "getting-started",
    summary:
      "Share your release with team members and external clients using roles and the portal.",
    tags: ["collaborators", "invite", "share", "team", "permissions"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Sending Invitations",
        body: "Open a release and click the settings gear icon in the header to go to Release Settings. Scroll down past the release metadata to the Team section at the bottom. Enter the email address of the person you want to invite, select their role from the dropdown (Collaborator or Client), and click \"Invite\". They will receive an email with a link to join the release. Active team members appear below the invite form with their email, role badge, status, and a delete button to remove them.",
        mockup: "invite-collaborator",
      },
      {
        heading: "Collaborator vs Client Roles",
        body: "There are two roles. Collaborators have full access to view and edit all release content: tracks, briefs, audio, notes, delivery settings, distribution metadata, and release settings. Clients have view-only access through the client portal and can provide feedback through comments, approve or request changes on individual tracks, and download audio files if permitted. The role badge is displayed next to each team member's email in the Team section.",
        mockup: "collaborator-roles",
      },
      {
        heading: "Accepting Invitations",
        body: "When someone clicks the invite link and joins the release, they appear in the Team list with their role badge and \"Active\" status. You will receive an in-app notification letting you know they have joined. Invitees who do not have a Mix Architect account will be prompted to create one when they click the invite link — they can sign up with email and password or use Google for instant access.",
        tip: "You can remove a team member at any time by clicking the trash icon next to their name in the Team section of Release Settings.",
        mockup: "accept-invitation",
      },
      {
        heading: "Client Portal Sharing",
        body: "For external stakeholders who need to review without logging in, activate the client portal from the release detail page header. Click the Portal toggle to turn it on (the toggle turns green when active), then use the link icon next to the toggle to copy the unique share URL. The portal provides read-only access to the release brief, track list, audio playback, and comments. You can configure exactly what is visible using the portal settings: mix direction, specs, references, payment status, distribution info, and lyrics. For per-track control, use the Delivery tab on each track.",
        mockup: "portal-sharing",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────
     RELEASES
     ────────────────────────────────────────────────────── */
  {
    id: "track-tabs",
    title: "Track Detail: Understanding the Tabs",
    category: "releases",
    summary:
      "Each track has four tabs for managing every aspect of your mix: Brief, Audio, Delivery, and Notes.",
    tags: ["tracks", "tabs", "brief", "audio", "delivery", "notes"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Brief",
        body: "The Brief tab combines your technical settings and creative direction in one place. At the top, Technical Settings has dropdowns for Mix Format (Stereo, Dolby Atmos, or Stereo + Atmos), File Format (WAV, FLAC, AIFF, MP3, or Any), Sample Rate (44.1kHz through 192kHz), Bit Depth (16-bit, 24-bit, 32-bit float), and Channels (Mono, Stereo, or Any). Uploaded audio is validated against these specs. Below the technical settings, the creative intent section starts with \"What should this track feel like?\" — a free-form text area for describing the sonic direction (click \"Edit\" to modify). The Emotional Qualities section lets you tag the track with descriptive words: selected tags appear as filled pills (e.g. spacious, warm, punchy, nostalgic), and available suggestions appear as outline pills you can click to add. The Anti-References section lets you describe sounds or approaches you want to avoid. On the right sidebar, Quick View shows the track status, audio quality (sample rate / bit depth), and format at a glance. Below that, the References section lets you search and add reference tracks (from Apple Music) with optional notes describing what to reference about each one.",
        mockup: "track-tab-intent",
      },
      {
        heading: "Audio",
        body: "The Audio tab is where you upload files, manage versions, and play back audio. The header shows the release and track name with the album art. The version selector (v1, v2, v3, etc.) lets you switch between revisions; click the + button to upload a new version. Each version displays its version number, upload date, comment count, and a download button. The waveform visualization shows the audio with interactive playback: click anywhere to seek, and use the transport controls below (loop, skip back, play/pause, skip forward, repeat). The LUFS loudness measurement is displayed next to the file metadata (format, sample rate, bit depth), color-coded against loudness targets. The Feedback section below the waveform shows all timestamped comments for the current version. Double-click anywhere on the waveform to add a new comment at that timecode. Comment markers appear as small icons on the waveform at their respective positions.",
        mockup: "track-tab-audio",
      },
      {
        heading: "Loudness Analysis (LUFS)",
        body: "When you upload audio, Mix Architect automatically measures the integrated loudness in LUFS (Loudness Units Full Scale). Click the LUFS reading next to the version metadata to expand the Loudness Analysis panel. This shows how every major streaming service, broadcast standard, and social platform will adjust your track during playback. Each row displays the platform name, its target loudness (e.g. Spotify targets -14 LUFS), and the gain change that would be applied to your file. A positive value means the service will turn your track up; a negative value (shown in orange) means it will be turned down. For example, if your mix measures -14.9 LUFS, Spotify would apply +0.9 dB while Apple Music (target -16) would apply -1.1 dB. The panel is grouped into Streaming (Spotify, Apple Music, YouTube, Tidal, Amazon Music, Deezer, Qobuz, Pandora), Broadcast (EBU R128, ATSC A/85, ITU-R BS.1770), and Social (Instagram/Reels, TikTok, Facebook). Use this to check whether your master will be significantly altered on any platform before delivery.",
        mockup: "track-tab-lufs",
      },
      {
        heading: "Delivery",
        body: "The Delivery tab brings together everything related to output and distribution. At the top, Delivery Formats lets you select which output formats your project needs by clicking format chips (WAV, AIFF, FLAC, MP3, AAC, OGG, ALAC, and non-convertible formats like DDP, ADM BWF/Atmos, MQA). Selected formats appear highlighted in green with a checkmark. Click the download arrow icon next to any convertible format to start a conversion. You can also add custom format names. The Special Requirements text area lets you note delivery-specific instructions. Below the formats, the Portal section (if enabled) controls how clients interact with this track: the Client Approval section shows the current approval status with a timestamped history of all approval events, and Track Portal Visibility lets you toggle whether this track is visible on the portal, whether downloads are enabled, and which audio versions the client can access. Further down, the Distribution section (if enabled) captures metadata for digital distribution: Writing, Publishing, and Master Recording splits with percentage tracking, Codes and Identifiers (ISRC and ISWC), Credits, Track Properties (featured artist, language, toggles for explicit lyrics, instrumental, and cover song), Copyright, and Lyrics.",
        mockup: "track-tab-distribution",
      },
      {
        heading: "Notes",
        body: "The Notes tab is a general-purpose space for revision notes and discussion that is not tied to a specific timecode. At the top is a text area with \"Add a note...\" placeholder and a \"Post\" button. Notes appear below in reverse chronological order. Each note shows the author name, a date or relative time, and the message. Client notes are visually distinguished with a green \"Client\" badge so you can tell internal feedback from external feedback at a glance. Use this tab for general revision directions, to-do items, and discussion that does not need to reference a specific moment in the audio. For time-specific feedback, use the Audio tab's waveform comments instead.",
        mockup: "track-tab-notes",
      },
    ],
  },
  {
    id: "client-portal",
    title: "Client Portal and Approvals",
    category: "releases",
    summary:
      "Share your release with clients via a unique link, control what they see, and track per-track approvals.",
    tags: ["portal", "client", "approval", "sharing", "review"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Activating the Portal",
        body: "On the release detail page, look for the Portal toggle in the header area (top right). Click the toggle to activate it (it turns green when active). Once active, click the link icon next to the toggle to copy the unique share URL. Send this link to your client for review access without requiring a Mix Architect account. The portal shows the release brief, track list, audio players, and a comment system. Use the portal settings to control which release-level sections are visible to clients: mix direction, specs, references, payment status, distribution metadata, and lyrics.",
        mockup: "portal-settings",
      },
      {
        heading: "Per-Track Visibility",
        body: "For each track, go to the Delivery tab to control what your client can see. The Track Portal Visibility section has toggle switches for: \"Visible on portal\" (show or hide the entire track), \"Enable download\" (allow or block audio downloads), and individual version toggles (Version 1, Version 2, Version 3, etc.) to control which audio revisions the client can access. This gives you fine-grained control so you can hide works in progress and only share finished mixes. All toggles are independent, so you can make a track visible but disable downloads, or show only the latest version.",
        mockup: "portal-track-visibility",
      },
      {
        heading: "Track Approvals",
        body: "Clients can approve or request changes on individual tracks through the portal. The approval status is tracked in the Client Approval section of each track's Delivery tab. The status shows a colored badge (e.g. green \"Approved\") with a full timestamped history of every approval event: when the client approved, when they requested changes (including their note, such as \"Vocals too quiet\"), when the track was reopened for review, and when it was re-approved. This gives you a clear audit trail of all client decisions. Approval badges also appear on the track list in the release detail page, so you can see at a glance which tracks are approved.",
        mockup: "portal-approval",
      },
    ],
  },
  {
    id: "templates",
    title: "Using Release Templates",
    category: "releases",
    summary:
      "Save time by creating releases from reusable templates with pre-configured specs and settings.",
    tags: ["templates", "reuse", "workflow", "presets"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "What Templates Include",
        body: "A template captures a comprehensive set of release defaults across six collapsible sections. Basics: template name, description, a \"Set as default template\" checkbox (auto-selected for new releases), and artist/client name and email. Release Settings: release type (Single, EP, or Album), format (Stereo, Dolby Atmos, or Stereo + Atmos), and genre tags. Technical Specs: sample rate, bit depth, delivery format selections (WAV, AIFF, FLAC, MP3, AAC, OGG, DDP, ADM BWF/Atmos, MQA, ALAC), and special requirements. Intent Defaults: pre-selected emotional quality tags for new tracks. Distribution Metadata: distributor, record label, copyright holder, language, primary genre, and rights and publishing contacts. Payment Defaults: payment status, currency, and payment notes. When you create a release from a template, all of these defaults are applied automatically.",
        mockup: "template-contents",
      },
      {
        heading: "Creating and Managing Templates",
        body: "There are two ways to create a template. From any release detail page, click the \"Save as Template\" button in the header (next to the settings gear) to capture that release's current configuration. Or go to the [Templates](/app/templates) page and click \"+ New Template\" to build one from scratch using the full template form. Each template card on the [Templates](/app/templates) page shows its name, description, and a summary line like \"Single, Stereo + Atmos, 96 kHz / 24-bit, 4 delivery formats\". Use the three-dot menu on any template card for options like editing or deleting. Give templates descriptive names like \"Stereo Master\" or \"Atmos EP\" to keep them organized.",
        mockup: "template-create",
      },
      {
        heading: "Creating a Release from a Template",
        body: "When creating a new release from the [Dashboard](/app), if you have saved templates, a \"Start from a template\" picker is shown as the first step. It reads \"Pre-fill your release settings, or start from scratch.\" Select a template card and click \"Use Template\" to pre-fill the new release form with those settings, or click \"Start from scratch\" to skip. The create release form also has a \"Change template\" link at the bottom if you want to switch. Any template settings can be customized after the release is created.",
        tip: "Mark your most-used template as the default (\"Set as default template\" checkbox) so it is auto-selected whenever you create a new release.",
        mockup: "template-use",
      },
    ],
  },
  {
    id: "payment-tracking",
    title: "Payment Tracking",
    category: "releases",
    summary:
      "Track fees, payments, and outstanding balances across your releases.",
    tags: ["payments", "fees", "billing", "tracking", "invoicing"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Enabling Payment Tracking",
        body: "Go to [Settings](/app/settings) and find the Payment Tracking section. The section reads: \"Track fees and payment status on releases and tracks. Turn this off if you're mixing your own projects.\" Toggle \"Enable payment tracking\" on. Once enabled, payment-related features appear throughout the app: fee stats on the [Dashboard](/app) (Outstanding, Earned, Total Fees), a Financials tab on each release detail page with Financial Summary, Payment status, Time Log, and Expenses, and the [Payments](/app/payments) page in the sidebar navigation.",
        mockup: "payment-dashboard",
      },
      {
        heading: "Setting Release Fees",
        body: "Open Release Settings (click the gear icon on any release). Scroll down to the Payment section. Set the Payment Status: No Fee, Unpaid, Partial, or Paid. Use the Payment Notes text area to record terms, deposit info, or due dates. The fee amount and payment info is also visible on the Financials tab of the release detail page, where you can click the status to quickly change it.",
        mockup: "payment-release-fees",
      },
      {
        heading: "Payments Dashboard",
        body: "Access the [Payments](/app/payments) page from the sidebar. At the top, three summary cards show Outstanding (total unpaid), Earned (total paid), and Total Fees across all releases, each with a release count. Below, a table lists every release with payment data: Release name, Date, Artist, Fee, Paid, Balance, and Status (with colored badges like \"Partial\" in orange). A Total row at the bottom sums up all fees. Use the \"Export CSV\" button to download payment data as a spreadsheet, or \"Download PDF\" to generate a print-ready payment summary.",
        tip: "Click the Outstanding or Earned stat cards on the [Dashboard](/app) to quickly filter to releases matching that payment status.",
        mockup: "payment-track-fees",
      },
    ],
  },

  {
    id: "distribution-tracker",
    title: "Distribution Tracker",
    category: "releases",
    summary:
      "Track where your release has been submitted, monitor status across platforms, and get notified when it goes live on Spotify.",
    tags: ["distribution", "tracker", "spotify", "apple music", "platform", "status", "live", "submitted"],
    updatedAt: "2026-03-14",
    content: [
      {
        heading: "Adding Platforms to a Release",
        body: "Open any release and scroll down to the Distribution Tracker panel below the track list. Click \"+ Add Platform\" to add a streaming platform. Choose from Spotify, Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud, or Bandcamp. Each platform appears as a row with its official logo, a status indicator, and a distributor tag. You can also use \"Mark as Submitted\" to add multiple platforms at once: select a distributor (DistroKid, TuneCore, CD Baby, LANDR, Ditto, AWAL, UnitedMasters, Amuse, RouteNote, or Self-released), check which platforms you submitted to, and click Submit.",
        mockup: "distribution-add-platform",
      },
      {
        heading: "Status States",
        body: "Each platform entry has a status that tracks where it is in the release pipeline. The six states are: Not Submitted (gray, default for newly added platforms), Submitted (blue, you have sent the release to your distributor), Processing (orange, the distributor is reviewing or processing), Live (green, the release is available on the platform), Rejected (red, the platform or distributor rejected the release), and Taken Down (red, the release was previously live but has been removed). Click the status indicator on any platform row to change it. Status changes are logged in the platform history so you can see when each transition happened.",
        mockup: "distribution-status",
      },
      {
        heading: "Spotify Auto-Detection",
        body: "Spotify is listed at the top of the Distribution Tracker with an \"Updates automatically\" label. Once you mark Spotify as Submitted, Mix Architect periodically checks the Spotify catalog for your release using the ISRC code (from the track's Delivery tab) or the release title and artist name. When your release is found on Spotify, the status automatically changes to Live, the Spotify URL is saved, and you receive a notification. You can also click \"Check Now\" to trigger an immediate check. Auto-detection runs daily for all submitted Spotify entries.",
        tip: "Fill in the ISRC code on your track's Delivery tab before submitting. ISRC-based detection is more reliable than title/artist matching, especially for common names.",
        mockup: "distribution-spotify",
      },
      {
        heading: "Updating Status and Adding Links",
        body: "To change a platform's status, click the status indicator on the platform row. A row of status pills appears where you can select the new state. To add a link to the release on that platform, click \"Add link\" next to the platform name. Enter the URL (for example, the Spotify album link or Apple Music page) and click Save. The link icon turns into a clickable external link that opens the release page on that platform. Use the three-dot menu on any platform row for additional options: edit details, remove the platform, or view the status change history.",
        mockup: "distribution-edit",
      },
      {
        heading: "Bulk Submit and Refresh",
        body: "\"Mark as Submitted\" lets you record a batch submission to your distributor. Select the distributor from the dropdown, check the platforms you submitted to, and click Submit. All selected platforms are added with Submitted status and the distributor tag. \"Check Now\" appears on Spotify entries that have been submitted. Clicking it triggers an immediate Spotify catalog search. If found, the status updates to Live and the URL is saved automatically. For all other platforms (Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud, Bandcamp), update the status manually when you confirm the release is live.",
        mockup: "distribution-bulk",
      },
      {
        heading: "Distributor Tags",
        body: "Each platform entry can have a distributor tag showing which service you used to submit (DistroKid, TuneCore, CD Baby, etc.). This appears as a small pill next to the status indicator. Distributor tags are set automatically when you use \"Mark as Submitted\", or you can set them individually when editing a platform entry. This helps you track which distributor handled which platform, especially if you use different distributors for different territories or platforms.",
        warning: "Analytics only reflect data you have tracked in Mix Architect. If you submit through a distributor's own dashboard, remember to update the status here so your tracker stays accurate.",
        mockup: "distribution-distributor",
      },
    ],
  },
  {
    id: "user-analytics",
    title: "User Analytics",
    category: "releases",
    summary:
      "View your completed releases, average turnaround time, total revenue, and per-client breakdown in the Analytics dashboard.",
    tags: ["analytics", "dashboard", "revenue", "turnaround", "velocity", "clients", "charts"],
    updatedAt: "2026-03-14",
    content: [
      {
        heading: "What the Analytics Page Shows",
        body: "Access the [Analytics](/app/analytics) page from the sidebar. The dashboard displays four summary cards at the top: Completed Releases (total finished projects with monthly average), Average Turnaround Time (days from creation to completion, with fastest and slowest breakdown), Total Revenue (sum of all tracked fees with outstanding balance), and Clients (unique client count with total releases). Below the summary cards, three charts visualize your data over time, and a client breakdown table shows per-client statistics.",
        mockup: "analytics-overview",
      },
      {
        heading: "Release Velocity and Turnaround Time",
        body: "The Release Velocity chart is a bar chart showing how many releases you completed each month within the selected date range. Taller bars mean more productive months. Use this to spot trends in your output and identify busy or slow periods. The Turnaround Time chart shows the average number of days from release creation to completion per month. Lower bars mean faster delivery. Together, these charts help you understand your capacity and whether your workflow is getting faster or slower over time.",
        mockup: "analytics-velocity",
      },
      {
        heading: "Revenue Chart",
        body: "The Revenue chart is an area chart showing total fees earned per month. It tracks the payment amounts recorded on your releases, so it reflects what clients have actually paid. Use this to see income trends, identify your highest-earning months, and plan for quieter periods. Revenue data comes from the payment tracking feature on each release, so make sure fees and payment statuses are up to date for accurate reporting.",
        mockup: "analytics-revenue",
      },
      {
        heading: "Client Breakdown",
        body: "The Client Breakdown table at the bottom of the Analytics page lists every client with their key metrics: number of releases, total revenue, amount paid, and average turnaround time. This helps you identify which clients drive the most work and revenue, who pays on time, and where your time is spent. Click any client row to see their releases. The table sorts by revenue by default.",
        mockup: "analytics-clients",
      },
      {
        heading: "Date Range Picker",
        body: "Use the date range picker in the top right corner to control which period the analytics cover. Preset ranges include Last 7 Days, Last 30 Days, Last 90 Days, and Last 365 Days. You can also set a custom date range by selecting specific start and end dates. All four summary cards and all three charts update to reflect the selected period. The date range picker works the same way across the analytics dashboard.",
        tip: "Use the 365-day range for annual reviews and tax preparation. The 30-day range is useful for monthly check-ins on your business health.",
        mockup: "analytics-date-range",
      },
    ],
  },

  {
    id: "release-settings",
    title: "Release Settings",
    category: "releases",
    summary:
      "Configure release details, client information, distribution metadata, payment tracking, and team members for each release.",
    tags: ["release", "settings", "client", "distribution", "payment", "team", "collaborators", "metadata", "UPC", "copyright"],
    updatedAt: "2026-03-15",
    content: [
      {
        heading: "Opening Release Settings",
        body: "From any release, click the gear icon in the release toolbar or select \"Settings\" from the three-dot menu. The settings page has five sections: Release Details, Client Information, Distribution, Payment, and Team Management. A back arrow at the top returns you to the release view. Changes are saved when you click the Save button at the bottom of the form.",
        mockup: "release-settings-overview",
      },
      {
        heading: "Release Details",
        body: "The Release Details section contains the core metadata for your project. Upload or change cover art by clicking the image area. Set the release Title and Artist name in text fields. Choose the Release Type (Single, EP, or Album) and Format (Stereo, Dolby Atmos, or Stereo + Atmos) using pill-style selectors. Set the Status (Draft, In Progress, or Ready) the same way. Add Genre Tags using the tag input with autocomplete suggestions (Rock, Pop, Hip-Hop, Electronic, etc.). Set a Target Date for your release deadline, which also feeds into the Calendar subscription.",
        mockup: "release-settings-details",
      },
      {
        heading: "Client Information",
        body: "The Client Information section stores contact details for the client associated with this release. Fields include Client Name, Client Email, Client Phone, and Delivery Notes. The client name appears in the Analytics client breakdown and on payment reports. Delivery Notes is a free-text area for special instructions like preferred file naming conventions or delivery platforms.",
        mockup: "release-settings-client",
      },
      {
        heading: "Distribution Metadata",
        body: "The Distribution section captures metadata needed for digital distribution. Fields include Distributor (e.g. DistroKid, TuneCore), Record Label, UPC/EAN barcode, Catalog Number, Copyright Holder, Copyright Year, and Phonographic Copyright (the P-line). These values are used by the Distribution Tracker and appear in your data export.",
        mockup: "release-settings-distribution",
      },
      {
        heading: "Payment Settings",
        body: "The Payment section is visible only when payment tracking is enabled in your User Settings. It shows the Payment Status using pill selectors (No Fee, Unpaid, Partial, Paid), a Project Fee field with currency selector, Paid Amount, and the calculated Balance Due. A Payment Notes text area lets you record payment terms or invoice references. The payment status and amounts appear on dashboard cards and in the Analytics revenue charts.",
        mockup: "release-settings-payment",
        tip: "Set the payment status to \"Partial\" when a deposit has been received. The balance due is calculated automatically from the project fee minus the paid amount.",
      },
      {
        heading: "Team Management",
        body: "The Team Management section lets you invite collaborators and clients to the release. Enter an email address, choose a role (Collaborator or Client), and click Invite. Pending invitations show an \"Invited\" badge with a Resend button. Accepted members show their display name, role, and an option to remove them. The release owner is always listed and cannot be removed. Collaborators can edit tracks and leave comments; Clients have read-only access plus the ability to approve tracks through the client portal.",
        mockup: "release-settings-team",
        warning: "Removing a team member revokes their access immediately. They will no longer be able to view the release or any of its tracks.",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────
     AUDIO
     ────────────────────────────────────────────────────── */
  {
    id: "upload-audio-tracks",
    title: "Uploading and Managing Audio",
    category: "audio",
    summary:
      "How to upload audio files, manage versions, and use the waveform player.",
    tags: ["upload", "tracks", "audio", "versions", "waveform"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Uploading Audio",
        body: "Open any track and go to the Audio tab. Click the upload area or drag and drop a file directly onto it. Supported formats: WAV, AIFF, FLAC, MP3, AAC, and M4A, up to 500 MB per file. The file is uploaded to secure cloud storage, and a waveform visualization is generated automatically. File metadata (format, sample rate, bit depth, duration) is captured and displayed below the version info, for example: \"Typical Wonderful 2025-10-10 MGO.wav, WAV, 48kHz, 24-bit\".",
        mockup: "audio-upload",
      },
      {
        heading: "Track Versions",
        body: "Each time you upload a new file to the same track, it becomes the next version. The version selector above the waveform shows numbered buttons (v1, v2, v3, etc.) plus a + button to upload another version. Click any version to switch to it. Each version displays its version number, upload date, comment count, and a download icon to download the original file. Previous versions are fully preserved with their own comments and waveform. When switching versions for the first time in a session, you may notice a brief loading delay while the audio file is fetched and the waveform is generated. This is normal — once a version has been loaded, switching back to it is instant because the browser caches the audio data.",
        tip: "Upload revised mixes to the same track rather than creating a new track. This keeps your version history clean, preserves comments on older versions, and lets you compare mixes over time.",
        mockup: "track-versions",
      },
      {
        heading: "Waveform Player",
        body: "Every uploaded version displays an interactive waveform. Click anywhere on the waveform to seek to that position. The transport controls below the waveform include: current time, loop toggle, skip backward, play/pause, skip forward, repeat toggle, and total duration. The player also shows an integrated LUFS loudness measurement (e.g. \"-14.8 LUFS\") next to the file metadata, color-coded against loudness targets so you can evaluate levels at a glance. If there are timestamped comments on the current version, small marker icons appear on the waveform at their positions.",
        mockup: "track-tab-audio",
      },
    ],
  },
  {
    id: "audio-converter",
    title: "Delivery Formats and Conversion",
    category: "audio",
    summary:
      "Set up delivery formats, convert audio, and automatically embed metadata tags like artist, cover art, ISRC, and lyrics.",
    tags: ["convert", "export", "format", "delivery", "wav", "mp3", "flac", "aiff", "specs", "metadata", "tags", "isrc", "lyrics", "cover art", "replaygain"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Setting Delivery Formats",
        body: "Open any track and go to the Delivery tab. Here you select which output formats your project needs by clicking the format chips. Available convertible formats: WAV, AIFF, FLAC, MP3, AAC, OGG, and ALAC. Selected formats appear highlighted in green with a checkmark icon. Additional non-convertible formats (DDP, ADM BWF/Atmos, MQA) can be toggled on for reference; they display an info tooltip explaining that automatic conversion is not available. You can also type a custom format name in the \"Custom format...\" input field and click \"+ Add\" for any format not listed. Use the \"Export from\" dropdown to choose which audio version to convert from, such as \"v3 - filename.wav (latest)\".",
        mockup: "format-convert",
      },
      {
        heading: "Converting and Downloading",
        body: "Select which formats should be available by clicking the format chips on the Delivery tab: convertible formats include WAV, AIFF, FLAC, MP3, AAC, OGG, and ALAC. Selected formats appear highlighted in green with a checkmark. Click the download arrow icon next to any selected convertible format to start a conversion. The icon shows a spinner while the conversion is processing in the background. When the conversion completes, the file downloads automatically to your browser. Each conversion uses the audio version you selected in the \"Export from\" dropdown, converting from the original uploaded file to preserve maximum audio quality. Lossless formats (WAV, AIFF, FLAC, ALAC) preserve the source file's sample rate and bit depth. Lossy formats use optimized presets: MP3 exports at 44.1 kHz / 320 kbps, AAC at 44.1 kHz / 256 kbps, and OGG at 44.1 kHz / Quality 8.",
        mockup: "track-tab-specs",
      },
      {
        heading: "Automatic Metadata Embedding",
        body: "When you convert to MP3, FLAC, AAC, OGG, or ALAC, Mix Architect automatically writes industry-standard metadata tags into the output file. This includes: artist, title, album, track number, genre, release year, copyright, ISRC, UPC/barcode, lyrics, cover art, and ReplayGain. ReplayGain is a loudness tag that tells compatible players how much to adjust the volume so tracks play back at a consistent level without clipping. Mix Architect calculates it from the measured LUFS of your audio using the ReplayGain 2.0 standard (reference level of -18 LUFS). MP3 files get ID3v2 tags, FLAC and OGG use Vorbis comments, and AAC/ALAC use iTunes-style MP4 atoms. All metadata is pulled from your release and track details (including the Delivery tab for ISRC and lyrics, and the release cover art). WAV and AIFF exports do not include metadata tags. After a conversion completes, hover over the tag icon next to the format chip to see exactly which tags were embedded.",
        tip: "Fill out distribution metadata on the Delivery tab (ISRC, lyrics) and upload cover art before exporting. The more metadata you provide, the more complete your exported files will be for distribution.",
      },
      {
        heading: "Supported Formats Reference",
        body: "Lossless formats preserve source quality: WAV (PCM, source rate/depth), AIFF (PCM, source rate/depth), FLAC (source rate), ALAC (source rate). Lossy formats use fixed presets optimized for distribution: MP3 (44.1 kHz, 320 kbps, stereo), AAC (44.1 kHz, 256 kbps, stereo), OGG Vorbis (44.1 kHz, quality 8, stereo). Non-convertible formats (tag only, no auto-conversion): DDP, ADM BWF (Atmos), MQA. The Technical Settings (sample rate and bit depth) on the Brief tab are reference metadata describing the source audio; they do not control conversion output. The Special Requirements text area on the Delivery tab lets you add notes about delivery instructions.",
        warning: "Converting from a lossy format (MP3, AAC, OGG) to a lossless format (WAV, FLAC) does not improve audio quality. The original compression artifacts remain. Always upload your highest-quality source file.",
        mockup: "supported-formats",
      },
    ],
  },
  {
    id: "audio-review-comments",
    title: "Leaving Timestamped Comments",
    category: "audio",
    summary:
      "Add time-coded feedback directly on the waveform so collaborators know exactly where to listen.",
    tags: ["comments", "feedback", "review", "timestamp", "waveform", "notes"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Adding a Comment",
        body: "Open a track and go to the Audio tab. Double-click on the waveform at the exact point you want to reference. A text input appears in the Feedback section below the waveform where you can type your comment. The comment is anchored to that timecode and version. In the Feedback section, each comment shows the author's name, a colored timestamp badge (e.g. \"0:07\" or \"1:22\"), the relative date, and the message text. Comment markers also appear as small icons directly on the waveform at their positions. Click any timestamp to jump the playback head to that moment.",
        mockup: "track-tab-audio",
      },
      {
        heading: "Portal Comments",
        body: "Clients reviewing through the portal can also leave timestamped comments on the waveform. Their comments appear in the same Feedback section alongside team comments but are visually distinguished with a \"Client\" badge so you can quickly identify external feedback. This keeps all feedback, internal and external, organized in one place under the relevant audio version.",
        mockup: "portal-comments",
      },
      {
        heading: "Notes vs Audio Comments",
        body: "The Audio tab is for timestamped feedback tied to specific moments in the waveform: \"bring up the vocals at 1:22\" or \"the snare is too loud here\". The Notes tab is for general discussion and revision notes that are not tied to a timecode: \"overall the mix needs more low end\" or \"client wants a more aggressive approach\". Audio comments are version-specific (tied to v1, v2, etc.), while Notes apply to the track as a whole. Use the Brief tab to document the overall creative vision, emotional tags, and reference tracks.",
        tip: "For a complete picture of feedback on a track, check both the Audio tab's Feedback section (for time-specific notes) and the Notes tab (for general discussion). Client feedback may appear in either place.",
        mockup: "resolve-feedback",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────
     TIMELINE
     ────────────────────────────────────────────────────── */
  {
    id: "timeline-overview",
    title: "Using the Timeline View",
    category: "timeline",
    summary:
      "Switch to timeline view on your dashboard to visualize release schedules and countdown to release dates.",
    tags: ["timeline", "schedule", "calendar", "planning", "release date"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Switching to Timeline View",
        body: "On the [Dashboard](/app), look for the two view toggle buttons in the header area (below the payment stats). Click the timeline icon (the second button) to switch from grid view to timeline view. The timeline displays your releases chronologically based on their target release dates. Releases without a target date appear in a separate \"Unscheduled\" section at the bottom. Your view preference is saved automatically, so the dashboard will remember your choice next time you visit.",
        mockup: "timeline-full",
      },
      {
        heading: "Reading the Timeline",
        body: "Each release appears as a card positioned by its target release date. The timeline shows a countdown: \"X days until release\" for upcoming dates or \"Released X days ago\" for past dates. Release cards display the same info as grid view (title, artist, status, format, track count) plus the scheduling context. Status dots are color-coded: orange for Draft, blue for In Progress, and green for Ready. Pinned releases appear at the top of the timeline.",
        mockup: "timeline-navigate",
      },
      {
        heading: "Setting Target Dates",
        body: "To add a release to the timeline, set a target release date either when creating the release or in Release Settings (gear icon on the release page). The Target Release Date field uses a date picker. The timeline updates automatically as you adjust dates. This helps you visualize your schedule and avoid overlapping release windows across multiple projects.",
        tip: "Use the timeline view during planning to space out your releases. Having clear visibility of upcoming deadlines helps prevent bottlenecks in your mixing, mastering, or distribution workflow.",
        mockup: "timeline-dates",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────
     ACCOUNT
     ────────────────────────────────────────────────────── */
  {
    id: "export-data",
    title: "Exporting Your Account Data",
    category: "account",
    summary:
      "Download a complete ZIP export of your releases, tracks, audio files, and payment records.",
    tags: ["export", "data", "download", "backup", "privacy", "zip"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "What's Included",
        body: "The data export is a ZIP file containing all your release metadata, track details, audio files (all versions), and payment records. Before downloading, the app shows an estimate of the export size along with counts: number of releases, tracks, and audio files included. This gives you a complete backup of everything in your account.",
        mockup: "export-contents",
      },
      {
        heading: "Starting an Export",
        body: "Go to [Settings](/app/settings) and scroll to the \"Your Data\" section. Click \"Export My Data\" to begin. The app first calculates an estimate showing the approximate file size and counts (e.g. \"3 releases, 12 tracks, 8 audio files\"). Review the estimate, then click \"Download\" to start the export. A progress bar shows the download status. For large accounts with many audio files, the export may take a while. The ZIP file downloads to your browser automatically when complete. You can click \"Cancel\" to go back without downloading.",
        mockup: "export-progress",
      },
      {
        heading: "Data Privacy",
        body: "Your export contains only data you own or have created. Collaborator contributions (like comments on your releases) are included, but other users' private data is not. The export is generated on-demand and is not stored on our servers after download.",
        tip: "Run a data export periodically as a backup of your projects and audio files. This is especially useful before making major changes to your account.",
        mockup: "export-privacy",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────
     ACCOUNT
     ────────────────────────────────────────────────────── */
  {
    id: "user-settings",
    title: "User Settings",
    category: "account",
    summary:
      "Configure your profile, appearance, email notifications, mix defaults, and more.",
    tags: ["settings", "profile", "email", "notifications", "preferences", "theme", "appearance", "defaults", "persona", "calendar", "export"],
    updatedAt: "2026-03-15",
    content: [
      {
        heading: "Settings Overview",
        body: "Open [User Settings](/app/settings) from the sidebar or the account menu in the top bar. Settings are organized into panels: Profile, Subscription, Region & Currency, Appearance, Persona, Payment Tracking, Email Preferences, Mix Defaults, Calendar, and Your Data. Changes save instantly as you interact with each panel.",
        mockup: "settings-overview",
      },
      {
        heading: "Profile",
        body: "The Profile panel is the first section on the page. It has three fields: Display Name (shown on comments, notifications, and emails to collaborators), Company Name (optional, for branding), and Email (read-only, managed through your authentication provider). Enter your name and click Save. A personalized greeting using your first name appears in the top bar.",
        mockup: "settings-profile",
      },
      {
        heading: "Subscription",
        body: "The Subscription panel shows your current plan. Pro accounts display a green \"PRO\" badge, the monthly price, and a \"Manage Billing\" button that opens the Stripe portal for updating payment methods, viewing invoices, and downloading receipts. Free accounts see an \"Upgrade to Pro\" button instead. Pro unlocks unlimited releases, audio format conversion, and priority support.",
        mockup: "settings-subscription",
      },
      {
        heading: "Region and Currency",
        body: "The Region & Currency panel has two dropdowns. The Locale dropdown sets your language and date format, with a flag emoji next to each option. Changing your locale also updates the default currency automatically to match. The Currency dropdown lets you override the currency used for payment tracking. A format preview at the bottom shows how amounts will appear (e.g. \"$1,234.56\").",
        mockup: "settings-region",
      },
      {
        heading: "Appearance",
        body: "The Appearance panel lets you switch between Light, Dark, and System themes using three styled buttons. The active theme is highlighted with your accent color. System mode follows your operating system preference. Your theme choice is saved to your account and applies across all devices.",
        mockup: "settings-appearance",
      },
      {
        heading: "Persona",
        body: "The Persona panel asks how you use Mix Architect. Choose from Artist, Engineer, Both, or Other using radio buttons. Your selection tailors the experience: choosing Engineer or Both automatically enables payment tracking, while Artist keeps it off by default. You can always override payment tracking independently. A note below the options explains how persona affects default settings.",
        mockup: "settings-persona",
      },
      {
        heading: "Payment Tracking",
        body: "The Payment Tracking panel has a single toggle switch. When enabled, release cards on the dashboard show payment summary stats (Outstanding, Earned, Total fees), and each release gets a Payment section in its settings. When disabled, all payment-related UI is hidden. The toggle saves instantly and refreshes the page.",
        mockup: "settings-payment-tracking",
        tip: "Payment tracking is automatically enabled when you select Engineer or Both as your persona, and disabled for Artist. You can manually override this at any time.",
      },
      {
        heading: "Email Notifications",
        body: "The Email Preferences panel controls which transactional emails you receive from Mix Architect. Each category has an on/off toggle. Categories include: Release Live Alerts (when a release goes live on a platform), New Comment Alerts (when someone comments on your release), Weekly Digest (a summary of activity across your releases), Payment Reminders (when a subscription payment fails), Payment Confirmations (when a payment is processed), Subscription Confirmations (when your plan is activated), Cancellation Notices (when your plan is cancelled), and Client Feedback (when a client approves or requests changes). All categories are enabled by default. Every email includes an unsubscribe link at the bottom.",
        mockup: "settings-email-prefs",
        tip: "You can also unsubscribe from a specific email category by clicking the unsubscribe link at the bottom of any notification email. No sign-in required.",
      },
      {
        heading: "Mix Defaults",
        body: "The Mix Defaults panel sets your preferred starting values for new releases. Choose a default Format (Stereo, Dolby Atmos, or Stereo + Atmos) using pill-style buttons. Select a default Sample Rate (44.1kHz, 48kHz, or 96kHz) and Bit Depth (16-bit, 24-bit, or 32-bit float) from dropdowns. You can also define a default Element List using the tag input (e.g. Vocals, Bass, Drums). These defaults auto-populate when you create new releases, saving repetitive setup. Click Save to persist your choices.",
        mockup: "settings-mix-defaults",
      },
      {
        heading: "Calendar",
        body: "The Calendar panel provides an iCal subscription feed for your release deadlines. A read-only URL field shows your personal feed address with a Copy button to copy it to your clipboard. Below that, setup instructions explain how to add the feed to Google Calendar, Apple Calendar, or Outlook. A Regenerate button creates a new feed URL if you need to revoke access to the old one.",
        mockup: "settings-calendar",
        warning: "Regenerating your calendar feed URL invalidates the old link. Any calendars subscribed to the previous URL will stop receiving updates.",
      },
      {
        heading: "Your Data",
        body: "The Your Data panel lets you export all of your Mix Architect data. It shows an estimated export size and provides a Download button. The export includes all releases, tracks, audio file metadata, notes, comments, collaborator lists, and settings. Use this for backups or if you want a local copy of your work.",
        mockup: "settings-data",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────
     BILLING
     ────────────────────────────────────────────────────── */
  {
    id: "manage-subscription",
    title: "Managing Your Pro Subscription",
    category: "billing",
    summary:
      "View your plan, update payment details, and manage your Pro subscription through Stripe.",
    tags: ["subscription", "pro", "billing", "payment", "plan"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Viewing Your Plan",
        body: "Go to [Settings](/app/settings) and scroll to the Subscription section at the bottom. The section reads \"Manage your Mix Architect plan.\" You will see your current plan: Pro accounts display \"$14/month, Unlimited releases\" with a green \"PRO\" badge and a \"Manage Billing\" button. Free accounts show an \"Upgrade to Pro\" button instead.",
        mockup: "plan-current",
      },
      {
        heading: "Upgrading to Pro",
        body: "From the [Settings](/app/settings) page, click \"Upgrade to Pro\" in the Subscription section. You will be taken to a secure Stripe checkout page. Once payment is confirmed, your account is upgraded immediately and you gain access to all Pro features, including unlimited releases and audio conversion. The Pro badge appears next to your plan info.",
        mockup: "upgrade-pro",
      },
      {
        heading: "Managing Payment",
        body: "Click \"Manage Billing\" in the Subscription section of [Settings](/app/settings) to open the Stripe billing portal. From there you can update your payment method, view invoices, and download receipts. All payment processing is handled securely by Stripe.",
        mockup: "manage-payment",
      },
    ],
  },
  {
    id: "cancel-resubscribe",
    title: "Cancelling and Resubscribing",
    category: "billing",
    summary:
      "How to cancel your Pro subscription and what happens to your data.",
    tags: ["cancel", "resubscribe", "downgrade", "billing"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Cancelling Your Subscription",
        body: "Click \"Manage Billing\" in the Subscription section of [Settings](/app/settings) to open the Stripe portal, then click \"Cancel plan\". Your Pro access continues until the end of your current billing period. A notice in [Settings](/app/settings) will show when your Pro plan expires so you know exactly how long your access lasts.",
        mockup: "cancel-subscription",
      },
      {
        heading: "What Happens to Your Data",
        body: "All your releases, tracks, audio files, comments, and payment records are fully preserved. You do not lose anything when downgrading. However, Pro features (like unlimited releases and audio conversion) will become unavailable until you resubscribe. Your existing releases remain accessible.",
        warning: "Free accounts are limited to one active release. If you have more than one release when your Pro plan expires, your existing releases are preserved but you will not be able to create new releases until you resubscribe or reduce to one release.",
        mockup: "data-after-cancel",
      },
      {
        heading: "Resubscribing",
        body: "To reactivate Pro, go to the Subscription section in [Settings](/app/settings) and click \"Upgrade to Pro\" again, or use \"Manage Billing\" to resubscribe through the Stripe portal. Your previous data, settings, templates, and team configurations are all intact and immediately available.",
        mockup: "resubscribe",
      },
    ],
  },
  {
    id: "tracking-expenses",
    title: "Tracking Project Expenses",
    category: "billing",
    summary:
      "Record and manage expenses for each release — gear rentals, session fees, travel, and more.",
    tags: ["expenses", "costs", "budget", "money", "tracking", "payments"],
    updatedAt: "2026-03-17",
    content: [
      {
        heading: "Enabling Expense Tracking",
        body: "Expense tracking is part of the Payment Tracking feature. To enable it, go to [Settings](/app/settings) and toggle on \"Payment Tracking\" in the Payment section. Once enabled, a Financials tab appears on every release detail page — this is where you'll find Expenses alongside your Financial Summary, Payment status, and Time Log.",
        tip: "Expenses are per-release, so each project keeps its own running total.",
        mockup: "expense-financials-tab",
      },
      {
        heading: "Adding an Expense",
        body: "Open any release and switch to the Financials tab. In the Expenses section, click \"+ Add\" to reveal the inline form. Enter a description (e.g. \"Studio rental\"), the amount, and optionally who paid and who owes. Press Enter or click the check icon to save. The expense appears immediately in the list and the running total updates.",
        mockup: "expense-add",
      },
      {
        heading: "Editing and Deleting Expenses",
        body: "Hover over any expense line item to reveal the edit and delete icons. Click the pencil icon to edit the description, amount, paid-by, or owed-by fields inline. Click the trash icon to remove an expense. All changes are saved automatically.",
        warning: "Deleting an expense cannot be undone. Double-check before removing an entry.",
        mockup: "expense-list",
      },
      {
        heading: "Expenses in the Financial Summary",
        body: "The Financial Summary at the top of the Financials tab aggregates your project fee, time logged, and total expenses into a single view. The net amount shown is your fee minus expenses, giving you a quick picture of project profitability. The [Payments](/app/payments) page also shows aggregate expense totals across all releases.",
        mockup: "expense-financial-summary",
      },
      {
        heading: "Exporting Expense Data",
        body: "When you export your release data from the dashboard, all expenses are included in the export as a dedicated expenses.csv file. Each row includes the description, amount, paid-by, owed-by, and timestamps. Time entries are also exported in a separate time-entries.csv file.",
        mockup: "expense-export",
      },
    ],
  },
  {
    id: "logging-time",
    title: "Logging Time on Releases",
    category: "billing",
    summary:
      "Use the built-in timer or manual entry to track hours spent on each release.",
    tags: ["time", "timer", "hours", "rate", "billing", "tracking", "stopwatch"],
    updatedAt: "2026-03-17",
    content: [
      {
        heading: "Enabling Time Tracking",
        body: "Time tracking is part of the Payment Tracking feature. Go to [Settings](/app/settings) and toggle on \"Payment Tracking\". You can also set a default hourly rate in the same section — this rate is pre-filled whenever you log a new time entry.",
        mockup: "timer-settings",
      },
      {
        heading: "Using the Timer",
        body: "A floating timer button appears in the bottom-right corner of every release page. Click the stopwatch icon to expand it, then click \"Start\" to begin timing. The stopwatch runs in real time — you can pause and resume as needed. When you're finished, click the stop button. A log entry form appears with the elapsed time (rounded to the nearest quarter hour), your default hourly rate, a billable toggle, and a description field. Edit any values and click \"Save Entry\" to add it to the Time Log.",
        tip: "The timer uses your system clock so it stays accurate even if the browser tab is in the background. However, it does not persist across page reloads.",
        mockup: "timer-floating",
      },
      {
        heading: "Saving a Timer Session",
        body: "When you stop the timer, a compact form appears. Choose whether the entry is billable (toggle on by default), adjust the hours and rate if needed, and add a description of what you worked on. Click \"Save Entry\" to add it to the Time Log on the Financials tab, or \"Discard\" to throw away the session. You can also press Enter in the description field to save quickly.",
        mockup: "timer-log-form",
      },
      {
        heading: "Manual Time Entries",
        body: "Switch to the Financials tab on any release. In the Time Log section, click \"+ Add\" to create a manual entry. Enter the hours worked, an optional hourly rate, toggle billable on or off, and add a description. Manual entries are marked with a pencil icon, while timer entries show a stopwatch icon, so you can easily tell them apart.",
        mockup: "time-entry-list",
      },
      {
        heading: "Financial Summary and Export",
        body: "Time entries feed into the Financial Summary at the top of the Financials tab, which shows total hours logged and the billable total alongside your project fee and expenses. The [Payments](/app/payments) page shows aggregate time stats across all releases. When you export data, time entries are included as a time-entries.csv file with hours, rate, description, entry type, and timestamps.",
        mockup: "time-export",
      },
    ],
  },
];
