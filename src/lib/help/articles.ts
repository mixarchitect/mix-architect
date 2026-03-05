import type { HelpArticle } from "./types";

const CATEGORY_LABELS: Record<string, string> = {
  "getting-started": "Getting Started",
  releases: "Releases",
  audio: "Audio",
  timeline: "Timeline",
  account: "Account",
  billing: "Billing",
};

export { CATEGORY_LABELS };

export const articles: HelpArticle[] = [
  /* ──────────────────────────────────────────────────────
     GETTING STARTED
     ────────────────────────────────────────────────────── */
  {
    id: "getting-started-overview",
    title: "Welcome to Mix Architect",
    category: "getting-started",
    summary:
      "A quick tour of the platform, from your dashboard to releases, tracks, and collaboration tools.",
    tags: ["overview", "intro", "dashboard", "getting started"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Your Dashboard",
        body: "After signing in you land on the dashboard. It shows all your releases in a responsive grid, sorted by most recent activity. Each release card displays its cover art, title, artist, status badge, format, and track completion count. If payment tracking is enabled, you will also see payment stats at the top: Outstanding, Earned, and Total fees across all releases.",
        mockup: "dashboard",
      },
      {
        heading: "Navigating the App",
        body: "The sidebar (or bottom bar on mobile) gives you quick access to the Dashboard, Search, Templates, Payments (if enabled), Settings, and Help. Use the search button or Cmd+K to jump to any release or track instantly. The sidebar also includes Notifications for activity updates, Auto for automation, and Sign Out. Theme switching (light, dark, or system) is available in Settings under Appearance.",
        tip: "Pin your most important releases so they always appear at the top of the dashboard.",
        mockup: "nav-rail",
      },
      {
        heading: "Key Concepts",
        body: "Releases are your top-level projects. Each release contains one or more tracks. Tracks are where the real work happens: each track has six tabs for Intent, Specs, Audio, Distribution, Portal, and Notes. The release detail page shows your track list with status dots, intent previews, and approval badges. Click the settings gear to access Release Settings where you can edit metadata, manage your team, and configure payment.",
        mockup: "key-concepts",
      },
    ],
  },
  {
    id: "create-first-release",
    title: "Creating Your First Release",
    category: "getting-started",
    summary:
      "Step-by-step guide to creating a release, adding metadata, and uploading your first track.",
    tags: ["create", "release", "new project", "setup"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Create a New Release",
        body: "From the dashboard, click the \"New Release\" button in the top right. If you have saved templates, you will be shown a template picker first. Otherwise, you go straight to the form. Enter a title, optionally add an artist name, choose the release type (Single, EP, or Album), format (Stereo, Dolby Atmos, or Stereo + Atmos), genre tags, and a target release date. Click \"Create\" to generate your release.",
        tip: "When you create a Single, a track is automatically created with the release title and your default specs applied.",
        mockup: "create-release",
      },
      {
        heading: "Add Cover Art",
        body: "Open Release Settings (gear icon on the release page) to find the Cover Art section at the top. Upload an image (PNG, JPG, WebP, or GIF) or paste a URL. The image is displayed on the release card, in the brief, and on the client portal.",
        mockup: "cover-art-upload",
      },
      {
        heading: "Upload Your First Track",
        body: "In the release detail view, click \"Add Track\" below the track list on the left. Give your track a title and it will be created. Then open the track and go to the Audio tab to upload your audio file. Supported formats: WAV, AIFF, FLAC, MP3, AAC, and M4A, up to 500 MB per file. A waveform visualization will appear once processing completes.",
        mockup: "track-upload",
      },
      {
        heading: "Set Release Status",
        body: "Each release has a status: Draft, In Progress, or Ready. Update the status from the release settings page. The status badge appears on your dashboard release cards and is visible to all collaborators.",
        mockup: "release-status",
      },
    ],
  },
  {
    id: "invite-collaborators",
    title: "Inviting Collaborators to a Release",
    category: "getting-started",
    summary:
      "Share your release with team members and external clients.",
    tags: ["collaborators", "invite", "share", "team", "permissions"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Sending Invitations",
        body: "Open a release, click the settings gear icon, and scroll down to the Team section below the release settings. Enter the email address of the person you want to invite and select their role: Collaborator (full access to edit) or Client (view-only with approval capabilities). Click \"Invite\" to send them an email with a link to join the release.",
        mockup: "invite-collaborator",
      },
      {
        heading: "Collaborator vs Client Roles",
        body: "There are two roles. Collaborators can view and edit all release content: tracks, specs, audio, notes, and distribution metadata. Clients have view-only access and can provide feedback through the portal, approve tracks, and download audio if permitted. The role badge is displayed next to each team member's name.",
        mockup: "collaborator-roles",
      },
      {
        heading: "Accepting Invitations",
        body: "When someone accepts their invitation, they appear in the team list with their role badge and the date they joined. You will receive an in-app notification letting you know they have joined.",
        tip: "Invitees who do not have a Mix Architect account will be prompted to create one when they click the invite link.",
        mockup: "accept-invitation",
      },
      {
        heading: "Client Portal Sharing",
        body: "For external stakeholders who need to review without logging in, activate the client portal from the release detail page. This generates a unique share link that provides read-only access to the brief, track list, audio, and comments. You can configure exactly what is visible: mix direction, specs, references, payment status, distribution info, and lyrics.",
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
      "Each track has six tabs for managing every aspect of your mix, from creative intent to delivery specs.",
    tags: ["tracks", "tabs", "intent", "specs", "audio", "distribution", "portal", "notes"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Intent",
        body: "The Intent tab is where you describe the creative vision for a track. Write a free-form mix direction under \"What should this track feel like?\", tag the track with Emotional Qualities (choose from suggestions or add your own), and note any anti-references to describe sounds you want to avoid. A Quick View sidebar shows the track status, quality, and format at a glance, plus your reference tracks.",
        mockup: "track-tab-intent",
      },
      {
        heading: "Specs",
        body: "The Specs tab holds Technical Settings for the track: format (Stereo, Dolby Atmos, or Stereo + Atmos), sample rate, and bit depth. Below the format settings, the Delivery section lets you select which formats should be available for conversion. Selected formats appear highlighted; click a format chip to toggle it on or off. You can also add delivery notes.",
        mockup: "track-tab-specs",
      },
      {
        heading: "Audio",
        body: "The Audio tab is where you upload files, manage versions, and play back the waveform. Use the version selector (v1, v2, v3, etc.) to switch between revisions. The player shows the waveform, playback controls, LUFS loudness measurement, and file metadata. Double-click the waveform to leave a timestamped comment tied to that specific moment in the audio.",
        mockup: "track-tab-audio",
      },
      {
        heading: "Distribution",
        body: "The Distribution tab captures metadata needed for digital distribution. It includes three split sections (Writing, Publishing, and Master Recording) with per-person percentages, PRO info, and IPI numbers. Below the splits: Codes and Identifiers (ISRC, ISWC), Credits (producer, composer/songwriter), Track Properties (featured artist, language, explicit lyrics, instrumental, cover song toggles), Copyright (registration number and date), and Lyrics.",
        mockup: "track-tab-distribution",
      },
      {
        heading: "Portal",
        body: "The Portal tab has two sections. Client Approval at the top shows the current approval status with a timestamped history of all approval events (approved, requested changes, reopened for review). Below that, Track Portal Visibility lets you toggle whether this track appears on the portal, whether downloads are enabled, and which audio versions the client can access.",
        mockup: "track-tab-portal",
      },
      {
        heading: "Notes",
        body: "The Notes tab is a general-purpose space for revision notes and discussion that is not tied to a specific timecode. Team members and clients can leave notes, and client notes are visually distinguished with a badge. Use this tab for general feedback, to-dos, and discussion that does not need to reference a specific moment in the audio.",
        mockup: "track-tab-notes",
      },
    ],
  },
  {
    id: "client-portal",
    title: "Client Portal and Approvals",
    category: "releases",
    summary:
      "Share your release with clients via a unique link, control what they can see, and track approvals.",
    tags: ["portal", "client", "approval", "sharing", "review"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Activating the Portal",
        body: "On the release detail page, click the Portal toggle in the header area. Once active, you get a unique share link you can copy and send to your client. The portal provides read-only access without requiring an account. Use the portal settings menu to control what sections are visible: mix direction, specs, references, payment status, distribution, and lyrics.",
        mockup: "portal-settings",
      },
      {
        heading: "Per-Track Visibility",
        body: "For each track, go to the Portal tab to control what your client can see. Toggle track visibility on or off, enable or disable downloads, and choose which audio versions are accessible. This gives you fine-grained control so you can hide works in progress and only share finished mixes.",
        mockup: "portal-track-visibility",
      },
      {
        heading: "Track Approvals",
        body: "Clients can approve or request revisions on individual tracks through the portal. The approval status (Pending, Approved, Rejected, or Revisions Requested) is tracked with a timestamped history so you have a clear record of all decisions. Approval events appear in the Portal tab of each track.",
        mockup: "portal-approval",
      },
    ],
  },
  {
    id: "templates",
    title: "Using Release Templates",
    category: "releases",
    summary:
      "Save time by creating releases from reusable templates with pre-configured specs and delivery formats.",
    tags: ["templates", "reuse", "workflow", "presets"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "What Templates Include",
        body: "A template captures a release's specs (format, sample rate, bit depth), delivery formats, and client info. When you create a release from a template, these defaults are automatically applied to new tracks, saving you from configuring the same settings repeatedly.",
        mockup: "template-contents",
      },
      {
        heading: "Creating a Template",
        body: "Navigate to the Templates page from the sidebar. Click \"New Template\" and fill in the defaults you want to reuse: audio format, sample rate, bit depth, and delivery formats. Give the template a descriptive name. You can also set one template as your default, which will be pre-selected when creating new releases.",
        mockup: "template-create",
      },
      {
        heading: "Using a Template",
        body: "When creating a new release, if you have saved templates, a template picker is shown as the first step. Select a template and click \"Use Template\" to pre-fill the release with those settings. You can also click \"Start from scratch\" to skip templates entirely. Any template settings can be customized after the release is created.",
        tip: "Create templates for your most common project types: singles, EPs, albums, Dolby Atmos projects, etc. This ensures consistency and saves setup time.",
        mockup: "template-use",
      },
    ],
  },
  {
    id: "payment-tracking",
    title: "Payment Tracking",
    category: "releases",
    summary:
      "Track fees, payments, and outstanding balances across your releases and individual tracks.",
    tags: ["payments", "fees", "billing", "tracking", "invoicing"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Enabling Payment Tracking",
        body: "Go to Settings and toggle \"Enable payment tracking\" in the Payment Tracking section. Once enabled, you can set fees on releases and individual tracks. Payment stats will appear at the top of your dashboard showing Outstanding, Earned, and Total amounts across all releases.",
        mockup: "payment-dashboard",
      },
      {
        heading: "Setting Release Fees",
        body: "In the release settings, scroll to the Payment section. Set the total fee amount, choose a currency (USD, EUR, GBP, CAD, or AUD), and update the payment status: No Fee, Unpaid, Partial, or Paid. You can also record the amount paid so far and add payment notes for your records.",
        mockup: "payment-release-fees",
      },
      {
        heading: "Payments Dashboard",
        body: "Access the Payments page from the sidebar to see all releases with their payment status in one view. The page shows three summary cards (Outstanding, Earned, Total) and a table of all releases with fee details. Click any release to expand and see per-track fee breakdowns. The page is print-friendly for generating payment summaries.",
        tip: "Click the Outstanding or Earned stat cards on the dashboard to quickly filter to releases matching that payment status.",
        mockup: "payment-track-fees",
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
      "How to upload audio, manage versions, and use the waveform player.",
    tags: ["upload", "tracks", "audio", "versions", "waveform"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Uploading Audio",
        body: "Open any track and go to the Audio tab. Click \"Upload audio\" and select a file, or drag and drop directly. Supported formats: WAV, AIFF, FLAC, MP3, AAC, and M4A, up to 500 MB per file. The file is uploaded to secure cloud storage, and a waveform visualization is generated automatically. File metadata (sample rate, bit depth, duration, format) is captured and displayed.",
        mockup: "audio-upload",
      },
      {
        heading: "Track Versions",
        body: "Each time you upload a new file to the same track, it becomes the latest version. Previous versions are preserved and accessible from the version dropdown above the waveform. Each version shows its version number, upload date, and uploader. You can delete old versions if needed.",
        tip: "Upload revised mixes to the same track rather than creating a new track. This keeps your version history clean and lets you compare mixes over time.",
        mockup: "track-versions",
      },
      {
        heading: "Waveform Player",
        body: "Every uploaded version displays an interactive waveform. Click anywhere to seek, drag to scrub, and use the play/pause button to control playback. The player also shows LUFS loudness measurements, color-coded against loudness targets, so you can evaluate levels at a glance.",
        mockup: "waveform-player",
      },
    ],
  },
  {
    id: "audio-converter",
    title: "Delivery Formats and Conversion",
    category: "audio",
    summary:
      "Set up delivery formats in the Specs tab and convert audio to the formats your project needs.",
    tags: ["convert", "export", "format", "delivery", "wav", "mp3", "flac", "aiff", "specs"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Setting Delivery Formats",
        body: "Open any track and go to the Specs tab. In the Delivery section, select the formats your project needs. Available convertible formats: WAV, AIFF, FLAC, MP3, AAC, OGG, and ALAC. Additional non-convertible formats (DDP, ADM BWF/Atmos, MQA) can be tagged for reference. You can also type a custom format name if your project requires something specific. Use the \"Export from\" dropdown to choose which audio version to convert from.",
        mockup: "format-convert",
      },
      {
        heading: "Converting and Downloading",
        body: "Once delivery formats are selected, click the download icon next to any format to start a conversion. The conversion runs in the background, and the icon shows a spinner while processing. When complete, the converted file downloads automatically. You will also receive an in-app notification when the conversion finishes.",
        tip: "For distribution, most platforms accept 16-bit/44.1kHz WAV or FLAC. Check your distributor's requirements before converting.",
        mockup: "export-download",
      },
      {
        heading: "Supported Formats",
        body: "Convertible: WAV, AIFF, FLAC, MP3, AAC, OGG, ALAC. Non-convertible (tag only): DDP, ADM BWF (Atmos), MQA. The converter works from the original uploaded file to preserve audio quality. You can set sample rate and bit depth overrides per track in the Specs tab.",
        warning: "Converting from a lossy format (MP3, AAC, OGG) to a lossless format (WAV, FLAC) does not improve audio quality. The original compression artifacts remain.",
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
        body: "Open a track and go to the Audio tab. While playing or paused, click on the waveform at the point you want to reference, then type your comment in the text field below and click \"Post\". The comment is anchored to that timecode. Collaborators can click the timestamp to jump directly to that moment in the audio. Comments are tied to the specific audio version you are viewing.",
        mockup: "comment-waveform",
      },
      {
        heading: "Portal Comments",
        body: "Client portal users can also leave timestamped comments on the waveform. Their comments appear alongside team comments but are visually distinguished with a \"Client\" badge so you can tell internal from external feedback at a glance.",
        mockup: "portal-comments",
      },
      {
        heading: "Notes vs Audio Comments",
        body: "The Audio tab is for timestamped feedback tied to specific moments in the waveform. The Notes tab is for general discussion and revision notes that are not tied to a timecode. Use audio comments for specific, actionable feedback like \"bring up the vocals here\" and notes for broader direction like \"overall the mix needs more low end.\"",
        tip: "For a complete overview of a track's creative direction, use the Intent tab to document the mix vision, emotional tags, and reference tracks.",
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
        body: "On the dashboard, click the timeline toggle in the header to switch from grid view to timeline view. The timeline displays your releases chronologically based on their target release dates. Releases without a target date appear in a separate \"Unscheduled\" section. Your view preference is saved automatically.",
        mockup: "timeline-full",
      },
      {
        heading: "Reading the Timeline",
        body: "Each release appears as a card positioned by its target release date. The timeline shows a countdown: \"X days until release\" for upcoming dates or \"Released X days ago\" for past dates. Release cards are color-coded by status (Draft, In Progress, Ready) and pinned releases appear at the top.",
        mockup: "timeline-navigate",
      },
      {
        heading: "Setting Target Dates",
        body: "To add a release to the timeline, set a target release date in the release settings or when creating the release. The timeline updates automatically as you adjust dates. This helps you visualize your schedule and avoid overlapping release windows.",
        tip: "Use the timeline during planning to space out your releases. Having clear visibility of upcoming deadlines helps prevent bottlenecks in your mastering or distribution workflow.",
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
        body: "The data export is a ZIP file containing all your release metadata, track details, audio files, and payment records. Before downloading, the app shows an estimate of the export size along with counts: number of releases, tracks, and audio files included.",
        mockup: "export-contents",
      },
      {
        heading: "Starting an Export",
        body: "Go to Settings and scroll to the \"Your Data\" section. Click \"Export My Data\" to begin. A progress bar shows the download status. For large accounts with many audio files, the export may take a while. The ZIP file downloads to your browser automatically when complete.",
        mockup: "export-progress",
      },
      {
        heading: "Data Privacy",
        body: "Your export contains only data you own or have created. Collaborator contributions (like comments on your releases) are included, but other users' private data is not. The export is generated on-demand and is not stored on our servers.",
        tip: "Run a data export periodically as a backup of your projects and audio files.",
        mockup: "export-privacy",
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
      "View your plan, update payment details, and manage your Pro subscription.",
    tags: ["subscription", "pro", "billing", "payment", "plan"],
    updatedAt: "2026-03-04",
    content: [
      {
        heading: "Viewing Your Plan",
        body: "Go to Settings and scroll to the Subscription section. You will see your current plan (Free or Pro) with a badge, your billing details, and links to manage your subscription. Pro users see a \"Manage Billing\" button that opens the Stripe billing portal.",
        mockup: "plan-current",
      },
      {
        heading: "Upgrading to Pro",
        body: "Click \"Upgrade to Pro\" from the Settings page. You will be taken to a secure Stripe checkout page. Once payment is confirmed, your account is upgraded immediately and you gain access to all Pro features, including unlimited releases.",
        mockup: "upgrade-pro",
      },
      {
        heading: "Managing Payment",
        body: "Click \"Manage Billing\" to open the Stripe billing portal. From there you can update your payment method, view invoices, and change your billing cycle. All payment processing is handled securely by Stripe.",
        tip: "Annual billing saves 20% compared to monthly. You can switch at any time from the Stripe portal.",
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
        body: "Click \"Manage Billing\" in Settings to open the Stripe portal, then click \"Cancel plan\". Your Pro access continues until the end of your current billing period. A notice in Settings will show when your Pro plan expires.",
        mockup: "cancel-subscription",
      },
      {
        heading: "What Happens to Your Data",
        body: "All your releases, tracks, and data are preserved. You do not lose anything when downgrading. However, Pro features (like unlimited releases and audio conversion) will become unavailable until you resubscribe.",
        warning: "Free accounts are limited to one release. If you have more than one release when your Pro plan expires, you will not be able to create new releases until you resubscribe.",
        mockup: "data-after-cancel",
      },
      {
        heading: "Resubscribing",
        body: "To reactivate Pro, click \"Upgrade to Pro\" again from Settings, or use \"Manage Billing\" to resubscribe through the Stripe portal. Your previous data and settings are intact.",
        mockup: "resubscribe",
      },
    ],
  },
];
