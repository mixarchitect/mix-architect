import type { HelpArticle } from "./types";

const CATEGORY_LABELS: Record<string, string> = {
  "getting-started": "Getting Started",
  releases: "Releases",
  audio: "Audio",
  tasks: "Tasks",
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
    updatedAt: "2026-02-15",
    content: [
      {
        heading: "Your Dashboard",
        body: "After signing in you land on the dashboard. It shows all your releases sorted by most recent activity, along with key stats like total tracks, active collaborators, and pending tasks. Each release card shows its cover art, status badge, and track count.",
      },
      {
        heading: "Navigating the App",
        body: "The sidebar (or bottom bar on mobile) gives you quick access to the Dashboard, Templates, Payments, Settings, and Help. Click any release card to open the release detail view where you manage tracks, tasks, the brief, and collaborator access.",
        tip: "Use the Search shortcut (click the magnifying glass or press Cmd+K) to jump to any release or track instantly.",
      },
      {
        heading: "Key Concepts",
        body: "Releases are your top-level projects. Each release contains one or more tracks, a brief document, a task board, and a collaborator list. Tracks hold audio versions, comments, and export settings. Everything is organized around this release-first structure so your team always has full context.",
        workflow: [
          { label: "Dashboard", icon: "LayoutDashboard" },
          { label: "Releases", icon: "Disc3" },
          { label: "Tracks", icon: "Music" },
          { label: "Collaborate", icon: "Users" },
        ],
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
    updatedAt: "2026-02-15",
    content: [
      {
        heading: "Create a New Release",
        body: "From the dashboard, click the \"New Release\" button in the top right. Enter a title for your release. You can also set optional metadata like artist name, label, genre, and target release date. Click \"Create\" to generate your release.",
        workflow: [
          { label: "Create", icon: "Disc3" },
          { label: "Upload Art", icon: "Image" },
          { label: "Add Tracks", icon: "Music" },
          { label: "Set Status", icon: "CheckCircle2" },
        ],
      },
      {
        heading: "Add Cover Art",
        body: "In the release detail view, the sidebar shows a cover art placeholder. Click it to upload an image. Supported formats are JPEG and PNG, minimum 1400x1400 pixels for distribution compatibility. The image is stored securely and displayed across all views.",
      },
      {
        heading: "Upload Your First Track",
        body: "Navigate to the track list in your release and click \"Add Track\". Drag and drop an audio file or click to browse. Supported formats include WAV, AIFF, FLAC, and MP3. The track will be processed and a waveform visualization will appear once the upload completes.",
        tip: "You can upload multiple tracks at once by selecting several files in the file picker.",
      },
      {
        heading: "Set Release Status",
        body: "Each release has a status: Draft, In Progress, Review, or Complete. Update the status from the toolbar at the top of the release page. Status changes are visible to all collaborators and appear in the timeline view.",
      },
    ],
  },
  {
    id: "invite-collaborators",
    title: "Inviting Collaborators to a Release",
    category: "getting-started",
    summary:
      "Share your release with mix engineers, producers, artists, and label contacts.",
    tags: ["collaborators", "invite", "share", "team", "permissions"],
    updatedAt: "2026-02-15",
    content: [
      {
        heading: "Sending Invitations",
        body: "Open a release and click the \"Collaborators\" section. Enter the email address of the person you want to invite and select their role (e.g., Artist, Engineer, Producer, Label). Click \"Invite\" to send them an email with a link to join the release.",
        workflow: [
          { label: "Invite", icon: "Send" },
          { label: "Accept", icon: "UserPlus" },
          { label: "Collaborate", icon: "Users" },
          { label: "Review", icon: "Eye" },
        ],
      },
      {
        heading: "Collaborator Roles",
        body: "Roles help organize who does what, but all collaborators have access to the same release content: tracks, tasks, comments, and the brief. The role is displayed next to each collaborator's name for clarity.",
      },
      {
        heading: "Accepting Invitations",
        body: "When someone accepts their invitation, they will appear in the collaborator list with their role badge. You will receive a notification in-app letting you know they have joined.",
        tip: "Collaborators who do not have a Mix Architect account will be prompted to create one when they click the invite link.",
      },
      {
        heading: "Client Portal Sharing",
        body: "For external stakeholders who only need to review a release (not collaborate on it), use the Portal share link instead. This gives them read-only access to the brief, track list, and comments without requiring an account.",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────
     AUDIO
     ────────────────────────────────────────────────────── */
  {
    id: "upload-audio-tracks",
    title: "Uploading and Managing Audio Tracks",
    category: "audio",
    summary:
      "How to upload, version, and organize audio tracks within a release.",
    tags: ["upload", "tracks", "audio", "versions", "waveform"],
    updatedAt: "2026-02-15",
    content: [
      {
        heading: "Uploading Audio",
        body: "Inside any release, click \"Add Track\" to upload audio files. Supported formats: WAV, AIFF, FLAC, and MP3. Files are uploaded to secure cloud storage and processed to generate a waveform visualization. Large files (up to 500 MB) are supported.",
        workflow: [
          { label: "Upload", icon: "Upload" },
          { label: "Process", icon: "Settings" },
          { label: "Waveform", icon: "AudioWaveform" },
          { label: "Version", icon: "GitBranch" },
        ],
      },
      {
        heading: "Track Versions",
        body: "Each track supports multiple versions. When you upload a new file to an existing track, it becomes the latest version. Previous versions are preserved and accessible from the version dropdown. This lets you compare mixes over time without losing any work.",
        tip: "Version numbers auto-increment. Upload your revised mix to the same track rather than creating a new track to keep your version history clean.",
      },
      {
        heading: "Waveform Player",
        body: "Every uploaded track displays an interactive waveform. Click anywhere on the waveform to seek, drag to scrub, and use the play/pause button to control playback. The waveform also shows LUFS loudness measurements so you can evaluate levels at a glance.",
      },
    ],
  },
  {
    id: "audio-converter",
    title: "Converting Audio Formats",
    category: "audio",
    summary:
      "Use the built-in audio converter to export tracks in different formats and sample rates.",
    tags: ["convert", "export", "format", "wav", "mp3", "flac", "aiff"],
    updatedAt: "2026-02-15",
    content: [
      {
        heading: "Starting a Conversion",
        body: "Open any track and navigate to the Export tab. Select your target format (WAV, AIFF, FLAC, or MP3), sample rate, and bit depth. Click \"Convert\" to start the job. Conversions run in the background so you can continue working.",
        workflow: [
          { label: "Select Format", icon: "Settings" },
          { label: "Convert", icon: "RefreshCw" },
          { label: "Download", icon: "Download" },
        ],
      },
      {
        heading: "Download Your Export",
        body: "When the conversion finishes, you will receive an in-app notification. Navigate back to the Export tab to download the converted file. The download link remains available until you start a new conversion for the same track.",
        tip: "For distribution, most platforms accept 16-bit/44.1kHz WAV or FLAC. Check your distributor's requirements before converting.",
      },
      {
        heading: "Supported Formats",
        body: "Input: WAV, AIFF, FLAC, MP3. Output: WAV (16/24/32-bit, 44.1-192kHz), AIFF (16/24-bit), FLAC (16/24-bit), MP3 (128-320kbps). The converter preserves audio quality by working from the original uploaded file, not a compressed intermediate.",
        warning: "Converting from MP3 to WAV does not improve audio quality. The conversion is lossless in format only; the original MP3 compression artifacts remain.",
      },
    ],
  },
  {
    id: "audio-review-comments",
    title: "Leaving Timestamped Comments on a Mix",
    category: "audio",
    summary:
      "Add time-coded feedback directly on the waveform so collaborators know exactly where to listen.",
    tags: ["comments", "feedback", "review", "timestamp", "waveform"],
    updatedAt: "2026-02-15",
    content: [
      {
        heading: "Adding a Comment",
        body: "While playing or paused, click on the waveform at the point you want to reference, then type your comment in the text field below. The comment is anchored to that timecode. Collaborators can click the timestamp to jump directly to that moment in the track.",
        workflow: [
          { label: "Play", icon: "Play" },
          { label: "Click", icon: "MousePointerClick" },
          { label: "Comment", icon: "MessageSquare" },
          { label: "Resolve", icon: "CheckCircle2" },
        ],
      },
      {
        heading: "Portal Comments",
        body: "External reviewers using the client portal can also leave timestamped comments. Their comments appear alongside team comments but are visually distinguished so you can tell internal from external feedback at a glance.",
      },
      {
        heading: "Resolving Feedback",
        body: "As you address feedback, you can resolve individual comments. Resolved comments are dimmed but still visible for reference. This helps the team track what has been addressed and what still needs attention.",
        tip: "Use comments for specific, actionable feedback. For general notes about the release, use the Brief document instead.",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────
     TASKS
     ────────────────────────────────────────────────────── */
  {
    id: "create-release-tasks",
    title: "Creating and Assigning Tasks",
    category: "tasks",
    summary:
      "Keep your release on track with tasks you can assign to any collaborator.",
    tags: ["tasks", "assign", "todo", "checklist", "workflow"],
    updatedAt: "2026-02-15",
    content: [
      {
        heading: "Creating a Task",
        body: "Open a release and navigate to the Tasks tab. Click \"Add Task\" and enter a title. You can optionally add a description, set a due date, and assign the task to a specific collaborator. Tasks appear in a list view ordered by status and due date.",
        workflow: [
          { label: "Add Task", icon: "ClipboardList" },
          { label: "Assign", icon: "UserCheck" },
          { label: "Track", icon: "BarChart3" },
          { label: "Complete", icon: "CheckCircle2" },
        ],
      },
      {
        heading: "Assigning Tasks",
        body: "Click the assignee field on any task to pick from the list of release collaborators. The assigned person will see the task in their view and receive relevant notifications when the task is updated.",
      },
      {
        heading: "Task Templates",
        body: "When you create a release from a template, any tasks defined in the template are automatically created. This is useful for standard workflows like mastering checklists, approval chains, or distribution prep steps.",
        tip: "Build a template with your most common tasks so every new release starts with a ready-made checklist.",
      },
    ],
  },
  {
    id: "task-statuses",
    title: "Understanding Task Statuses",
    category: "tasks",
    summary:
      "How task statuses work and how to move tasks through your workflow.",
    tags: ["tasks", "status", "workflow", "progress", "done"],
    updatedAt: "2026-02-15",
    content: [
      {
        heading: "Available Statuses",
        body: "Each task has one of three statuses: To Do (not started), In Progress (actively being worked on), and Done (complete). Update the status by clicking the status badge on the task card.",
        workflow: [
          { label: "To Do", icon: "ClipboardList" },
          { label: "In Progress", icon: "RefreshCw" },
          { label: "Done", icon: "CheckCircle2" },
        ],
      },
      {
        heading: "Tracking Progress",
        body: "The release detail view shows a progress bar indicating what percentage of tasks are complete. This gives you a quick visual indicator of how close the release is to being finished without opening the Tasks tab.",
      },
      {
        heading: "Filtering and Sorting",
        body: "Use the filter controls at the top of the task list to show only tasks with a specific status or assigned to a specific person. This helps you focus on what needs your attention right now.",
        tip: "Filter to \"My Tasks\" + \"To Do\" for a quick view of your outstanding work across a release.",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────
     TIMELINE
     ────────────────────────────────────────────────────── */
  {
    id: "timeline-overview",
    title: "Using the Multi-Release Timeline View",
    category: "timeline",
    summary:
      "Visualize all your releases on a single timeline to manage schedules and avoid conflicts.",
    tags: ["timeline", "schedule", "calendar", "gantt", "planning"],
    updatedAt: "2026-02-15",
    content: [
      {
        heading: "Opening the Timeline",
        body: "The Timeline view is available from the release detail page. It displays all your active releases as horizontal bars on a scrollable calendar. Each bar spans from the release creation date to the target release date, color-coded by status.",
        workflow: [
          { label: "Create", icon: "Disc3" },
          { label: "Set Dates", icon: "Calendar" },
          { label: "View", icon: "Eye" },
          { label: "Track", icon: "BarChart3" },
        ],
      },
      {
        heading: "Navigating the Timeline",
        body: "Scroll horizontally to move through time. The \"Today\" line is highlighted so you can see where you are relative to your deadlines. Click any release bar to jump to that release's detail page.",
      },
      {
        heading: "Adjusting Dates",
        body: "To change a release's schedule, update the target release date from the release settings. The timeline updates automatically. This makes it easy to spot overlapping releases or tight turnarounds.",
        tip: "Use the timeline during planning to space out your releases and avoid bottlenecks in your mastering or distribution workflow.",
      },
    ],
  },
  {
    id: "timeline-milestones",
    title: "Setting Release Milestones",
    category: "timeline",
    summary:
      "Mark key dates like mix delivery, mastering, and distribution deadlines on your timeline.",
    tags: ["milestones", "deadlines", "dates", "timeline", "planning"],
    updatedAt: "2026-02-15",
    content: [
      {
        heading: "What Are Milestones",
        body: "Milestones are key dates within a release's lifecycle. Common examples include mix delivery, mastering deadline, artwork due, and distribution submission date. They appear as markers on the timeline bar for that release.",
      },
      {
        heading: "Adding Milestones",
        body: "Open the release settings and scroll to the Milestones section. Click \"Add Milestone\", enter a name and date, then save. The milestone appears on the timeline and is visible to all collaborators.",
        workflow: [
          { label: "Add", icon: "MapPin" },
          { label: "Set Date", icon: "Calendar" },
          { label: "Remind", icon: "Bell" },
        ],
      },
      {
        heading: "Milestone Notifications",
        body: "You can set reminders for milestones. When a milestone date approaches, collaborators receive a notification so nothing slips through the cracks.",
        warning: "Milestones are informational markers. They do not block any actions. If a milestone date passes, the release continues as normal.",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────
     RELEASES
     ────────────────────────────────────────────────────── */
  {
    id: "templates",
    title: "Using Release Templates",
    category: "releases",
    summary:
      "Save time by creating releases from reusable templates with pre-configured settings and tasks.",
    tags: ["templates", "reuse", "workflow", "presets"],
    updatedAt: "2026-02-15",
    content: [
      {
        heading: "What Templates Include",
        body: "A template captures a release's mix defaults (format, sample rate, bit depth), default elements (like instrument stems or reference tracks), and a set of pre-built tasks. When you create a release from a template, all of these are copied into the new release.",
      },
      {
        heading: "Creating a Template",
        body: "Navigate to the Templates page from the sidebar. Click \"New Template\" and fill in the defaults you want to reuse: audio format, sample rate, bit depth, default elements, and tasks. Give the template a descriptive name so you can find it later.",
        workflow: [
          { label: "Create", icon: "LayoutTemplate" },
          { label: "Configure", icon: "Wrench" },
          { label: "Use", icon: "Disc3" },
        ],
      },
      {
        heading: "Using a Template",
        body: "When creating a new release, select a template from the dropdown. The release will be pre-populated with the template's settings and tasks. You can then customize anything for that specific release.",
        tip: "Create templates for your most common project types: singles, EPs, albums, podcast episodes, etc. This ensures consistency and saves setup time.",
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
      "Download a complete export of your releases, tracks, tasks, and account data.",
    tags: ["export", "data", "download", "backup", "privacy"],
    updatedAt: "2026-02-15",
    content: [
      {
        heading: "What's Included",
        body: "The data export includes your profile information, all releases and their metadata, track details (names, versions, notes), tasks, collaborator lists, and comments. Audio files are not included in the export; they can be downloaded individually from each track.",
      },
      {
        heading: "Starting an Export",
        body: "Go to Settings and scroll to the \"Your Data\" section. Click \"Export All Data\". The export is generated as a JSON file and downloaded to your browser automatically. For large accounts this may take a few seconds.",
        workflow: [
          { label: "Settings", icon: "Settings" },
          { label: "Export", icon: "FileDown" },
          { label: "Download", icon: "Download" },
        ],
      },
      {
        heading: "Data Privacy",
        body: "Your export contains only data you own or have created. Collaborator comments on your releases are included, but other users' private data is not. The export is generated on-demand and is not stored on our servers.",
        tip: "Run a data export periodically as a lightweight backup of your project metadata.",
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
    updatedAt: "2026-02-15",
    content: [
      {
        heading: "Viewing Your Plan",
        body: "Go to Settings and scroll to the Subscription section. You will see your current plan (Free or Pro), billing cycle, and next payment date. Pro users also see a link to manage their subscription through the Stripe billing portal.",
      },
      {
        heading: "Upgrading to Pro",
        body: "Click \"Upgrade to Pro\" from the Settings page or from any feature that requires Pro access. You will be taken to a secure Stripe checkout page. Once payment is confirmed, your account is upgraded immediately and you gain access to all Pro features.",
        workflow: [
          { label: "View Plan", icon: "Eye" },
          { label: "Upgrade", icon: "ArrowUpCircle" },
          { label: "Manage", icon: "Receipt" },
        ],
      },
      {
        heading: "Managing Payment",
        body: "Click \"Manage Subscription\" to open the Stripe billing portal. From there you can update your payment method, view invoices, and change your billing cycle. All payment processing is handled securely by Stripe.",
        tip: "Annual billing saves 20% compared to monthly. You can switch at any time from the Stripe portal.",
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
    updatedAt: "2026-02-15",
    content: [
      {
        heading: "Cancelling Your Subscription",
        body: "Click \"Manage Subscription\" in Settings to open the Stripe portal, then click \"Cancel plan\". Your Pro access continues until the end of your current billing period. After that, your account reverts to the Free plan.",
        workflow: [
          { label: "Cancel", icon: "XCircle" },
          { label: "Use Until End", icon: "Clock" },
          { label: "Resubscribe", icon: "RefreshCw" },
        ],
      },
      {
        heading: "What Happens to Your Data",
        body: "All your releases, tracks, and data are preserved. You do not lose anything when downgrading. However, some Pro features (like audio conversion and advanced export options) will become unavailable until you resubscribe.",
        warning: "If you are over the Free plan's release limit, you will not be able to create new releases until you are under the limit or resubscribe to Pro.",
      },
      {
        heading: "Resubscribing",
        body: "To reactivate Pro, simply click \"Upgrade to Pro\" again from Settings. Your previous data and settings are intact. If you resubscribe within the same billing cycle, you will not be charged twice.",
      },
    ],
  },
];
