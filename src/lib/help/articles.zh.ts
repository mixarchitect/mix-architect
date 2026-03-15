import type { HelpArticle } from "./types";

export const articles: HelpArticle[] = [
  {
    "id": "getting-started-overview",
    "title": "欢迎使用 Mix Architect",
    "category": "getting-started",
    "summary": "平台快速导览：您的仪表盘、发行、曲目和协作工具。",
    "tags": [
      "overview",
      "intro",
      "dashboard",
      "getting started"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "您的仪表盘",
        "body": "登录后，您将进入[仪表盘](/app)。它以响应式网格显示所有发行，按最近活动排序。每张发行卡片显示封面图、标题、艺人名称、状态圆点（草稿、进行中或就绪分别对应不同颜色）、发行类型标签（Single、EP 或 Album）、格式标签（Stereo、Dolby Atmos 或 Stereo + Atmos）以及曲目完成计数，如\"已简报 1/6 首曲目\"。如果启用了[付款跟踪](/app/settings)，顶部还会显示付款汇总统计：所有发行的未付款、已收款和总费用，并附有前往[付款](/app/payments)页面的\"查看全部\"链接。使用任意发行卡片上的固定图标将其置顶到仪表盘顶部，使用三点菜单进行快捷操作。排序下拉菜单可按最近修改、标题或创建日期排列发行。",
        "mockup": "dashboard"
      },
      {
        "heading": "网格视图与时间线视图",
        "body": "仪表盘顶部有两个视图切换按钮：网格和时间线。网格视图（默认）以响应式网格形式将发行显示为卡片。时间线视图根据目标发行日期按时间顺序排列发行，显示倒计时和排期信息。您的视图偏好会自动保存。了解更多请参阅[使用时间线视图](/app/help?article=timeline-overview)。"
      },
      {
        "heading": "应用导航",
        "body": "侧边栏（桌面端）或底部导航栏（移动端）让您快速访问应用的各个部分：[仪表盘](/app)查看您的发行，搜索（或 Cmd+K / Ctrl+K）可即时跳转到任何发行或曲目，[模板](/app/templates)用于可复用的发行预设，[付款](/app/payments)用于费用跟踪（如已启用），[设置](/app/settings)用于您的个人资料、默认值和订阅，[帮助](/app/help)用于查阅文档。侧边栏还包括通知（活动更新）、Auto（自动化功能）和退出登录。在[设置](/app/settings)的外观部分，可以在浅色、深色和跟随系统模式之间切换主题。",
        "tip": "在应用的任何位置按 Cmd+K（Mac）或 Ctrl+K（Windows）即可即时搜索并跳转到任何发行或曲目。",
        "mockup": "nav-rail"
      },
      {
        "heading": "核心概念",
        "body": "发行是您的顶层项目（Album、EP 或 Single）。每个发行包含一个或多个曲目。在桌面端，发行详情页采用两栏布局：左侧为曲目列表，右侧为检查器侧边栏，显示封面图、发行信息（艺人、类型、格式、状态、目标日期、风格）、全局混音方向、全局参考曲目和付款状态。每个曲目有六个选项卡：意图、规格、音频、分发、门户和备注。点击发行标题区的设置齿轮图标可打开发行设置，您可以编辑所有元数据、管理团队和配置付款。标题区还有门户开关按钮（附带打开门户的链接）、另存为模板按钮和设置齿轮。",
        "mockup": "key-concepts"
      }
    ]
  },
  {
    "id": "create-first-release",
    "title": "创建您的第一个发行",
    "category": "getting-started",
    "summary": "分步指南：创建发行、添加封面图、上传曲目和设置状态。",
    "tags": [
      "create",
      "release",
      "new project",
      "setup"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "创建新发行",
        "body": "在[仪表盘](/app)中，点击右上角的\"+ 新建发行\"按钮。如果您已保存[模板](/app/templates)，会先显示模板选择器，您可以选择一个模板或点击\"从零开始\"。创建表单要求输入标题、可选的艺人/客户名称、发行类型（Single、EP 或 Album）、格式（Stereo、Dolby Atmos 或 Stereo + Atmos）、风格标签（从推荐中选择如 Rock、Pop、Hip-Hop、Electronic 等，或添加自定义标签）以及目标发行日期。",
        "tip": "当您创建 Single 时，系统会自动创建一个以发行标题命名的曲目，并应用您在[设置](/app/settings)中的默认规格。",
        "mockup": "create-release"
      },
      {
        "heading": "发行详情页",
        "body": "创建后，您将进入发行详情页。在桌面端，这是一个两栏布局：左侧为曲目列表，带有\"Flow\"按钮和\"+ 添加曲目\"按钮；右侧为检查器侧边栏。检查器侧边栏显示封面图、发行信息（艺人、类型、格式、状态、目标日期、风格）、全局混音方向（点击铅笔图标更新）和全局参考曲目（点击\"+ 添加\"搜索并添加参考曲目）。如果启用了付款跟踪，付款部分会显示在侧边栏底部。要添加或更换封面图，请点击侧边栏中封面图上的铅笔图标。这会在图片下方显示选项：上传按钮用于选择文件，移除按钮（如已有封面图）和\"或粘贴 URL\"字段用于直接链接图片。新发行会显示带有\"点击上传\"提示的虚线上传区域（JPEG 或 PNG，最小 1400x1400）。要编辑其他发行元数据，请点击标题区的设置齿轮图标以打开发行设置。",
        "mockup": "cover-art-upload"
      },
      {
        "heading": "添加曲目",
        "body": "在发行详情视图中，点击标题区 Flow 按钮旁边的\"+ 添加曲目\"。为曲目输入标题，系统会自动应用您在[设置](/app/settings)中的默认规格。每个曲目在列表中显示编号、标题、意图预览、状态圆点和审批徽章。您可以使用左侧的拖拽手柄拖动曲目重新排序，或使用上移/下移按钮。使用右侧的垃圾桶图标删除曲目。点击任何曲目打开它，开始在其六个选项卡中工作。",
        "mockup": "track-upload"
      },
      {
        "heading": "设置发行状态",
        "body": "每个发行有三种状态：草稿、进行中或就绪。您可以在检查器侧边栏中点击发行信息部分\"状态\"旁边的状态徽章来更改状态，也可以在发行设置（齿轮图标）中更改。当开始处理发行时（例如上传音频或添加曲目），发行会自动变为进行中。状态徽章的颜色会显示在[仪表盘](/app)的发行卡片上（橙色为草稿，蓝色为进行中，绿色为就绪），对所有协作者和客户门户可见。",
        "mockup": "release-status"
      }
    ]
  },
  {
    "id": "invite-collaborators",
    "title": "邀请协作者加入发行",
    "category": "getting-started",
    "summary": "通过角色分配和门户功能，与团队成员和外部客户共享您的发行。",
    "tags": [
      "collaborators",
      "invite",
      "share",
      "team",
      "permissions"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "发送邀请",
        "body": "打开一个发行，点击标题区的设置齿轮图标进入发行设置。向下滚动到发行元数据下方的团队部分。输入您要邀请的人的电子邮件地址，从下拉菜单中选择角色（协作者或客户），然后点击\"邀请\"。对方会收到一封包含加入发行链接的电子邮件。活跃的团队成员显示在邀请表单下方，包含其电子邮件、角色徽章、状态和删除按钮。",
        "mockup": "invite-collaborator"
      },
      {
        "heading": "协作者与客户角色",
        "body": "共有两种角色。协作者拥有查看和编辑所有发行内容的完全权限：曲目、意图、规格、音频、备注、分发元数据和发行设置。客户通过客户门户拥有只读权限，可以通过评论提供反馈、对单个曲目批准或请求修改，以及在允许的情况下下载音频文件。角色徽章显示在团队部分每位成员的电子邮件旁边。",
        "mockup": "collaborator-roles"
      },
      {
        "heading": "接受邀请",
        "body": "当被邀请者点击邀请链接并加入发行后，他们会出现在团队列表中，显示角色徽章和\"活跃\"状态。您会收到应用内通知，告知他们已加入。没有 Mix Architect 账户的受邀者在点击邀请链接时会被提示创建账户。",
        "tip": "您可以随时点击发行设置中团队部分中成员名称旁边的垃圾桶图标来移除团队成员。",
        "mockup": "accept-invitation"
      },
      {
        "heading": "客户门户分享",
        "body": "对于需要审阅但无需登录的外部相关方，请在发行详情页标题区激活客户门户。点击门户开关将其打开（激活时变为绿色），然后使用开关旁的链接图标复制唯一的分享 URL。门户提供对发行简报、曲目列表、音频播放和评论系统的只读访问。您可以使用门户设置精确配置客户可见的内容：混音方向、规格、参考曲目、付款状态、分发信息和歌词。如需按曲目控制，请使用每个曲目的门户选项卡。",
        "mockup": "portal-sharing"
      }
    ]
  },
  {
    "id": "track-tabs",
    "title": "曲目详情：了解选项卡",
    "category": "releases",
    "summary": "每个曲目有六个选项卡，用于管理混音的各个方面：意图、规格、音频、分发、门户和备注。",
    "tags": [
      "tracks",
      "tabs",
      "intent",
      "specs",
      "audio",
      "distribution",
      "portal",
      "notes"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "意图",
        "body": "意图选项卡用于描述曲目的创意愿景。顶部是一个自由文本区域，标题为\"这首曲目应该是什么感觉？\"，您可以在此输入混音方向（点击\"编辑\"修改）。下方的情感特质部分允许您用描述性词语标记曲目：已选标签显示为填充色药丸（如 spacious、warm、punchy、nostalgic），可用建议显示为轮廓药丸，点击即可添加（aggressive、intimate、gritty、polished、dark、bright、raw、lush、dreamy、lo-fi、cinematic、minimal、dense、ethereal、hypnotic、euphoric、melancholic、organic、synthetic、chaotic、smooth、haunting、playful、anthemic、delicate、heavy、airy）。底部的反面参考部分允许您描述要避免的声音或方法。右侧边栏中，快速查看显示曲目状态、音频质量（采样率/位深度）和格式。下方的参考曲目部分允许您搜索并添加参考曲目（来自 Apple Music），并可附加备注说明要参考的内容。",
        "mockup": "track-tab-intent"
      },
      {
        "heading": "规格",
        "body": "规格选项卡包含曲目的技术规格。技术设置部分有三个下拉菜单：格式（Stereo、Dolby Atmos 或 Stereo + Atmos）、采样率（44.1kHz、48kHz、88.2kHz、96kHz）和位深度（16-bit、24-bit、32-bit float）。这些值是描述源音频的参考元数据，用作从模板创建新曲目时的默认值；它们不用于控制转换输出。下方的交付部分管理您的输出格式。点击格式芯片选择可用格式：可转换格式包括 WAV、AIFF、FLAC、MP3、AAC、OGG 和 ALAC。不可转换格式（DDP、ADM BWF/Atmos、MQA）可选择作为参考，但会显示提示信息说明无法自动转换。已选格式以绿色高亮并带有勾选标记。使用\"导出来源\"下拉菜单选择从哪个音频版本转换（例如\"v3 - Typical Wonderful 2025-10-10 MGO.wav (latest)\"）。点击任何已选可转换格式旁的下载箭头图标开始转换。您还可以在\"自定义格式...\"字段中输入自定义格式名称，然后点击\"+ 添加\"。底部的特殊要求文本区域允许您记录交付相关的具体说明。",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "音频",
        "body": "音频选项卡用于上传文件、管理版本和播放音频。标题显示发行名称和曲目名称以及专辑封面。版本选择器（v1、v2、v3 等）可切换不同修订版；点击 + 按钮上传新版本。每个版本显示版本号、上传日期、评论数量和下载按钮。波形可视化显示带有交互式播放的音频：点击任意位置跳转，使用下方的传输控件（循环、后退、播放/暂停、前进、重复）。LUFS 响度测量值显示在文件元数据（格式、采样率、位深度）旁边，根据响度目标进行颜色编码。波形下方的反馈部分显示当前版本的所有时间戳评论。在波形上的任意位置双击可在该时间码添加新评论。评论标记以小图标形式出现在波形的相应位置。",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "响度分析 (LUFS)",
        "body": "上传音频时，Mix Architect 会自动测量 LUFS（满刻度响度单位）积分响度。点击版本元数据旁的 LUFS 读数可展开响度分析面板。面板显示各主要流媒体服务、广播标准和社交平台在播放时将如何调整您的曲目。每行显示平台名称、其目标响度（例如 Spotify 目标为 -14 LUFS）以及将应用于您文件的增益变化。正值表示服务会调高您的曲目；负值（以橙色显示）表示会调低。例如，如果您的混音测量值为 -14.9 LUFS，Spotify 会应用 +0.9 dB，而 Apple Music（目标 -16）会应用 -1.1 dB。面板分组为流媒体（Spotify、Apple Music、YouTube、Tidal、Amazon Music、Deezer、Qobuz、Pandora）、广播（EBU R128、ATSC A/85、ITU-R BS.1770）和社交（Instagram/Reels、TikTok、Facebook）。使用此功能检查您的母带在交付前是否会在任何平台上被显著调整。",
        "mockup": "track-tab-lufs"
      },
      {
        "heading": "分发",
        "body": "分发选项卡捕获数字分发所需的所有元数据。它包含三个分配部分，每个都带有\"+ 添加人员\"按钮：词曲分配（人员名称、百分比、PRO 隶属关系如 ASCAP/BMI、会员账号和词曲作者 IPI 号码）、出版分配（出版商名称、百分比、出版商会员 ID 和出版商 IPI）和录音母带分配（实体名称和百分比）。每个分配部分的累计总数在等于 100% 时显示为绿色，不等于时显示为橙色。分配下方：编码和标识（ISRC 和 ISWC 字段）、制作人员（制作人和词曲作者姓名）、曲目属性（Featured 艺人、语言选择器、显式歌词开关、纯器乐开关和翻唱歌曲开关）、版权（登记号和版权日期）和歌词（完整歌词文本区域）。",
        "mockup": "track-tab-distribution"
      },
      {
        "heading": "门户",
        "body": "门户选项卡控制客户如何与此特定曲目互动。顶部的客户审批部分显示当前审批状态（例如绿色的\"已批准\"），以及所有审批事件的时间戳记录：已批准、已请求修改（附客户的备注）、已重新打开审阅和已重新批准，每个都带有日期。下方的曲目门户可见性部分允许您切换此曲目是否在门户上可见、是否启用下载，以及客户可以访问哪些特定音频版本（版本 1、版本 2、版本 3 等），每个都有独立的开关。底部有一条提示说明门户激活和分享链接可在发行页面标题区找到。",
        "mockup": "track-tab-portal"
      },
      {
        "heading": "备注",
        "body": "备注选项卡是用于修订备注和讨论的通用空间，不与特定时间码绑定。顶部有一个带\"添加备注...\"占位符的文本区域和一个\"发布\"按钮。备注按时间倒序排列在下方。每条备注显示作者姓名、日期或相对时间以及消息内容。客户备注以绿色的\"客户\"徽章加以区分，便于您一眼区分内部反馈和外部反馈。使用此选项卡记录总体修订方向、待办事项和无需引用音频特定时刻的讨论。如需针对特定时间的反馈，请改用音频选项卡的波形评论功能。",
        "mockup": "track-tab-notes"
      }
    ]
  },
  {
    "id": "client-portal",
    "title": "客户门户与审批",
    "category": "releases",
    "summary": "通过唯一链接与客户分享发行，控制他们可以看到的内容，并跟踪逐曲目审批。",
    "tags": [
      "portal",
      "client",
      "approval",
      "sharing",
      "review"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "激活门户",
        "body": "在发行详情页，找到标题区（右上角）的门户开关。点击开关激活（激活时变为绿色）。激活后，点击开关旁的链接图标复制唯一的分享 URL。将此链接发送给您的客户，无需 Mix Architect 账户即可获得审阅权限。门户提供发行简报、曲目列表、音频播放器和评论系统。使用门户设置控制客户可以看到哪些发行级部分：混音方向、规格、参考曲目、付款状态、分发元数据和歌词。",
        "mockup": "portal-settings"
      },
      {
        "heading": "逐曲目可见性",
        "body": "对于每个曲目，前往门户选项卡控制客户可以看到的内容。曲目门户可见性部分有以下开关：\"在门户上可见\"（显示或隐藏整个曲目）、\"启用下载\"（允许或阻止音频下载），以及各版本的独立开关（版本 1、版本 2、版本 3 等）来控制客户可以访问哪些音频修订版。这为您提供了精细控制，让您可以隐藏进行中的作品，仅分享完成的混音。所有开关相互独立，因此您可以让曲目可见但禁用下载，或仅显示最新版本。",
        "mockup": "portal-track-visibility"
      },
      {
        "heading": "曲目审批",
        "body": "客户可以通过门户对单个曲目进行批准或请求修改。审批状态在每个曲目门户选项卡的客户审批部分中进行跟踪。状态显示一个彩色徽章（例如绿色的\"已批准\"），并附有每个审批事件的完整时间戳记录：客户何时批准、何时请求修改（包括其备注，如\"人声太小\"）、曲目何时重新打开审阅以及何时重新批准。这为您提供了所有客户决定的清晰审计追踪。审批徽章也显示在发行详情页的曲目列表中，便于您一眼看到哪些曲目已获批准。",
        "mockup": "portal-approval"
      }
    ]
  },
  {
    "id": "templates",
    "title": "使用发行模板",
    "category": "releases",
    "summary": "通过使用预配置规格和设置的可复用模板来节省时间。",
    "tags": [
      "templates",
      "reuse",
      "workflow",
      "presets"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "模板包含的内容",
        "body": "模板捕获六个可折叠部分的全面发行默认设置。基本信息：模板名称、描述、\"设为默认模板\"复选框（新发行时自动选中）以及艺人/客户名称和电子邮件。发行设置：发行类型（Single、EP 或 Album）、格式（Stereo、Dolby Atmos 或 Stereo + Atmos）和风格标签。技术规格：采样率、位深度、交付格式选项（WAV、AIFF、FLAC、MP3、AAC、OGG、DDP、ADM BWF/Atmos、MQA、ALAC）和特殊要求。意图默认值：新曲目的预选情感特质标签。分发元数据：分发商、唱片厂牌、版权持有人、语言、主要风格以及版权和出版联系人。付款默认值：付款状态、货币和付款备注。当您从模板创建发行时，所有这些默认设置都会自动应用。",
        "mockup": "template-contents"
      },
      {
        "heading": "创建和管理模板",
        "body": "有两种方式创建模板。从任何发行详情页，点击标题区的\"另存为模板\"按钮（设置齿轮旁边）以捕获该发行的当前配置。或者前往[模板](/app/templates)页面，点击\"+ 新建模板\"使用完整模板表单从头构建。[模板](/app/templates)页面上的每张模板卡片显示其名称、描述和摘要行，如\"Single, Stereo + Atmos, 96 kHz / 24-bit, 4 种交付格式\"。使用任何模板卡片上的三点菜单进行编辑或删除等操作。为模板起描述性名称，如\"Stereo Master\"或\"Atmos EP\"，以便管理。",
        "mockup": "template-create"
      },
      {
        "heading": "从模板创建发行",
        "body": "从[仪表盘](/app)创建新发行时，如果您有已保存的模板，第一步会显示\"从模板开始\"选择器。提示文字为\"预填您的发行设置，或从零开始。\"选择一张模板卡片并点击\"使用模板\"以用这些设置预填新发行表单，或点击\"从零开始\"跳过。创建发行表单底部还有一个\"更换模板\"链接，供您切换模板。发行创建后可自定义任何模板设置。",
        "tip": "将您最常用的模板标记为默认（\"设为默认模板\"复选框），这样每次创建新发行时都会自动选中。",
        "mockup": "template-use"
      }
    ]
  },
  {
    "id": "payment-tracking",
    "title": "付款跟踪",
    "category": "releases",
    "summary": "跟踪各发行的费用、付款和未付余额。",
    "tags": [
      "payments",
      "fees",
      "billing",
      "tracking",
      "invoicing"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "启用付款跟踪",
        "body": "前往[设置](/app/settings)，找到付款跟踪部分。该部分说明：\"在发行和曲目上跟踪费用和付款状态。如果您在混音自己的项目，请关闭此功能。\"打开\"启用付款跟踪\"开关。启用后，付款相关功能将出现在整个应用中：[仪表盘](/app)上的费用统计（未付款、已收款、总费用），每个发行检查器侧边栏中的付款部分，以及侧边栏导航中的[付款](/app/payments)页面。",
        "mockup": "payment-dashboard"
      },
      {
        "heading": "设置发行费用",
        "body": "打开发行设置（点击任何发行上的齿轮图标）。向下滚动到付款部分。设置付款状态：无费用、未付款、部分付款或已付款。使用付款备注文本区域记录条款、定金信息或到期日。费用金额和付款信息也可在发行详情页检查器侧边栏的付款标题下查看，您可以点击状态快速更改。",
        "mockup": "payment-release-fees"
      },
      {
        "heading": "付款仪表盘",
        "body": "从侧边栏访问[付款](/app/payments)页面。顶部三张汇总卡片显示所有发行的未付款（未付总额）、已收款（已付总额）和总费用，每项附有发行数量。下方的表格列出每个有付款数据的发行：发行名称、日期、艺人、费用、已付、余额和状态（带彩色徽章如橙色的\"部分付款\"）。底部的合计行汇总所有费用。使用\"导出 CSV\"按钮将付款数据下载为电子表格，或使用\"下载 PDF\"生成可打印的付款摘要。",
        "tip": "点击[仪表盘](/app)上的未付款或已收款统计卡片，可快速筛选匹配该付款状态的发行。",
        "mockup": "payment-track-fees"
      }
    ]
  },
  {
    "id": "distribution-tracker",
    "title": "发行跟踪器",
    "category": "releases",
    "summary": "跟踪您的发行提交到了哪些平台，监控各平台的状态，并在 Spotify 上线时收到通知。",
    "tags": ["distribution", "tracker", "spotify", "apple music", "platform", "status", "live", "submitted"],
    "updatedAt": "2026-03-14",
    "content": [
      {
        "heading": "为发行添加平台",
        "body": "打开任意发行，向下滚动到曲目列表下方的 Distribution Tracker 面板。点击\"+ Add Platform\"添加流媒体平台。可从 Spotify、Apple Music、Tidal、Amazon Music、YouTube Music、Deezer、SoundCloud 或 Bandcamp 中选择。每个平台以一行显示，包含官方 Logo、状态指示器和分发商标签。您也可以使用\"Mark as Submitted\"一次添加多个平台：选择分发商（DistroKid、TuneCore、CD Baby、LANDR、Ditto、AWAL、UnitedMasters、Amuse、RouteNote 或 Self-released），勾选您提交的平台，然后点击 Submit。",
        "mockup": "distribution-add-platform"
      },
      {
        "heading": "状态类型",
        "body": "每个平台条目都有一个状态，用于跟踪发行在流程中的当前位置。六种状态分别是：Not Submitted（灰色，新添加平台的默认状态）、Submitted（蓝色，您已将发行发送给分发商）、Processing（橙色，分发商正在审核或处理中）、Live（绿色，发行已在该平台上线）、Rejected（红色，平台或分发商拒绝了该发行）和 Taken Down（红色，发行之前已上线但已被移除）。点击任意平台行的状态指示器即可更改状态。状态变更会记录在平台历史中，方便您查看每次转换发生的时间。",
        "mockup": "distribution-status"
      },
      {
        "heading": "Spotify 自动检测",
        "body": "Spotify 显示在 Distribution Tracker 的最顶部，带有\"自动更新\"标签。当您将 Spotify 标记为 Submitted 后，Mix Architect 会使用 ISRC 代码（来自曲目的 Distribution 选项卡）或发行标题和艺人名称定期检查 Spotify 目录。当在 Spotify 上找到您的发行时，状态会自动变为 Live，Spotify URL 会被保存，您会收到通知。您也可以点击\"Check Now\"触发即时检查。自动检测每天对所有已提交的 Spotify 条目运行一次。",
        "tip": "提交前请在曲目的 Distribution 选项卡中填写 ISRC 代码。基于 ISRC 的检测比标题/艺人匹配更可靠，尤其是对于常见名称。",
        "mockup": "distribution-spotify"
      },
      {
        "heading": "更新状态和添加链接",
        "body": "要更改平台的状态，请点击平台行上的状态指示器。会出现一行状态药丸供您选择新状态。要添加该平台上发行的链接，请点击平台名称旁的\"Add link\"。输入 URL（例如 Spotify 专辑链接或 Apple Music 页面），然后点击保存。链接图标会变为可点击的外部链接，可打开该平台上的发行页面。使用任意平台行的三点菜单可进行更多操作：编辑详情、移除平台或查看状态变更历史。",
        "mockup": "distribution-edit"
      },
      {
        "heading": "批量提交和刷新",
        "body": "\"Mark as Submitted\"可让您记录向分发商的批量提交。从下拉菜单中选择分发商，勾选您提交的平台，然后点击 Submit。所有选定的平台会以 Submitted 状态和分发商标签添加。\"Check Now\"会显示在已提交的 Spotify 条目上。点击后会触发 Spotify 目录即时搜索。如果找到，状态会更新为 Live，URL 会自动保存。对于所有其他平台（Apple Music、Tidal、Amazon Music、YouTube Music、Deezer、SoundCloud、Bandcamp），请在确认发行已上线后手动更新状态。",
        "mockup": "distribution-bulk"
      },
      {
        "heading": "分发商标签",
        "body": "每个平台条目可以附带一个分发商标签，显示您使用了哪个服务提交（DistroKid、TuneCore、CD Baby 等）。标签以小药丸形式显示在状态指示器旁边。使用\"Mark as Submitted\"时会自动设置分发商标签，您也可以在编辑平台条目时单独设置。这有助于跟踪哪个分发商负责了哪个平台，尤其是当您为不同地区或平台使用不同分发商时。",
        "warning": "分析数据仅反映您在 Mix Architect 中跟踪的数据。如果您通过分发商的仪表盘直接提交，请记得在此处更新状态，以保持跟踪器的准确性。",
        "mockup": "distribution-distributor"
      }
    ]
  },
  {
    "id": "user-analytics",
    "title": "用户分析",
    "category": "releases",
    "summary": "在分析仪表盘中查看已完成的发行数量、平均交付时间、总收入和按客户的明细。",
    "tags": ["analytics", "dashboard", "revenue", "turnaround", "velocity", "clients", "charts"],
    "updatedAt": "2026-03-14",
    "content": [
      {
        "heading": "分析页面概览",
        "body": "从侧边栏访问[分析](/app/analytics)页面。仪表盘顶部显示四张汇总卡片：已完成发行（已完成项目总数及月均值）、平均交付时间（从创建到完成的天数，含最快和最慢的详细分析）、总收入（所有跟踪费用的总和及未付余额）和客户（唯一客户数及总发行数）。汇总卡片下方有三个图表，以时间维度可视化您的数据，还有一个客户明细表显示按客户的统计数据。",
        "mockup": "analytics-overview"
      },
      {
        "heading": "发行速度与交付时间",
        "body": "发行速度图表是一个柱状图，显示在选定日期范围内每月完成的发行数量。柱子越高表示该月产出越多。使用它来发现产出趋势，识别繁忙或空闲时期。交付时间图表显示每月从发行创建到完成的平均天数。柱子越低表示交付越快。将这两个图表结合使用，可以帮助您了解自己的产能，以及工作流程是否随时间推移变快或变慢。",
        "mockup": "analytics-velocity"
      },
      {
        "heading": "收入图表",
        "body": "收入图表是一个面积图，显示每月赚取的总费用。它跟踪记录在发行上的付款金额，因此反映的是客户实际支付的金额。使用它来查看收入趋势，找出收入最高的月份，并为淡季做好规划。收入数据来自每个发行的付款跟踪功能，因此请确保费用和付款状态保持最新，以获得准确的报告。",
        "mockup": "analytics-revenue"
      },
      {
        "heading": "客户明细",
        "body": "分析页面底部的客户明细表列出了每位客户的关键指标：发行数量、总收入、已付金额和平均交付时间。这有助于您识别哪些客户带来了最多的工作和收入，谁按时付款，以及您的时间花在了哪里。点击任意客户行可查看其发行列表。表格默认按收入排序。",
        "mockup": "analytics-clients"
      },
      {
        "heading": "日期范围选择器",
        "body": "使用右上角的日期范围选择器来控制分析涵盖的时间段。预设范围包括过去 7 天、过去 30 天、过去 90 天和过去 365 天。您也可以通过选择特定的开始和结束日期来设置自定义日期范围。四张汇总卡片和三个图表都会更新以反映所选时间段。日期范围选择器在整个分析仪表盘中的工作方式相同。",
        "tip": "使用 365 天范围进行年度回顾和税务准备。30 天范围适合每月检查您的业务健康状况。",
        "mockup": "analytics-date-range"
      }
    ]
  },
  {
    "id": "release-settings",
    "title": "发行设置",
    "category": "releases",
    "summary":
      "为每个发行配置发行详情、客户信息、分发元数据、付款跟踪和团队成员。",
    "tags": ["release", "settings", "client", "distribution", "payment", "team", "collaborators", "metadata", "UPC", "copyright"],
    "updatedAt": "2026-03-15",
    "content": [
      {
        "heading": "打开发行设置",
        "body": "从任何发行中，点击发行工具栏中的齿轮图标，或从三点菜单中选择\"Settings\"。设置页面有五个部分：Release Details、Client Information、Distribution、Payment 和 Team Management。顶部的返回箭头可返回发行视图。点击表单底部的 Save 按钮保存更改。",
        "mockup": "release-settings-overview"
      },
      {
        "heading": "发行详情",
        "body": "Release Details 部分包含项目的核心元数据。点击图片区域上传或更换封面图。在文本字段中设置发行 Title 和 Artist name。使用药丸样式选择器选择 Release Type（Single、EP 或 Album）和 Format（Stereo、Dolby Atmos 或 Stereo + Atmos）。以同样方式设置 Status（Draft、In Progress 或 Ready）。使用带自动完成建议（Rock、Pop、Hip-Hop、Electronic 等）的标签输入添加 Genre Tags。设置发行截止日期的 Target Date，该日期也会同步到日历订阅中。",
        "mockup": "release-settings-details"
      },
      {
        "heading": "客户信息",
        "body": "Client Information 部分存储与此发行相关的客户联系方式。字段包括 Client Name、Client Email、Client Phone 和 Delivery Notes。客户名称会显示在分析的客户明细和付款报告中。Delivery Notes 是一个自由文本区域，用于记录特殊说明，如首选文件命名规则或交付平台。",
        "mockup": "release-settings-client"
      },
      {
        "heading": "分发元数据",
        "body": "Distribution 部分捕获数字分发所需的元数据。字段包括 Distributor（例如 DistroKid、TuneCore）、Record Label、UPC/EAN 条形码、Catalog Number、Copyright Holder、Copyright Year 和 Phonographic Copyright（P-line）。这些值由 Distribution Tracker 使用，并出现在您的数据导出中。",
        "mockup": "release-settings-distribution"
      },
      {
        "heading": "付款设置",
        "body": "Payment 部分仅在您的用户设置中启用了付款跟踪时才可见。它使用药丸选择器显示 Payment Status（No Fee、Unpaid、Partial、Paid），以及带货币选择器的 Project Fee 字段、Paid Amount 和计算得出的 Balance Due。Payment Notes 文本区域可用于记录付款条件或发票参考。付款状态和金额显示在仪表盘卡片和分析收入图表中。",
        "mockup": "release-settings-payment",
        "tip": "收到定金后，将付款状态设置为\"Partial\"。余额会根据项目费用减去已付金额自动计算。"
      },
      {
        "heading": "团队管理",
        "body": "Team Management 部分允许您邀请协作者和客户加入发行。输入电子邮件地址，选择角色（Collaborator 或 Client），然后点击 Invite。待处理的邀请显示\"Invited\"徽章和 Resend 按钮。已接受的成员显示其显示名称、角色和移除选项。发行所有者始终列出且无法移除。Collaborator 可以编辑曲目和留下评论；Client 拥有只读访问权限，并可通过客户门户审批曲目。",
        "mockup": "release-settings-team",
        "warning": "移除团队成员会立即撤销其访问权限。他们将无法再查看该发行或其任何曲目。"
      }
    ]
  },
  {
    "id": "upload-audio-tracks",
    "title": "上传和管理音频",
    "category": "audio",
    "summary": "如何上传音频文件、管理版本和使用波形播放器。",
    "tags": [
      "upload",
      "tracks",
      "audio",
      "versions",
      "waveform"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "上传音频",
        "body": "打开任意曲目并前往音频选项卡。点击上传区域或直接将文件拖放到上面。支持的格式：WAV、AIFF、FLAC、MP3、AAC 和 M4A，每个文件最大 500 MB。文件会上传到安全的云存储，并自动生成波形可视化。文件元数据（格式、采样率、位深度、时长）会被捕获并显示在版本信息下方，例如：\"Typical Wonderful 2025-10-10 MGO.wav, WAV, 48kHz, 24-bit\"。",
        "mockup": "audio-upload"
      },
      {
        "heading": "曲目版本",
        "body": "每次您向同一曲目上传新文件，都会成为下一个版本。波形上方的版本选择器显示编号按钮（v1、v2、v3 等）以及用于上传另一个版本的 + 按钮。点击任何版本可切换到该版本。每个版本显示其版本号、上传日期、评论数量和下载原始文件的下载图标。之前的版本会被完整保留，包含其自身的评论和波形。",
        "tip": "将修订后的混音上传到同一曲目，而不是创建新曲目。这可以保持版本历史整洁，保留旧版本的评论，并让您可以随时间比较混音。",
        "mockup": "track-versions"
      },
      {
        "heading": "波形播放器",
        "body": "每个上传的版本都显示交互式波形。点击波形上的任意位置可跳转到该位置。波形下方的传输控件包括：当前时间、循环开关、后退、播放/暂停、前进、重复开关和总时长。播放器还在文件元数据旁显示积分 LUFS 响度测量值（例如\"-14.8 LUFS\"），根据响度目标进行颜色编码，便于您一眼评估电平。如果当前版本有时间戳评论，小标记图标会出现在波形的相应位置。",
        "mockup": "track-tab-audio"
      }
    ]
  },
  {
    "id": "audio-converter",
    "title": "交付格式与转换",
    "category": "audio",
    "summary": "设置交付格式、转换音频，并自动嵌入元数据标签，如艺人、封面图、ISRC 和歌词。",
    "tags": [
      "convert",
      "export",
      "format",
      "delivery",
      "wav",
      "mp3",
      "flac",
      "aiff",
      "specs",
      "metadata",
      "tags",
      "isrc",
      "lyrics",
      "cover art",
      "replaygain"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "设置交付格式",
        "body": "打开任意曲目并前往规格选项卡。滚动到交付部分。在此通过点击格式芯片选择项目所需的输出格式。可用的可转换格式：WAV、AIFF、FLAC、MP3、AAC、OGG 和 ALAC。已选格式以绿色高亮并带有勾选标记图标。其他不可转换格式（DDP、ADM BWF/Atmos、MQA）可用于参考选择；它们显示一个提示信息说明无法自动转换。您还可以在\"自定义格式...\"输入框中输入自定义格式名称，然后点击\"+ 添加\"添加未列出的格式。使用\"导出来源\"下拉菜单选择从哪个音频版本转换，例如\"v3 - filename.wav (latest)\"。",
        "mockup": "format-convert"
      },
      {
        "heading": "转换和下载",
        "body": "在交付部分通过点击格式芯片选择可用格式：可转换格式包括 WAV、AIFF、FLAC、MP3、AAC、OGG 和 ALAC。已选格式以绿色高亮并带有勾选标记。点击任何已选可转换格式旁的下载箭头图标开始转换。转换在后台处理时图标会显示加载动画。转换完成后，文件会自动下载到您的浏览器。每次转换使用您在\"导出来源\"下拉菜单中选择的音频版本，从原始上传文件转换以保持最高音频质量。无损格式（WAV、AIFF、FLAC、ALAC）保留源文件的采样率和位深度。有损格式使用优化的预设：MP3 以 44.1 kHz / 320 kbps 导出，AAC 以 44.1 kHz / 256 kbps 导出，OGG 以 44.1 kHz / Quality 8 导出。",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "自动元数据嵌入",
        "body": "当您转换为 MP3、FLAC、AAC、OGG 或 ALAC 时，Mix Architect 会自动将行业标准元数据标签写入输出文件。包括：艺人、标题、专辑、曲目编号、风格、发行年份、版权、ISRC、UPC/条形码、歌词、封面图和 ReplayGain。ReplayGain 是一种响度标签，告诉兼容的播放器如何调整音量，使曲目以一致的电平回放而不削波。Mix Architect 使用 ReplayGain 2.0 标准（参考电平 -18 LUFS）根据音频测量的 LUFS 值计算此标签。MP3 文件使用 ID3v2 标签，FLAC 和 OGG 使用 Vorbis 注释，AAC/ALAC 使用 iTunes 风格的 MP4 atoms。所有元数据均来自您的发行和曲目详情（包括分发选项卡中的 ISRC 和歌词，以及发行封面图）。WAV 和 AIFF 导出不包含元数据标签。转换完成后，将鼠标悬停在格式芯片旁的标签图标上可查看嵌入了哪些标签。",
        "tip": "在导出前填写分发选项卡（ISRC、歌词）并上传封面图。您提供的元数据越完整，导出的文件在分发时就越完善。"
      },
      {
        "heading": "支持的格式参考",
        "body": "无损格式保留源质量：WAV（PCM，源采样率/位深度）、AIFF（PCM，源采样率/位深度）、FLAC（源采样率）、ALAC（源采样率）。有损格式使用为分发优化的固定预设：MP3（44.1 kHz，320 kbps，立体声）、AAC（44.1 kHz，256 kbps，立体声）、OGG Vorbis（44.1 kHz，quality 8，立体声）。不可转换格式（仅标记，无自动转换）：DDP、ADM BWF (Atmos)、MQA。规格选项卡顶部的技术设置（采样率和位深度）是描述源音频的参考元数据；它们不控制转换输出。交付格式下方的特殊要求文本区域允许您添加交付说明备注。",
        "warning": "从有损格式（MP3、AAC、OGG）转换为无损格式（WAV、FLAC）不会提高音频质量。原始压缩失真会保留。请始终上传最高质量的源文件。",
        "mockup": "supported-formats"
      }
    ]
  },
  {
    "id": "audio-review-comments",
    "title": "添加时间戳评论",
    "category": "audio",
    "summary": "在波形上直接添加带时间码的反馈，让协作者准确知道要听哪个位置。",
    "tags": [
      "comments",
      "feedback",
      "review",
      "timestamp",
      "waveform",
      "notes"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "添加评论",
        "body": "打开曲目并前往音频选项卡。在波形上您想引用的精确位置双击。波形下方的反馈部分会出现一个文本输入框，供您输入评论。评论会锚定到该时间码和版本。在反馈部分，每条评论显示作者姓名、彩色时间戳徽章（例如\"0:07\"或\"1:22\"）、相对日期和消息文本。评论标记也以小图标形式直接出现在波形的相应位置。点击任何时间戳即可将播放头跳转到该时刻。",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "门户评论",
        "body": "通过门户审阅的客户也可以在波形上留下时间戳评论。他们的评论与团队评论一起出现在反馈部分，但以\"客户\"徽章加以区分，便于您快速识别外部反馈。这使得所有反馈（内部和外部）都组织在相关音频版本下的同一位置。",
        "mockup": "portal-comments"
      },
      {
        "heading": "备注与音频评论",
        "body": "音频选项卡用于与波形特定时刻绑定的时间戳反馈：\"在 1:22 提高人声音量\"或\"这里的军鼓太大声了\"。备注选项卡用于不与时间码绑定的通用讨论和修订备注：\"整体混音需要更多低频\"或\"客户希望采用更具侵略性的方式\"。音频评论是版本特定的（与 v1、v2 等绑定），而备注适用于整个曲目。使用意图选项卡记录整体创意愿景、情感标签和参考曲目。",
        "tip": "要全面了解曲目的反馈，请同时查看音频选项卡的反馈部分（时间特定的备注）和备注选项卡（通用讨论）。客户反馈可能出现在任一位置。",
        "mockup": "resolve-feedback"
      }
    ]
  },
  {
    "id": "timeline-overview",
    "title": "使用时间线视图",
    "category": "timeline",
    "summary": "在仪表盘上切换到时间线视图，可视化发行排期并查看发行日期倒计时。",
    "tags": [
      "timeline",
      "schedule",
      "calendar",
      "planning",
      "release date"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "切换到时间线视图",
        "body": "在[仪表盘](/app)上，找到标题区（付款统计下方）的两个视图切换按钮。点击时间线图标（第二个按钮）从网格视图切换到时间线视图。时间线根据目标发行日期按时间顺序显示您的发行。没有目标日期的发行会显示在底部的\"未排期\"区域。您的视图偏好会自动保存，下次访问时仪表盘会记住您的选择。",
        "mockup": "timeline-full"
      },
      {
        "heading": "阅读时间线",
        "body": "每个发行以卡片形式按其目标发行日期定位。时间线显示倒计时：即将到来的日期显示\"距离发行还有 X 天\"，已过的日期显示\"已发行 X 天\"。发行卡片显示与网格视图相同的信息（标题、艺人、状态、格式、曲目数量），外加排期上下文。状态圆点以颜色区分：橙色为草稿，蓝色为进行中，绿色为就绪。已固定的发行显示在时间线顶部。",
        "mockup": "timeline-navigate"
      },
      {
        "heading": "设置目标日期",
        "body": "要将发行添加到时间线，请在创建发行时或在发行设置（发行页面的齿轮图标）中设置目标发行日期。目标发行日期字段使用日期选择器。调整日期后时间线会自动更新。这有助于您可视化排期，避免多个项目的发行窗口重叠。",
        "tip": "在规划阶段使用时间线视图来合理安排发行间隔。清晰了解即将到来的截止日期有助于避免混音、母带处理或分发工作流程中的瓶颈。",
        "mockup": "timeline-dates"
      }
    ]
  },
  {
    "id": "export-data",
    "title": "导出您的账户数据",
    "category": "account",
    "summary": "下载包含您的发行、曲目、音频文件和付款记录的完整 ZIP 导出文件。",
    "tags": [
      "export",
      "data",
      "download",
      "backup",
      "privacy",
      "zip"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "包含的内容",
        "body": "数据导出是一个 ZIP 文件，包含您所有的发行元数据、曲目详情、音频文件（所有版本）和付款记录。下载前，应用会显示导出大小的估算以及数量：包含的发行、曲目和音频文件数量。这为您提供了账户中所有内容的完整备份。",
        "mockup": "export-contents"
      },
      {
        "heading": "开始导出",
        "body": "前往[设置](/app/settings)，滚动到\"您的数据\"部分。点击\"导出我的数据\"开始。应用会先计算估算值，显示大致文件大小和数量（例如\"3 个发行、12 个曲目、8 个音频文件\"）。查看估算后，点击\"下载\"开始导出。进度条显示下载状态。对于包含大量音频文件的账户，导出可能需要一些时间。ZIP 文件完成后会自动下载到您的浏览器。您可以点击\"取消\"返回而不下载。",
        "mockup": "export-progress"
      },
      {
        "heading": "数据隐私",
        "body": "您的导出仅包含您拥有或创建的数据。协作者的贡献（如对您发行的评论）包含在内，但其他用户的私有数据不包含。导出按需生成，下载后不会存储在我们的服务器上。",
        "tip": "定期运行数据导出作为项目和音频文件的备份。这在对账户进行重大更改之前特别有用。",
        "mockup": "export-privacy"
      }
    ]
  },
  {
    "id": "user-settings",
    "title": "用户设置",
    "category": "account",
    "summary":
      "配置您的个人资料、外观、电子邮件通知、混音默认值等。",
    "tags": ["settings", "profile", "email", "notifications", "preferences", "theme", "appearance", "defaults", "persona", "calendar", "export"],
    "updatedAt": "2026-03-15",
    "content": [
      {
        "heading": "设置概览",
        "body": "从侧边栏或顶部栏的账户菜单打开[User Settings](/app/settings)。设置按面板组织：Profile、Subscription、Region & Currency、Appearance、Persona、Payment Tracking、Email Preferences、Mix Defaults、Calendar 和 Your Data。当您与每个面板交互时，更改会即时保存。",
        "mockup": "settings-overview"
      },
      {
        "heading": "个人资料",
        "body": "Profile 面板是页面的第一个部分。它有三个字段：Display Name（显示在评论、通知和发送给协作者的电子邮件中）、Company Name（可选，用于品牌标识）和 Email（只读，通过您的身份验证提供商管理）。输入您的名称并点击 Save。顶部栏会显示使用您名字的个性化问候语。",
        "mockup": "settings-profile"
      },
      {
        "heading": "订阅",
        "body": "Subscription 面板显示您的当前计划。Pro 账户显示绿色\"PRO\"徽章、月费以及一个\"Manage Billing\"按钮，点击可打开 Stripe 门户来更新付款方式、查看发票和下载收据。免费账户则显示\"Upgrade to Pro\"按钮。Pro 可解锁无限发行、音频格式转换和优先支持。",
        "mockup": "settings-subscription"
      },
      {
        "heading": "地区和货币",
        "body": "Region & Currency 面板有两个下拉菜单。Locale 下拉菜单设置您的语言和日期格式，每个选项旁边都有国旗表情。更改 Locale 也会自动更新默认货币。Currency 下拉菜单允许您覆盖用于付款跟踪的货币。底部的格式预览显示金额的显示方式（例如\"$1,234.56\"）。",
        "mockup": "settings-region"
      },
      {
        "heading": "外观",
        "body": "Appearance 面板允许您使用三个样式化按钮在 Light、Dark 和 System 主题之间切换。当前主题会以您的强调色高亮显示。System 模式跟随您的操作系统偏好设置。您的主题选择保存到账户中，并在所有设备上生效。",
        "mockup": "settings-appearance"
      },
      {
        "heading": "身份角色",
        "body": "Persona 面板询问您如何使用 Mix Architect。使用单选按钮从 Artist、Engineer、Both 或 Other 中选择。您的选择会定制体验：选择 Engineer 或 Both 会自动启用付款跟踪，而 Artist 默认关闭此功能。您随时可以独立覆盖付款跟踪设置。选项下方有一条说明解释身份角色如何影响默认设置。",
        "mockup": "settings-persona"
      },
      {
        "heading": "付款跟踪",
        "body": "Payment Tracking 面板有一个单独的切换开关。启用后，仪表盘上的发行卡片会显示付款汇总统计（未付款、已收款、总费用），每个发行的设置中也会出现 Payment 部分。禁用后，所有付款相关的 UI 都会隐藏。切换会即时保存并刷新页面。",
        "mockup": "settings-payment-tracking",
        "tip": "当您的身份角色选择 Engineer 或 Both 时，付款跟踪会自动启用；选择 Artist 时则自动禁用。您可以随时手动覆盖此设置。"
      },
      {
        "heading": "电子邮件通知",
        "body": "Email Preferences 面板控制您从 Mix Architect 接收哪些事务性电子邮件。每个类别都有一个开/关切换。类别包括：Release Live Alerts（当发行在平台上线时）、New Comment Alerts（当有人评论您的发行时）、Weekly Digest（您所有发行活动的每周摘要）、Payment Reminders（当订阅付款失败时）、Payment Confirmations（当付款处理完成时）、Subscription Confirmations（当您的计划激活时）以及 Cancellation Notices（当您的计划取消时）。所有类别默认启用。每封电子邮件底部都包含退订链接。",
        "mockup": "settings-email-prefs",
        "tip": "您也可以通过点击任何通知电子邮件底部的退订链接来取消订阅特定的电子邮件类别。无需登录。"
      },
      {
        "heading": "混音默认值",
        "body": "Mix Defaults 面板设置新发行的首选起始值。使用药丸样式按钮选择默认 Format（Stereo、Dolby Atmos 或 Stereo + Atmos）。从下拉菜单中选择默认 Sample Rate（44.1kHz、48kHz 或 96kHz）和 Bit Depth（16-bit、24-bit 或 32-bit float）。您还可以使用标签输入定义默认 Element List（例如 Vocals、Bass、Drums）。创建新发行时，这些默认值会自动填充，节省重复设置的时间。点击 Save 保存您的选择。",
        "mockup": "settings-mix-defaults"
      },
      {
        "heading": "日历",
        "body": "Calendar 面板提供用于发行截止日期的 iCal 订阅源。只读 URL 字段显示您的个人源地址，旁边有一个 Copy 按钮用于复制到剪贴板。下方的设置说明解释如何将源添加到 Google Calendar、Apple Calendar 或 Outlook。如果需要撤销旧链接的访问权限，Regenerate 按钮会创建一个新的源 URL。",
        "mockup": "settings-calendar",
        "warning": "重新生成日历源 URL 会使旧链接失效。所有订阅了先前 URL 的日历将不再收到更新。"
      },
      {
        "heading": "您的数据",
        "body": "Your Data 面板允许您导出所有 Mix Architect 数据。它显示预估的导出大小并提供 Download 按钮。导出包括所有发行、曲目、音频文件元数据、备注、评论、协作者列表和设置。用于备份或在本地保存您的工作副本。",
        "mockup": "settings-data"
      }
    ]
  },
  {
    "id": "manage-subscription",
    "title": "管理您的 Pro 订阅",
    "category": "billing",
    "summary": "查看您的方案、更新付款信息，以及通过 Stripe 管理您的 Pro 订阅。",
    "tags": [
      "subscription",
      "pro",
      "billing",
      "payment",
      "plan"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "查看您的方案",
        "body": "前往[设置](/app/settings)，滚动到底部的订阅部分。该部分显示\"管理您的 Mix Architect 方案。\"您将看到当前方案：Pro 账户显示\"$14/月，无限发行\"，带有绿色\"PRO\"徽章和\"管理账单\"按钮。免费账户则显示\"升级到 Pro\"按钮。",
        "mockup": "plan-current"
      },
      {
        "heading": "升级到 Pro",
        "body": "从[设置](/app/settings)页面，点击订阅部分的\"升级到 Pro\"。您将被引导到安全的 Stripe 结账页面。付款确认后，您的账户会立即升级，您将获得所有 Pro 功能的访问权限，包括无限发行和音频转换。Pro 徽章会显示在您的方案信息旁边。",
        "mockup": "upgrade-pro"
      },
      {
        "heading": "管理付款方式",
        "body": "点击[设置](/app/settings)订阅部分的\"管理账单\"以打开 Stripe 账单门户。在那里您可以更新付款方式、查看发票和下载收据。所有付款处理均由 Stripe 安全处理。",
        "mockup": "manage-payment"
      }
    ]
  },
  {
    "id": "cancel-resubscribe",
    "title": "取消和重新订阅",
    "category": "billing",
    "summary": "如何取消您的 Pro 订阅以及您的数据将会如何处理。",
    "tags": [
      "cancel",
      "resubscribe",
      "downgrade",
      "billing"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "取消订阅",
        "body": "点击[设置](/app/settings)订阅部分的\"管理账单\"以打开 Stripe 门户，然后点击\"取消方案\"。您的 Pro 访问权限将持续到当前计费周期结束。[设置](/app/settings)中的通知会显示您的 Pro 方案何时到期，让您确切知道访问权限持续多长时间。",
        "mockup": "cancel-subscription"
      },
      {
        "heading": "您的数据将会如何",
        "body": "您所有的发行、曲目、音频文件、评论和付款记录都会完整保留。降级时您不会丢失任何内容。但是，Pro 功能（如无限发行和音频转换）在重新订阅前将不可用。您现有的发行仍可访问。",
        "warning": "免费账户限制为一个活跃发行。如果在 Pro 方案到期时您有多个发行，现有发行会被保留，但在重新订阅或减少到一个发行之前，您将无法创建新发行。",
        "mockup": "data-after-cancel"
      },
      {
        "heading": "重新订阅",
        "body": "要重新激活 Pro，请前往[设置](/app/settings)的订阅部分，点击\"升级到 Pro\"，或使用\"管理账单\"通过 Stripe 门户重新订阅。您之前的数据、设置、模板和团队配置都完好无损，可立即使用。",
        "mockup": "resubscribe"
      }
    ]
  }
];
