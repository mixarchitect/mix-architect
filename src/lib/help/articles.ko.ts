import type { HelpArticle } from "./types";

export const articles: HelpArticle[] = [
  {
    "id": "getting-started-overview",
    "title": "Mix Architect에 오신 것을 환영합니다",
    "category": "getting-started",
    "summary": "플랫폼 둘러보기: 대시보드, 릴리스, 트랙, 협업 도구를 빠르게 살펴봅니다.",
    "tags": [
      "overview",
      "intro",
      "dashboard",
      "getting started"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "대시보드",
        "body": "로그인하면 [대시보드](/app)가 표시됩니다. 모든 릴리스가 반응형 그리드로 표시되며, 가장 최근 활동순으로 정렬됩니다. 각 릴리스 카드에는 커버 아트, 제목, 아티스트 이름, 상태 점(Draft, In Progress, Ready에 따라 색상 구분), 릴리스 유형 뱃지(Single, EP, Album), 포맷 뱃지(Stereo, Dolby Atmos, Stereo + Atmos), 트랙 완료 수(예: \"6곡 중 1곡 브리핑 완료\")가 표시됩니다. [결제 추적](/app/settings)이 활성화된 경우, 상단에 결제 요약 통계도 표시됩니다: 미수금, 수금 완료, 전체 수수료가 모든 릴리스에 걸쳐 표시되며, [결제](/app/payments) 페이지로 이동하는 \"전체 보기\" 링크가 있습니다. 릴리스 카드의 핀 아이콘을 사용하여 대시보드 상단에 고정할 수 있으며, 점 세 개 메뉴로 빠른 작업을 수행할 수 있습니다. 정렬 드롭다운을 사용하면 최근 수정일, 제목, 생성일 순으로 릴리스를 정렬할 수 있습니다.",
        "mockup": "dashboard"
      },
      {
        "heading": "그리드 보기 vs 타임라인 보기",
        "body": "대시보드 헤더에는 그리드와 타임라인, 두 가지 보기 전환 버튼이 있습니다. 그리드 보기(기본값)는 릴리스를 반응형 그리드의 카드로 표시합니다. 타임라인 보기는 릴리스를 목표 발매일 기준으로 시간순으로 배치하여 카운트다운 및 일정 정보를 보여줍니다. 보기 설정은 자동으로 저장됩니다. 자세한 내용은 [타임라인 보기 사용하기](/app/help?article=timeline-overview)를 참조하세요."
      },
      {
        "heading": "앱 탐색하기",
        "body": "사이드바(데스크톱) 또는 하단 바(모바일)를 통해 앱의 모든 섹션에 빠르게 접근할 수 있습니다: 릴리스 관리를 위한 [대시보드](/app), 릴리스나 트랙을 즉시 검색하는 검색(Cmd+K / Ctrl+K), 재사용 가능한 릴리스 프리셋을 위한 [템플릿](/app/templates), 수수료 추적을 위한 [결제](/app/payments)(활성화된 경우), 프로필, 기본값, 구독 관리를 위한 [설정](/app/settings), 문서를 위한 [도움말](/app/help)이 있습니다. 사이드바에는 활동 업데이트를 위한 알림, 자동화 기능을 위한 Auto, 로그아웃도 포함되어 있습니다. 라이트, 다크, 시스템 모드 간의 테마 전환은 [설정](/app/settings)의 외관에서 사용할 수 있습니다.",
        "tip": "앱 어디에서든 Cmd+K(Mac) 또는 Ctrl+K(Windows)를 눌러 릴리스나 트랙을 즉시 검색하고 이동할 수 있습니다.",
        "mockup": "nav-rail"
      },
      {
        "heading": "주요 개념",
        "body": "릴리스는 최상위 프로젝트(Album, EP, Single)입니다. 각 릴리스에는 하나 이상의 트랙이 포함됩니다. 데스크톱에서는 릴리스 상세 페이지가 두 열로 구성됩니다: 왼쪽에는 트랙 목록, 오른쪽에는 커버 아트, 릴리스 정보(아티스트, 유형, 포맷, 상태, 목표일, 장르), 글로벌 믹스 방향, 글로벌 레퍼런스, 결제 상태를 보여주는 인스펙터 사이드바가 있습니다. 각 트랙에는 6개의 탭이 있습니다: Intent, Specs, Audio, Distribution, Portal, Notes. 릴리스 헤더의 설정 톱니바퀴 아이콘을 클릭하면 릴리스 설정이 열리며, 모든 메타데이터를 편집하고 팀을 관리하고 결제를 구성할 수 있습니다. 헤더에는 포털 토글(포털 열기 링크 포함), 템플릿으로 저장, 설정 톱니바퀴 버튼도 있습니다.",
        "mockup": "key-concepts"
      }
    ]
  },
  {
    "id": "create-first-release",
    "title": "첫 번째 릴리스 만들기",
    "category": "getting-started",
    "summary": "릴리스 생성, 커버 아트 추가, 트랙 업로드, 상태 설정에 대한 단계별 가이드입니다.",
    "tags": [
      "create",
      "release",
      "new project",
      "setup"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "새 릴리스 만들기",
        "body": "[대시보드](/app)에서 오른쪽 상단의 \"+ New Release\" 버튼을 클릭합니다. 저장된 [템플릿](/app/templates)이 있는 경우, 먼저 템플릿 선택기가 표시되어 템플릿을 선택하거나 \"처음부터 시작\"을 클릭할 수 있습니다. 생성 양식에서는 제목, 선택적 아티스트/클라이언트 이름, 릴리스 유형(Single, EP, Album), 포맷(Stereo, Dolby Atmos, Stereo + Atmos), 장르 태그(Rock, Pop, Hip-Hop, Electronic 등의 제안에서 선택하거나 직접 추가), 목표 발매일을 입력합니다.",
        "tip": "Single을 만들면 릴리스 제목으로 트랙이 자동 생성되며, [설정](/app/settings)의 기본 스펙이 적용됩니다.",
        "mockup": "create-release"
      },
      {
        "heading": "릴리스 상세 페이지",
        "body": "릴리스를 만들면 릴리스 상세 페이지로 이동합니다. 데스크톱에서는 두 열 레이아웃으로 구성됩니다: 왼쪽에는 \"Flow\" 버튼과 \"+ Add Track\" 버튼이 있는 트랙 목록, 오른쪽에는 인스펙터 사이드바가 있습니다. 인스펙터 사이드바에는 커버 아트, 릴리스 정보(아티스트, 유형, 포맷, 상태, 목표일, 장르), 글로벌 믹스 방향(편집하려면 연필 아이콘 클릭), 글로벌 레퍼런스(\"+ Add\"를 클릭하여 레퍼런스 트랙 검색 및 추가)가 표시됩니다. 결제 추적이 활성화된 경우 사이드바 하단에 결제 섹션이 나타납니다. 커버 아트를 추가하거나 변경하려면 사이드바의 아트워크에 있는 연필 아이콘을 클릭합니다. 이미지 아래에 업로드 버튼, 제거 버튼(기존 아트가 있는 경우), URL 붙여넣기 필드가 표시됩니다. 새 릴리스에는 \"클릭하여 업로드\"가 표시된 점선 업로드 영역이 나타납니다(JPEG 또는 PNG, 최소 1400x1400). 다른 릴리스 메타데이터를 편집하려면 헤더의 설정 톱니바퀴 아이콘을 클릭하여 릴리스 설정을 엽니다.",
        "mockup": "cover-art-upload"
      },
      {
        "heading": "트랙 추가",
        "body": "릴리스 상세 보기에서 Flow 버튼 옆의 \"+ Add Track\"을 클릭합니다. 트랙 제목을 입력하면 [설정](/app/settings)의 기본 스펙이 적용되어 생성됩니다. 각 트랙은 목록에 번호, 제목, 인텐트 미리보기, 상태 점, 승인 뱃지와 함께 표시됩니다. 왼쪽의 그립 핸들을 사용하여 드래그로 순서를 변경하거나 위/아래 이동 버튼을 사용할 수 있습니다. 오른쪽의 휴지통 아이콘으로 트랙을 삭제합니다. 트랙을 클릭하면 6개의 탭에서 작업을 시작할 수 있습니다.",
        "mockup": "track-upload"
      },
      {
        "heading": "릴리스 상태 설정",
        "body": "각 릴리스에는 Draft, In Progress, Ready의 상태가 있습니다. 인스펙터 사이드바의 릴리스 정보 섹션에서 \"Status\" 옆의 상태 뱃지를 클릭하거나, 릴리스 설정(톱니바퀴 아이콘)에서 상태를 변경할 수 있습니다. 작업이 시작되면(예: 오디오 업로드 또는 트랙 추가) 릴리스가 자동으로 In Progress로 변경됩니다. 상태 뱃지 색상은 [대시보드](/app) 릴리스 카드에 표시됩니다(Draft는 주황색, In Progress는 파란색, Ready는 녹색). 모든 협력자와 클라이언트 포털에서도 볼 수 있습니다.",
        "mockup": "release-status"
      }
    ]
  },
  {
    "id": "invite-collaborators",
    "title": "릴리스에 협력자 초대하기",
    "category": "getting-started",
    "summary": "역할 및 포털을 사용하여 팀원 및 외부 클라이언트와 릴리스를 공유합니다.",
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
        "heading": "초대 보내기",
        "body": "릴리스를 열고 헤더의 설정 톱니바퀴 아이콘을 클릭하여 릴리스 설정으로 이동합니다. 릴리스 메타데이터를 지나 아래로 스크롤하면 팀 섹션이 있습니다. 초대할 사람의 이메일 주소를 입력하고 드롭다운에서 역할을 선택한 후(Collaborator 또는 Client) \"Invite\"를 클릭합니다. 초대받은 사람은 릴리스에 참여할 수 있는 링크가 포함된 이메일을 받습니다. 활성 팀원은 초대 양식 아래에 이메일, 역할 뱃지, 상태, 삭제 버튼과 함께 표시됩니다.",
        "mockup": "invite-collaborator"
      },
      {
        "heading": "Collaborator vs Client 역할",
        "body": "두 가지 역할이 있습니다. Collaborator는 트랙, 인텐트, 스펙, 오디오, 노트, 배포 메타데이터, 릴리스 설정 등 모든 릴리스 콘텐츠를 보고 편집할 수 있는 전체 접근 권한을 가집니다. Client는 클라이언트 포털을 통한 읽기 전용 접근 권한을 가지며, 댓글을 통한 피드백 제공, 개별 트랙 승인 또는 변경 요청, 허용된 경우 오디오 파일 다운로드가 가능합니다. 역할 뱃지는 팀 섹션에서 각 팀원의 이메일 옆에 표시됩니다.",
        "mockup": "collaborator-roles"
      },
      {
        "heading": "초대 수락하기",
        "body": "초대받은 사람이 초대 링크를 클릭하고 릴리스에 참여하면, 팀 목록에 역할 뱃지와 \"Active\" 상태로 표시됩니다. 참여 사실을 알리는 인앱 알림을 받게 됩니다. Mix Architect 계정이 없는 초대받은 사람은 초대 링크를 클릭할 때 계정 생성을 안내받습니다.",
        "tip": "릴리스 설정의 팀 섹션에서 팀원 이름 옆의 휴지통 아이콘을 클릭하면 언제든지 팀원을 제거할 수 있습니다.",
        "mockup": "accept-invitation"
      },
      {
        "heading": "클라이언트 포털 공유",
        "body": "로그인 없이 검토가 필요한 외부 이해관계자를 위해 릴리스 상세 페이지 헤더에서 클라이언트 포털을 활성화합니다. 포털 토글을 클릭하여 활성화하면(활성 시 녹색으로 변경) 토글 옆의 링크 아이콘을 클릭하여 고유 공유 URL을 복사할 수 있습니다. 포털은 릴리스 브리프, 트랙 목록, 오디오 재생, 댓글 시스템에 대한 읽기 전용 접근을 제공합니다. 포털 설정을 사용하여 클라이언트에게 표시할 섹션을 제어할 수 있습니다: 믹스 방향, 스펙, 레퍼런스, 결제 상태, 배포 정보, 가사. 트랙별 제어는 각 트랙의 Portal 탭을 사용합니다.",
        "mockup": "portal-sharing"
      }
    ]
  },
  {
    "id": "track-tabs",
    "title": "트랙 상세: 탭 이해하기",
    "category": "releases",
    "summary": "각 트랙에는 믹스의 모든 측면을 관리하는 6개의 탭이 있습니다: Intent, Specs, Audio, Distribution, Portal, Notes.",
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
        "heading": "Intent",
        "body": "Intent 탭은 트랙의 크리에이티브 비전을 설명하는 곳입니다. 상단에는 \"이 트랙이 어떤 느낌이어야 하나요?\" 아래에 자유 형식 텍스트 영역이 있어 믹스 방향을 작성할 수 있습니다(수정하려면 \"Edit\" 클릭). 그 아래 Emotional Qualities 섹션에서는 설명적인 단어로 트랙에 태그를 지정할 수 있습니다: 선택된 태그는 채워진 필로 표시되고(예: spacious, warm, punchy, nostalgic), 사용 가능한 제안은 클릭하여 추가할 수 있는 아웃라인 필로 표시됩니다(aggressive, intimate, gritty, polished, dark, bright, raw, lush, dreamy, lo-fi, cinematic, minimal, dense, ethereal, hypnotic, euphoric, melancholic, organic, synthetic, chaotic, smooth, haunting, playful, anthemic, delicate, heavy, airy). 하단의 Anti-References 섹션에서는 피하고 싶은 사운드나 접근 방식을 설명합니다. 오른쪽 사이드바의 Quick View에서는 트랙 상태, 오디오 품질(샘플 레이트/비트 뎁스), 포맷을 한눈에 볼 수 있습니다. 그 아래 References 섹션에서는 레퍼런스 트랙을 검색하고 추가할 수 있으며(Apple Music에서), 각 레퍼런스에 대한 참고 사항을 선택적으로 추가할 수 있습니다.",
        "mockup": "track-tab-intent"
      },
      {
        "heading": "Specs",
        "body": "Specs 탭은 트랙의 기술 사양을 관리합니다. Technical Settings 섹션에는 세 가지 드롭다운이 있습니다: Format(Stereo, Dolby Atmos, Stereo + Atmos), Sample Rate(44.1kHz, 48kHz, 88.2kHz, 96kHz), Bit Depth(16-bit, 24-bit, 32-bit float). 이 값들은 소스 오디오를 설명하는 참조 메타데이터이며 템플릿에서 새 트랙을 만들 때 기본값으로 사용됩니다. 변환 출력을 제어하지는 않습니다. 그 아래 Delivery 섹션에서는 출력 포맷을 관리합니다. 포맷 칩을 클릭하여 사용할 포맷을 선택합니다: 변환 가능한 포맷으로는 WAV, AIFF, FLAC, MP3, AAC, OGG, ALAC이 있습니다. 변환 불가능한 포맷(DDP, ADM BWF/Atmos, MQA)은 참조용으로 선택할 수 있으며 자동 변환이 불가능하다는 정보 툴팁이 표시됩니다. 선택된 포맷은 체크마크와 함께 녹색으로 강조 표시됩니다. \"Export from\" 드롭다운을 사용하여 변환할 오디오 버전을 선택합니다(예: \"v3 - Typical Wonderful 2025-10-10 MGO.wav (latest)\"). 선택된 변환 가능 포맷 옆의 다운로드 화살표 아이콘을 클릭하면 변환이 시작됩니다. \"Custom format...\" 필드에 사용자 정의 포맷 이름을 입력하고 \"+ Add\"를 클릭할 수도 있습니다. 하단의 Special Requirements 텍스트 영역에서는 납품 관련 지침을 기록할 수 있습니다.",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Audio",
        "body": "Audio 탭은 파일을 업로드하고 버전을 관리하며 오디오를 재생하는 곳입니다. 헤더에는 릴리스 및 트랙 이름이 앨범 아트와 함께 표시됩니다. 버전 선택기(v1, v2, v3 등)로 리비전 간 전환이 가능하며, + 버튼을 클릭하여 새 버전을 업로드합니다. 각 버전에는 버전 번호, 업로드 날짜, 댓글 수, 다운로드 버튼이 표시됩니다. 파형 시각화에서는 인터랙티브 재생이 가능합니다: 아무 곳이나 클릭하여 탐색하고, 아래 전송 컨트롤(루프, 뒤로 건너뛰기, 재생/일시정지, 앞으로 건너뛰기, 반복)을 사용합니다. LUFS 라우드니스 측정값이 파일 메타데이터(포맷, 샘플 레이트, 비트 뎁스) 옆에 라우드니스 목표에 따라 색상으로 표시됩니다. 파형 아래 Feedback 섹션에서는 현재 버전의 모든 타임스탬프 댓글이 표시됩니다. 파형의 아무 곳이나 더블클릭하면 해당 타임코드에 새 댓글을 추가할 수 있습니다. 댓글 마커는 파형 위에 해당 위치에 작은 아이콘으로 표시됩니다.",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "라우드니스 분석 (LUFS)",
        "body": "오디오를 업로드하면 Mix Architect가 자동으로 LUFS(Loudness Units Full Scale) 통합 라우드니스를 측정합니다. 버전 메타데이터 옆의 LUFS 수치를 클릭하면 라우드니스 분석 패널이 확장됩니다. 이 패널은 주요 스트리밍 서비스, 방송 표준, 소셜 플랫폼이 재생 중 트랙을 어떻게 조정하는지 보여줍니다. 각 행에는 플랫폼 이름, 목표 라우드니스(예: Spotify는 -14 LUFS를 목표), 파일에 적용되는 게인 변화가 표시됩니다. 양수 값은 서비스가 트랙 볼륨을 높인다는 의미이고, 음수 값(주황색으로 표시)은 볼륨을 낮춘다는 의미입니다. 예를 들어, 믹스가 -14.9 LUFS로 측정되면 Spotify는 +0.9 dB를 적용하고 Apple Music(목표 -16)은 -1.1 dB를 적용합니다. 패널은 Streaming(Spotify, Apple Music, YouTube, Tidal, Amazon Music, Deezer, Qobuz, Pandora), Broadcast(EBU R128, ATSC A/85, ITU-R BS.1770), Social(Instagram/Reels, TikTok, Facebook)로 구분됩니다. 이를 사용하여 납품 전에 마스터가 어떤 플랫폼에서 크게 변경되는지 확인할 수 있습니다.",
        "mockup": "track-tab-lufs"
      },
      {
        "heading": "Distribution",
        "body": "Distribution 탭은 디지털 배포에 필요한 모든 메타데이터를 관리합니다. 각각 \"+ Add Person\" 버튼이 있는 세 가지 분할 섹션이 있습니다: Writing Split(이름, 비율, PRO 소속(예: ASCAP/BMI), 멤버 계좌 번호, Writer IPI 번호), Publishing Split(퍼블리셔 이름, 비율, Publisher Member ID, Publisher IPI), Master Recording Split(엔티티 이름, 비율). 각 분할 섹션의 합계가 100%이면 녹색으로, 아니면 주황색으로 표시됩니다. 분할 아래에는 Codes and Identifiers(ISRC 및 ISWC 필드), Credits(프로듀서 및 작곡가/송라이터 이름), Track Properties(피처링 아티스트, 언어 선택기, 노골적 가사, 인스트루멘탈, 커버곡 토글), Copyright(등록 번호 및 저작권 날짜), Lyrics(전체 가사 텍스트 영역)가 있습니다.",
        "mockup": "track-tab-distribution"
      },
      {
        "heading": "Portal",
        "body": "Portal 탭은 클라이언트가 이 특정 트랙과 상호작용하는 방식을 제어합니다. 상단의 Client Approval 섹션에서는 현재 승인 상태(예: 녹색 \"Approved\")와 모든 승인 이벤트의 타임스탬프 기록이 표시됩니다: 승인, 변경 요청(클라이언트의 메모 포함), 검토 재개, 재승인, 각각의 날짜가 기록됩니다. 그 아래 Track Portal Visibility에서는 이 트랙의 포털 표시 여부, 다운로드 활성화 여부, 클라이언트가 접근 가능한 특정 오디오 버전(Version 1, Version 2, Version 3 등)을 각각의 토글 스위치로 제어할 수 있습니다. 하단의 안내문은 포털 활성화와 공유 링크가 릴리스 페이지 헤더에 있다는 것을 알려줍니다.",
        "mockup": "track-tab-portal"
      },
      {
        "heading": "Notes",
        "body": "Notes 탭은 특정 타임코드에 연결되지 않은 리비전 노트와 토론을 위한 범용 공간입니다. 상단에는 \"Add a note...\" 플레이스홀더와 \"Post\" 버튼이 있는 텍스트 영역이 있습니다. 노트는 아래에 역순으로 표시됩니다. 각 노트에는 작성자 이름, 날짜 또는 상대적 시간, 메시지가 표시됩니다. 클라이언트 노트는 녹색 \"Client\" 뱃지로 시각적으로 구분되어 내부 피드백과 외부 피드백을 한눈에 구별할 수 있습니다. 이 탭은 일반적인 리비전 방향, 할 일 항목, 오디오의 특정 시점을 참조하지 않는 토론에 사용합니다. 시간별 피드백은 Audio 탭의 파형 댓글을 대신 사용하세요.",
        "mockup": "track-tab-notes"
      }
    ]
  },
  {
    "id": "client-portal",
    "title": "클라이언트 포털 및 승인",
    "category": "releases",
    "summary": "고유 링크를 통해 클라이언트와 릴리스를 공유하고, 표시 항목을 제어하고, 트랙별 승인을 추적합니다.",
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
        "heading": "포털 활성화",
        "body": "릴리스 상세 페이지 헤더 영역(오른쪽 상단)에서 포털 토글을 찾습니다. 토글을 클릭하여 활성화합니다(활성 시 녹색으로 변합니다). 활성화되면 토글 옆의 링크 아이콘을 클릭하여 고유 공유 URL을 복사합니다. 이 링크를 클라이언트에게 보내면 Mix Architect 계정 없이도 검토할 수 있습니다. 포털에서는 릴리스 브리프, 트랙 목록, 오디오 플레이어, 댓글 시스템을 이용할 수 있습니다. 포털 설정을 사용하여 클라이언트에게 표시할 릴리스 수준 섹션을 제어합니다: 믹스 방향, 스펙, 레퍼런스, 결제 상태, 배포 메타데이터, 가사.",
        "mockup": "portal-settings"
      },
      {
        "heading": "트랙별 가시성",
        "body": "각 트랙에서 Portal 탭으로 이동하여 클라이언트에게 보이는 항목을 제어합니다. Track Portal Visibility 섹션에는 다음의 토글 스위치가 있습니다: \"Visible on portal\"(트랙 전체 표시/숨기기), \"Enable download\"(오디오 다운로드 허용/차단), 개별 버전 토글(Version 1, Version 2, Version 3 등)로 클라이언트가 접근할 수 있는 오디오 리비전을 제어합니다. 이를 통해 세밀한 제어가 가능하여 진행 중인 작업을 숨기고 완성된 믹스만 공유할 수 있습니다. 모든 토글은 독립적이므로 트랙을 표시하되 다운로드를 비활성화하거나, 최신 버전만 표시할 수 있습니다.",
        "mockup": "portal-track-visibility"
      },
      {
        "heading": "트랙 승인",
        "body": "클라이언트는 포털을 통해 개별 트랙을 승인하거나 변경을 요청할 수 있습니다. 승인 상태는 각 트랙의 Portal 탭에 있는 Client Approval 섹션에서 추적됩니다. 상태에는 색상 뱃지(예: 녹색 \"Approved\")와 모든 승인 이벤트의 전체 타임스탬프 기록이 표시됩니다: 클라이언트가 승인한 시점, 변경을 요청한 시점(메모 포함, 예: \"보컬이 너무 작습니다\"), 검토를 위해 다시 열린 시점, 재승인된 시점. 이를 통해 클라이언트의 모든 결정에 대한 명확한 감사 추적이 가능합니다. 승인 뱃지는 릴리스 상세 페이지의 트랙 목록에도 표시되어 어떤 트랙이 승인되었는지 한눈에 확인할 수 있습니다.",
        "mockup": "portal-approval"
      }
    ]
  },
  {
    "id": "templates",
    "title": "릴리스 템플릿 사용하기",
    "category": "releases",
    "summary": "사전 구성된 스펙과 설정이 포함된 재사용 가능한 템플릿으로 시간을 절약합니다.",
    "tags": [
      "templates",
      "reuse",
      "workflow",
      "presets"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "템플릿에 포함되는 항목",
        "body": "템플릿은 6개의 접기 가능한 섹션에 걸쳐 포괄적인 릴리스 기본값을 저장합니다. Basics: 템플릿 이름, 설명, \"기본 템플릿으로 설정\" 체크박스(새 릴리스에 자동 선택), 아티스트/클라이언트 이름 및 이메일. Release Settings: 릴리스 유형(Single, EP, Album), 포맷(Stereo, Dolby Atmos, Stereo + Atmos), 장르 태그. Technical Specs: 샘플 레이트, 비트 뎁스, 납품 포맷 선택(WAV, AIFF, FLAC, MP3, AAC, OGG, DDP, ADM BWF/Atmos, MQA, ALAC), 특별 요구사항. Intent Defaults: 새 트랙을 위한 사전 선택된 감성 태그. Distribution Metadata: 배포사, 레코드 레이블, 저작권자, 언어, 기본 장르, 권리 및 퍼블리싱 연락처. Payment Defaults: 결제 상태, 통화, 결제 메모. 템플릿에서 릴리스를 생성하면 이 모든 기본값이 자동으로 적용됩니다.",
        "mockup": "template-contents"
      },
      {
        "heading": "템플릿 만들기 및 관리하기",
        "body": "템플릿을 만드는 두 가지 방법이 있습니다. 릴리스 상세 페이지에서 헤더의 \"Save as Template\" 버튼(설정 톱니바퀴 옆)을 클릭하여 해당 릴리스의 현재 구성을 저장할 수 있습니다. 또는 [템플릿](/app/templates) 페이지에서 \"+ New Template\"을 클릭하여 전체 템플릿 양식으로 처음부터 만들 수 있습니다. [템플릿](/app/templates) 페이지의 각 템플릿 카드에는 이름, 설명, 요약(예: \"Single, Stereo + Atmos, 96 kHz / 24-bit, 4 delivery formats\")이 표시됩니다. 템플릿 카드의 점 세 개 메뉴에서 편집이나 삭제 등의 옵션을 사용할 수 있습니다. \"Stereo Master\"나 \"Atmos EP\"와 같이 설명적인 이름을 지정하여 정리하세요.",
        "mockup": "template-create"
      },
      {
        "heading": "템플릿에서 릴리스 만들기",
        "body": "[대시보드](/app)에서 새 릴리스를 만들 때, 저장된 템플릿이 있으면 첫 단계로 \"템플릿에서 시작\" 선택기가 표시됩니다. \"릴리스 설정을 미리 채우거나 처음부터 시작하세요.\"라고 안내됩니다. 템플릿 카드를 선택하고 \"Use Template\"을 클릭하면 해당 설정으로 새 릴리스 양식이 미리 채워집니다. \"Start from scratch\"를 클릭하면 건너뛸 수 있습니다. 릴리스 생성 양식 하단에는 \"Change template\" 링크가 있어 전환할 수 있습니다. 릴리스 생성 후 템플릿 설정을 언제든 수정할 수 있습니다.",
        "tip": "가장 자주 사용하는 템플릿을 기본값으로 설정(\"기본 템플릿으로 설정\" 체크박스)하면 새 릴리스를 만들 때 자동으로 선택됩니다.",
        "mockup": "template-use"
      }
    ]
  },
  {
    "id": "payment-tracking",
    "title": "결제 추적",
    "category": "releases",
    "summary": "릴리스 전체의 수수료, 결제, 미수금 잔액을 추적합니다.",
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
        "heading": "결제 추적 활성화",
        "body": "[설정](/app/settings)으로 이동하여 결제 추적 섹션을 찾습니다. 이 섹션에는 \"릴리스와 트랙의 수수료 및 결제 상태를 추적합니다. 자신의 프로젝트를 믹싱하는 경우 이 기능을 끄세요.\"라고 안내되어 있습니다. \"결제 추적 활성화\" 토글을 켭니다. 활성화되면 앱 전체에 결제 관련 기능이 나타납니다: [대시보드](/app)의 수수료 통계(미수금, 수금 완료, 전체 수수료), 각 릴리스의 인스펙터 사이드바에 결제 섹션, 사이드바 내비게이션에 [결제](/app/payments) 페이지가 추가됩니다.",
        "mockup": "payment-dashboard"
      },
      {
        "heading": "릴리스 수수료 설정",
        "body": "릴리스 설정을 엽니다(릴리스의 톱니바퀴 아이콘 클릭). 결제 섹션까지 스크롤합니다. 결제 상태를 설정합니다: No Fee, Unpaid, Partial, Paid. Payment Notes 텍스트 영역을 사용하여 조건, 계약금 정보, 기한을 기록합니다. 수수료 금액 및 결제 정보는 릴리스 상세 페이지의 인스펙터 사이드바 결제 섹션에서도 확인할 수 있으며, 상태를 클릭하여 빠르게 변경할 수 있습니다.",
        "mockup": "payment-release-fees"
      },
      {
        "heading": "결제 대시보드",
        "body": "사이드바에서 [결제](/app/payments) 페이지에 접근합니다. 상단의 세 가지 요약 카드에는 미수금(미결제 합계), 수금 완료(결제 완료 합계), 전체 수수료가 모든 릴리스에 걸쳐 각각의 릴리스 수와 함께 표시됩니다. 아래에는 결제 데이터가 있는 모든 릴리스가 테이블로 나열됩니다: 릴리스 이름, 날짜, 아티스트, 수수료, 결제 완료, 잔액, 상태(\"Partial\"이 주황색 등으로 색상 뱃지 표시). 하단의 합계 행에서 모든 수수료를 합산합니다. \"Export CSV\" 버튼을 사용하여 결제 데이터를 스프레드시트로 다운로드하거나, \"Download PDF\"로 인쇄용 결제 요약을 생성할 수 있습니다.",
        "tip": "[대시보드](/app)에서 미수금 또는 수금 완료 통계 카드를 클릭하면 해당 결제 상태의 릴리스만 빠르게 필터링할 수 있습니다.",
        "mockup": "payment-track-fees"
      }
    ]
  },
  {
    "id": "distribution-tracker",
    "title": "배포 트래커",
    "category": "releases",
    "summary": "릴리스가 제출된 곳을 추적하고, 플랫폼 전체의 상태를 모니터링하고, Spotify에 게시되면 알림을 받습니다.",
    "tags": ["distribution", "tracker", "spotify", "apple music", "platform", "status", "live", "submitted"],
    "updatedAt": "2026-03-14",
    "content": [
      {
        "heading": "릴리스에 플랫폼 추가하기",
        "body": "릴리스를 열고 트랙 목록 아래의 Distribution Tracker 패널까지 스크롤합니다. \"+ Add Platform\"을 클릭하여 스트리밍 플랫폼을 추가합니다. Spotify, Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud, Bandcamp 중에서 선택할 수 있습니다. 각 플랫폼은 공식 로고, 상태 표시기, 배포사 태그가 있는 행으로 표시됩니다. \"Mark as Submitted\"를 사용하여 여러 플랫폼을 한 번에 추가할 수도 있습니다. 배포사(DistroKid, TuneCore, CD Baby, LANDR, Ditto, AWAL, UnitedMasters, Amuse, RouteNote, Self-released)를 선택하고, 제출한 플랫폼을 체크한 후 Submit을 클릭합니다.",
        "mockup": "distribution-add-platform"
      },
      {
        "heading": "상태 유형",
        "body": "각 플랫폼 항목에는 릴리스 파이프라인에서의 현재 위치를 추적하는 상태가 있습니다. 6가지 상태는 다음과 같습니다: Not Submitted(회색, 새로 추가된 플랫폼의 기본값), Submitted(파란색, 배포사에 릴리스를 전송함), Processing(주황색, 배포사가 검토 또는 처리 중), Live(녹색, 플랫폼에서 릴리스 공개 중), Rejected(빨간색, 플랫폼 또는 배포사가 릴리스를 거부함), Taken Down(빨간색, 이전에 공개되었으나 삭제됨). 플랫폼 행의 상태 표시기를 클릭하여 변경할 수 있습니다. 상태 변경은 플랫폼 기록에 기록되므로 각 전환이 언제 발생했는지 확인할 수 있습니다.",
        "mockup": "distribution-status"
      },
      {
        "heading": "Spotify 자동 감지",
        "body": "Spotify는 Distribution Tracker 최상단에 \"자동 업데이트\" 라벨과 함께 표시됩니다. Spotify를 Submitted로 표시하면, Mix Architect가 ISRC 코드(트랙의 Distribution 탭에서 가져옴) 또는 릴리스 제목과 아티스트 이름을 사용하여 Spotify 카탈로그를 주기적으로 확인합니다. Spotify에서 릴리스가 발견되면 상태가 자동으로 Live로 변경되고, Spotify URL이 저장되며, 알림을 받게 됩니다. \"Check Now\"를 클릭하여 즉시 확인을 실행할 수도 있습니다. 자동 감지는 모든 Submitted 상태의 Spotify 항목에 대해 매일 실행됩니다.",
        "tip": "제출 전에 트랙의 Distribution 탭에서 ISRC 코드를 입력하세요. ISRC 기반 감지가 제목/아티스트 매칭보다 더 신뢰할 수 있으며, 특히 흔한 이름의 경우 더욱 그렇습니다.",
        "mockup": "distribution-spotify"
      },
      {
        "heading": "상태 업데이트 및 링크 추가",
        "body": "플랫폼의 상태를 변경하려면 플랫폼 행의 상태 표시기를 클릭합니다. 새 상태를 선택할 수 있는 상태 필 행이 나타납니다. 해당 플랫폼에서의 릴리스 링크를 추가하려면 플랫폼 이름 옆의 \"Add link\"를 클릭합니다. URL(예: Spotify 앨범 링크 또는 Apple Music 페이지)을 입력하고 저장을 클릭합니다. 링크 아이콘이 클릭 가능한 외부 링크로 바뀌어 해당 플랫폼의 릴리스 페이지를 열 수 있습니다. 플랫폼 행의 점 세 개 메뉴에서 세부 정보 편집, 플랫폼 제거, 상태 변경 기록 보기 등의 추가 옵션을 사용할 수 있습니다.",
        "mockup": "distribution-edit"
      },
      {
        "heading": "일괄 제출 및 새로고침",
        "body": "\"Mark as Submitted\"를 사용하면 배포사에 대한 일괄 제출을 기록할 수 있습니다. 드롭다운에서 배포사를 선택하고, 제출한 플랫폼을 체크한 후 Submit을 클릭합니다. 선택한 모든 플랫폼이 Submitted 상태와 배포사 태그와 함께 추가됩니다. \"Check Now\"는 Submitted 상태의 Spotify 항목에 표시됩니다. 클릭하면 Spotify 카탈로그 즉시 검색이 실행됩니다. 발견되면 상태가 Live로 업데이트되고 URL이 자동으로 저장됩니다. 다른 모든 플랫폼(Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud, Bandcamp)의 경우, 릴리스가 공개된 것을 확인한 후 수동으로 상태를 업데이트하세요.",
        "mockup": "distribution-bulk"
      },
      {
        "heading": "배포사 태그",
        "body": "각 플랫폼 항목에는 제출에 사용한 서비스(DistroKid, TuneCore, CD Baby 등)를 표시하는 배포사 태그를 지정할 수 있습니다. 이 태그는 상태 표시기 옆에 작은 필로 표시됩니다. 배포사 태그는 \"Mark as Submitted\" 사용 시 자동으로 설정되며, 플랫폼 항목 편집 시 개별적으로 설정할 수도 있습니다. 이를 통해 특히 지역이나 플랫폼별로 다른 배포사를 사용하는 경우, 어떤 배포사가 어떤 플랫폼을 담당했는지 추적할 수 있습니다.",
        "warning": "애널리틱스는 Mix Architect에서 추적한 데이터만 반영합니다. 배포사의 대시보드에서 직접 제출한 경우, 트래커의 정확성을 유지하기 위해 여기에서 상태를 업데이트하는 것을 잊지 마세요.",
        "mockup": "distribution-distributor"
      }
    ]
  },
  {
    "id": "user-analytics",
    "title": "사용자 애널리틱스",
    "category": "releases",
    "summary": "완료된 릴리스 수, 평균 처리 시간, 총 수익, 클라이언트별 분석을 애널리틱스 대시보드에서 확인합니다.",
    "tags": ["analytics", "dashboard", "revenue", "turnaround", "velocity", "clients", "charts"],
    "updatedAt": "2026-03-14",
    "content": [
      {
        "heading": "애널리틱스 페이지 개요",
        "body": "사이드바에서 [애널리틱스](/app/analytics) 페이지에 접근합니다. 대시보드 상단에 네 가지 요약 카드가 표시됩니다: 완료된 릴리스(총 완료 프로젝트 수와 월평균), 평균 처리 시간(생성에서 완료까지의 일수, 최단 및 최장 분석 포함), 총 수익(추적된 모든 수수료의 합계와 미수금 잔액), 클라이언트(고유 클라이언트 수와 총 릴리스 수). 요약 카드 아래에는 시간에 따른 데이터를 시각화하는 세 개의 차트와 클라이언트별 통계를 보여주는 클라이언트 분석 테이블이 있습니다.",
        "mockup": "analytics-overview"
      },
      {
        "heading": "릴리스 속도 및 처리 시간",
        "body": "릴리스 속도 차트는 선택한 기간 내 월별 완료 릴리스 수를 보여주는 막대 차트입니다. 막대가 높을수록 더 생산적인 달이었음을 의미합니다. 이를 사용하여 산출량의 추세를 파악하고 바쁜 기간이나 한가한 기간을 식별할 수 있습니다. 처리 시간 차트는 월별 릴리스 생성에서 완료까지의 평균 일수를 보여줍니다. 막대가 낮을수록 더 빠른 납품을 의미합니다. 이 두 차트를 함께 보면 자신의 처리 능력과 워크플로가 시간이 지남에 따라 빨라지고 있는지 느려지고 있는지 이해할 수 있습니다.",
        "mockup": "analytics-velocity"
      },
      {
        "heading": "수익 차트",
        "body": "수익 차트는 월별 총 수수료 수입을 보여주는 영역 차트입니다. 릴리스에 기록된 결제 금액을 추적하므로 클라이언트가 실제로 지불한 금액을 반영합니다. 이를 사용하여 수입 추세를 파악하고, 가장 높은 수입을 올린 달을 식별하고, 한가한 기간에 대비할 수 있습니다. 수익 데이터는 각 릴리스의 결제 추적 기능에서 가져오므로, 정확한 보고를 위해 수수료와 결제 상태를 최신 상태로 유지하세요.",
        "mockup": "analytics-revenue"
      },
      {
        "heading": "클라이언트 분석",
        "body": "애널리틱스 페이지 하단의 클라이언트 분석 테이블에는 모든 클라이언트의 주요 지표가 나열됩니다: 릴리스 수, 총 수익, 결제 완료 금액, 평균 처리 시간. 이를 통해 가장 많은 작업과 수익을 가져오는 클라이언트, 제때 결제하는 클라이언트, 시간이 어디에 소요되는지 파악할 수 있습니다. 클라이언트 행을 클릭하면 해당 클라이언트의 릴리스를 확인할 수 있습니다. 테이블은 기본적으로 수익순으로 정렬됩니다.",
        "mockup": "analytics-clients"
      },
      {
        "heading": "기간 선택기",
        "body": "오른쪽 상단의 기간 선택기를 사용하여 애널리틱스의 대상 기간을 제어합니다. 프리셋 범위에는 최근 7일, 최근 30일, 최근 90일, 최근 365일이 있습니다. 특정 시작일과 종료일을 선택하여 사용자 지정 기간을 설정할 수도 있습니다. 네 가지 요약 카드와 세 가지 차트 모두가 선택한 기간을 반영하여 업데이트됩니다. 기간 선택기는 애널리틱스 대시보드 전체에서 동일하게 작동합니다.",
        "tip": "연간 검토 및 세금 준비에는 365일 범위를 사용하세요. 30일 범위는 매월 비즈니스 건전성을 점검하는 데 유용합니다.",
        "mockup": "analytics-date-range"
      }
    ]
  },
  {
    "id": "upload-audio-tracks",
    "title": "오디오 업로드 및 관리",
    "category": "audio",
    "summary": "오디오 파일 업로드, 버전 관리, 파형 플레이어 사용 방법을 안내합니다.",
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
        "heading": "오디오 업로드",
        "body": "트랙을 열고 Audio 탭으로 이동합니다. 업로드 영역을 클릭하거나 파일을 직접 드래그 앤 드롭합니다. 지원 포맷: WAV, AIFF, FLAC, MP3, AAC, M4A, 파일당 최대 500 MB. 파일은 안전한 클라우드 스토리지에 업로드되며, 파형 시각화가 자동으로 생성됩니다. 파일 메타데이터(포맷, 샘플 레이트, 비트 뎁스, 길이)가 캡처되어 버전 정보 아래에 표시됩니다. 예: \"Typical Wonderful 2025-10-10 MGO.wav, WAV, 48kHz, 24-bit\".",
        "mockup": "audio-upload"
      },
      {
        "heading": "트랙 버전",
        "body": "같은 트랙에 새 파일을 업로드할 때마다 다음 버전이 됩니다. 파형 위의 버전 선택기에는 번호가 매겨진 버튼(v1, v2, v3 등)과 다른 버전을 업로드하는 + 버튼이 표시됩니다. 버전을 클릭하여 전환합니다. 각 버전에는 버전 번호, 업로드 날짜, 댓글 수, 원본 파일 다운로드 아이콘이 표시됩니다. 이전 버전은 댓글과 파형이 완전히 보존됩니다.",
        "tip": "새 트랙을 만드는 대신 같은 트랙에 수정된 믹스를 업로드하세요. 버전 기록이 깔끔하게 유지되고, 이전 버전의 댓글이 보존되며, 시간에 따른 믹스 비교가 가능합니다.",
        "mockup": "track-versions"
      },
      {
        "heading": "파형 플레이어",
        "body": "업로드된 모든 버전에는 인터랙티브 파형이 표시됩니다. 파형의 아무 곳이나 클릭하여 해당 위치로 이동합니다. 파형 아래의 전송 컨트롤에는 현재 시간, 루프 토글, 뒤로 건너뛰기, 재생/일시정지, 앞으로 건너뛰기, 반복 토글, 전체 길이가 포함됩니다. 플레이어에는 파일 메타데이터 옆에 통합 LUFS 라우드니스 측정값(예: \"-14.8 LUFS\")이 라우드니스 목표에 따라 색상으로 표시되어 레벨을 한눈에 평가할 수 있습니다. 현재 버전에 타임스탬프 댓글이 있으면 파형 위에 해당 위치에 작은 마커 아이콘이 표시됩니다.",
        "mockup": "track-tab-audio"
      }
    ]
  },
  {
    "id": "audio-converter",
    "title": "납품 포맷 및 변환",
    "category": "audio",
    "summary": "납품 포맷을 설정하고, 오디오를 변환하고, 아티스트, 커버 아트, ISRC, 가사 등의 메타데이터 태그를 자동으로 임베딩합니다.",
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
        "heading": "납품 포맷 설정",
        "body": "트랙을 열고 Specs 탭으로 이동합니다. Delivery 섹션까지 스크롤합니다. 포맷 칩을 클릭하여 프로젝트에 필요한 출력 포맷을 선택합니다. 사용 가능한 변환 포맷: WAV, AIFF, FLAC, MP3, AAC, OGG, ALAC. 선택된 포맷은 체크마크 아이콘과 함께 녹색으로 강조 표시됩니다. 추가 변환 불가능 포맷(DDP, ADM BWF/Atmos, MQA)은 참조용으로 토글할 수 있으며, 자동 변환이 불가능하다는 정보 툴팁이 표시됩니다. \"Custom format...\" 입력 필드에 사용자 정의 포맷 이름을 입력하고 \"+ Add\"를 클릭하여 목록에 없는 포맷을 추가할 수도 있습니다. \"Export from\" 드롭다운을 사용하여 변환할 오디오 버전을 선택합니다(예: \"v3 - filename.wav (latest)\").",
        "mockup": "format-convert"
      },
      {
        "heading": "변환 및 다운로드",
        "body": "Delivery 섹션에서 포맷 칩을 클릭하여 사용 가능한 포맷을 선택합니다: 변환 가능 포맷에는 WAV, AIFF, FLAC, MP3, AAC, OGG, ALAC이 있습니다. 선택된 포맷은 체크마크와 함께 녹색으로 강조 표시됩니다. 선택된 변환 가능 포맷 옆의 다운로드 화살표 아이콘을 클릭하면 변환이 시작됩니다. 변환이 진행되는 동안 아이콘이 스피너로 표시됩니다. 변환이 완료되면 파일이 자동으로 브라우저에 다운로드됩니다. 각 변환은 \"Export from\" 드롭다운에서 선택한 오디오 버전을 사용하며, 최대 오디오 품질을 유지하기 위해 원본 업로드 파일에서 변환합니다. 무손실 포맷(WAV, AIFF, FLAC, ALAC)은 소스 파일의 샘플 레이트와 비트 뎁스를 유지합니다. 손실 포맷은 최적화된 프리셋을 사용합니다: MP3는 44.1 kHz / 320 kbps, AAC는 44.1 kHz / 256 kbps, OGG는 44.1 kHz / Quality 8로 내보냅니다.",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "자동 메타데이터 임베딩",
        "body": "MP3, FLAC, AAC, OGG, ALAC으로 변환할 때 Mix Architect는 출력 파일에 업계 표준 메타데이터 태그를 자동으로 기록합니다. 여기에는 아티스트, 제목, 앨범, 트랙 번호, 장르, 발매 연도, 저작권, ISRC, UPC/바코드, 가사, 커버 아트, ReplayGain이 포함됩니다. ReplayGain은 호환 플레이어에 볼륨을 얼마나 조절해야 하는지 알려주는 라우드니스 태그로, 트랙이 클리핑 없이 일관된 레벨로 재생됩니다. Mix Architect는 ReplayGain 2.0 표준(기준 레벨 -18 LUFS)을 사용하여 오디오의 측정된 LUFS에서 이를 계산합니다. MP3 파일은 ID3v2 태그를, FLAC과 OGG는 Vorbis comments를, AAC/ALAC은 iTunes 스타일 MP4 atoms를 사용합니다. 모든 메타데이터는 릴리스 및 트랙 세부 정보(ISRC 및 가사를 위한 Distribution 탭, 릴리스 커버 아트 포함)에서 가져옵니다. WAV 및 AIFF 내보내기에는 메타데이터 태그가 포함되지 않습니다. 변환이 완료되면 포맷 칩 옆의 태그 아이콘 위에 마우스를 올려 임베딩된 태그를 정확히 확인할 수 있습니다.",
        "tip": "내보내기 전에 Distribution 탭(ISRC, 가사)을 작성하고 커버 아트를 업로드하세요. 더 많은 메타데이터를 제공할수록 내보낸 파일이 배포에 더 완벽해집니다."
      },
      {
        "heading": "지원 포맷 참조",
        "body": "무손실 포맷은 소스 품질을 유지합니다: WAV(PCM, 소스 레이트/뎁스), AIFF(PCM, 소스 레이트/뎁스), FLAC(소스 레이트), ALAC(소스 레이트). 손실 포맷은 배포에 최적화된 고정 프리셋을 사용합니다: MP3(44.1 kHz, 320 kbps, 스테레오), AAC(44.1 kHz, 256 kbps, 스테레오), OGG Vorbis(44.1 kHz, quality 8, 스테레오). 변환 불가능 포맷(태그만 가능, 자동 변환 없음): DDP, ADM BWF(Atmos), MQA. Specs 탭 상단의 Technical Settings(샘플 레이트 및 비트 뎁스)는 소스 오디오를 설명하는 참조 메타데이터이며 변환 출력을 제어하지 않습니다. 납품 포맷 아래의 Special Requirements 텍스트 영역에서 납품 지침에 대한 메모를 추가할 수 있습니다.",
        "warning": "손실 포맷(MP3, AAC, OGG)에서 무손실 포맷(WAV, FLAC)으로 변환해도 오디오 품질이 향상되지 않습니다. 원래의 압축 아티팩트가 그대로 남습니다. 항상 최고 품질의 소스 파일을 업로드하세요.",
        "mockup": "supported-formats"
      }
    ]
  },
  {
    "id": "audio-review-comments",
    "title": "타임스탬프 댓글 남기기",
    "category": "audio",
    "summary": "파형에 직접 시간 코드 피드백을 추가하여 협력자가 정확히 어디를 들어야 하는지 알려줍니다.",
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
        "heading": "댓글 추가하기",
        "body": "트랙을 열고 Audio 탭으로 이동합니다. 참조하려는 정확한 지점에서 파형을 더블클릭합니다. 파형 아래 Feedback 섹션에 댓글을 입력할 수 있는 텍스트 입력란이 나타납니다. 댓글은 해당 타임코드와 버전에 연결됩니다. Feedback 섹션에서 각 댓글에는 작성자 이름, 색상이 있는 타임스탬프 뱃지(예: \"0:07\" 또는 \"1:22\"), 상대적 날짜, 메시지 텍스트가 표시됩니다. 댓글 마커는 파형 위에 해당 위치에 작은 아이콘으로도 표시됩니다. 타임스탬프를 클릭하면 재생 헤드가 해당 시점으로 이동합니다.",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "포털 댓글",
        "body": "포털을 통해 검토하는 클라이언트도 파형에 타임스탬프 댓글을 남길 수 있습니다. 클라이언트의 댓글은 팀 댓글과 함께 같은 Feedback 섹션에 표시되지만, \"Client\" 뱃지로 시각적으로 구분되어 외부 피드백을 빠르게 식별할 수 있습니다. 이를 통해 내부 및 외부의 모든 피드백이 관련 오디오 버전 아래 한 곳에 정리됩니다.",
        "mockup": "portal-comments"
      },
      {
        "heading": "Notes vs Audio 댓글",
        "body": "Audio 탭은 파형의 특정 시점에 연결된 타임스탬프 피드백용입니다: \"1:22에서 보컬을 올려주세요\" 또는 \"여기서 스네어가 너무 큽니다\". Notes 탭은 타임코드에 연결되지 않은 일반적인 토론 및 리비전 노트용입니다: \"전체적으로 믹스에 저음이 더 필요합니다\" 또는 \"클라이언트가 더 공격적인 접근을 원합니다\". Audio 댓글은 버전별(v1, v2 등에 연결)이며, Notes는 트랙 전체에 적용됩니다. 전반적인 크리에이티브 비전, 감성 태그, 레퍼런스 트랙을 문서화하려면 Intent 탭을 사용하세요.",
        "tip": "트랙에 대한 피드백을 완전히 파악하려면 Audio 탭의 Feedback 섹션(시간별 노트)과 Notes 탭(일반 토론) 모두 확인하세요. 클라이언트 피드백은 두 곳 모두에 있을 수 있습니다.",
        "mockup": "resolve-feedback"
      }
    ]
  },
  {
    "id": "timeline-overview",
    "title": "타임라인 보기 사용하기",
    "category": "timeline",
    "summary": "대시보드에서 타임라인 보기로 전환하여 릴리스 일정을 시각화하고 발매일까지의 카운트다운을 확인합니다.",
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
        "heading": "타임라인 보기로 전환",
        "body": "[대시보드](/app)에서 헤더 영역(결제 통계 아래)의 두 가지 보기 전환 버튼을 찾습니다. 타임라인 아이콘(두 번째 버튼)을 클릭하면 그리드 보기에서 타임라인 보기로 전환됩니다. 타임라인은 목표 발매일을 기준으로 릴리스를 시간순으로 표시합니다. 목표일이 없는 릴리스는 하단의 별도 \"미예정\" 섹션에 나타납니다. 보기 설정은 자동으로 저장되므로 다음 방문 시에도 선택이 유지됩니다.",
        "mockup": "timeline-full"
      },
      {
        "heading": "타임라인 읽기",
        "body": "각 릴리스는 목표 발매일에 맞춰 위치한 카드로 표시됩니다. 타임라인에는 카운트다운이 표시됩니다: 다가오는 날짜에는 \"발매까지 X일\", 지난 날짜에는 \"X일 전 발매\"로 나타납니다. 릴리스 카드에는 그리드 보기와 동일한 정보(제목, 아티스트, 상태, 포맷, 트랙 수)와 함께 일정 맥락이 표시됩니다. 상태 점은 색상으로 구분됩니다: Draft는 주황색, In Progress는 파란색, Ready는 녹색. 고정된 릴리스는 타임라인 상단에 나타납니다.",
        "mockup": "timeline-navigate"
      },
      {
        "heading": "목표일 설정",
        "body": "릴리스를 타임라인에 추가하려면 릴리스 생성 시 또는 릴리스 설정(릴리스 페이지의 톱니바퀴 아이콘)에서 목표 발매일을 설정합니다. 목표 발매일 필드에서는 날짜 선택기를 사용합니다. 날짜를 조정하면 타임라인이 자동으로 업데이트됩니다. 이를 통해 일정을 시각화하고 여러 프로젝트 간의 발매 시기 겹침을 방지할 수 있습니다.",
        "tip": "기획 단계에서 타임라인 보기를 사용하여 릴리스 간격을 조정하세요. 다가오는 마감일을 명확히 볼 수 있어 믹싱, 마스터링, 배포 워크플로에서 병목 현상을 방지하는 데 도움이 됩니다.",
        "mockup": "timeline-dates"
      }
    ]
  },
  {
    "id": "export-data",
    "title": "계정 데이터 내보내기",
    "category": "account",
    "summary": "릴리스, 트랙, 오디오 파일, 결제 기록을 포함한 전체 ZIP 내보내기를 다운로드합니다.",
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
        "heading": "포함 항목",
        "body": "데이터 내보내기는 모든 릴리스 메타데이터, 트랙 세부 정보, 오디오 파일(모든 버전), 결제 기록이 포함된 ZIP 파일입니다. 다운로드 전에 앱에서 내보내기 크기 예상치와 개수(릴리스 수, 트랙 수, 오디오 파일 수)가 표시됩니다. 이를 통해 계정의 모든 항목을 완전히 백업할 수 있습니다.",
        "mockup": "export-contents"
      },
      {
        "heading": "내보내기 시작",
        "body": "[설정](/app/settings)으로 이동하여 \"내 데이터\" 섹션까지 스크롤합니다. \"Export My Data\"를 클릭하여 시작합니다. 앱에서 먼저 대략적인 파일 크기와 개수(예: \"3개 릴리스, 12개 트랙, 8개 오디오 파일\")를 보여주는 예상치를 계산합니다. 예상치를 확인한 후 \"Download\"를 클릭하여 내보내기를 시작합니다. 진행률 표시줄에 다운로드 상태가 나타납니다. 오디오 파일이 많은 대규모 계정의 경우 시간이 걸릴 수 있습니다. 완료되면 ZIP 파일이 자동으로 브라우저에 다운로드됩니다. \"Cancel\"을 클릭하면 다운로드 없이 돌아갈 수 있습니다.",
        "mockup": "export-progress"
      },
      {
        "heading": "데이터 프라이버시",
        "body": "내보내기에는 사용자가 소유하거나 생성한 데이터만 포함됩니다. 협력자의 기여(릴리스에 대한 댓글 등)는 포함되지만, 다른 사용자의 개인 데이터는 포함되지 않습니다. 내보내기는 요청 시 생성되며 다운로드 후 서버에 저장되지 않습니다.",
        "tip": "프로젝트와 오디오 파일의 백업으로 정기적으로 데이터 내보내기를 실행하세요. 계정에 큰 변경을 가하기 전에 특히 유용합니다.",
        "mockup": "export-privacy"
      }
    ]
  },
  {
    "id": "manage-subscription",
    "title": "Pro 구독 관리",
    "category": "billing",
    "summary": "플랜을 확인하고, 결제 정보를 업데이트하고, Stripe를 통해 Pro 구독을 관리합니다.",
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
        "heading": "플랜 확인",
        "body": "[설정](/app/settings)으로 이동하여 하단의 구독 섹션까지 스크롤합니다. \"Mix Architect 플랜을 관리하세요.\"라고 표시됩니다. 현재 플랜을 확인할 수 있습니다: Pro 계정에는 녹색 \"PRO\" 뱃지와 함께 \"$14/month, Unlimited releases\"가 표시되며 \"Manage Billing\" 버튼이 있습니다. 무료 계정에는 \"Upgrade to Pro\" 버튼이 대신 표시됩니다.",
        "mockup": "plan-current"
      },
      {
        "heading": "Pro로 업그레이드",
        "body": "[설정](/app/settings) 페이지의 구독 섹션에서 \"Upgrade to Pro\"를 클릭합니다. 안전한 Stripe 결제 페이지로 이동합니다. 결제가 확인되면 계정이 즉시 업그레이드되며 무제한 릴리스 및 오디오 변환을 포함한 모든 Pro 기능에 접근할 수 있습니다. 플랜 정보 옆에 Pro 뱃지가 나타납니다.",
        "mockup": "upgrade-pro"
      },
      {
        "heading": "결제 관리",
        "body": "[설정](/app/settings)의 구독 섹션에서 \"Manage Billing\"을 클릭하면 Stripe 청구 포털이 열립니다. 여기에서 결제 수단을 업데이트하고, 인보이스를 확인하고, 영수증을 다운로드할 수 있습니다. 모든 결제 처리는 Stripe에서 안전하게 처리됩니다.",
        "mockup": "manage-payment"
      }
    ]
  },
  {
    "id": "cancel-resubscribe",
    "title": "구독 취소 및 재가입",
    "category": "billing",
    "summary": "Pro 구독을 취소하는 방법과 데이터에 미치는 영향을 안내합니다.",
    "tags": [
      "cancel",
      "resubscribe",
      "downgrade",
      "billing"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "구독 취소",
        "body": "[설정](/app/settings)의 구독 섹션에서 \"Manage Billing\"을 클릭하여 Stripe 포털을 열고 \"Cancel plan\"을 클릭합니다. Pro 접근은 현재 결제 기간이 끝날 때까지 유지됩니다. [설정](/app/settings)에 Pro 플랜 만료일이 표시되어 접근이 얼마나 남았는지 정확히 알 수 있습니다.",
        "mockup": "cancel-subscription"
      },
      {
        "heading": "데이터는 어떻게 되나요",
        "body": "모든 릴리스, 트랙, 오디오 파일, 댓글, 결제 기록이 완전히 보존됩니다. 다운그레이드 시 아무것도 잃지 않습니다. 다만 Pro 기능(무제한 릴리스, 오디오 변환 등)은 재가입할 때까지 사용할 수 없게 됩니다. 기존 릴리스에는 계속 접근할 수 있습니다.",
        "warning": "무료 계정은 활성 릴리스가 1개로 제한됩니다. Pro 플랜 만료 시 릴리스가 2개 이상인 경우, 기존 릴리스는 보존되지만 재가입하거나 릴리스를 1개로 줄일 때까지 새 릴리스를 만들 수 없습니다.",
        "mockup": "data-after-cancel"
      },
      {
        "heading": "재가입",
        "body": "Pro를 다시 활성화하려면 [설정](/app/settings)의 구독 섹션에서 \"Upgrade to Pro\"를 다시 클릭하거나, \"Manage Billing\"을 사용하여 Stripe 포털을 통해 재가입합니다. 이전 데이터, 설정, 템플릿, 팀 구성이 모두 그대로 유지되며 즉시 사용할 수 있습니다.",
        "mockup": "resubscribe"
      }
    ]
  }
];
