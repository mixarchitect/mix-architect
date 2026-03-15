import type { HelpArticle } from "./types";

export const articles: HelpArticle[] = [
  {
    "id": "getting-started-overview",
    "title": "Mix Architect में आपका स्वागत है",
    "category": "getting-started",
    "summary": "प्लेटफ़ॉर्म का एक त्वरित परिचय: आपका डैशबोर्ड, रिलीज़, ट्रैक और collaboration टूल्स।",
    "tags": [
      "overview",
      "intro",
      "dashboard",
      "getting started"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "आपका डैशबोर्ड",
        "body": "साइन इन करने के बाद आप [डैशबोर्ड](/app) पर पहुँचते हैं। यह आपकी सभी रिलीज़ को एक responsive grid में दिखाता है, जो सबसे हालिया गतिविधि के अनुसार क्रमबद्ध होती हैं। हर रिलीज़ कार्ड पर cover art, शीर्षक, artist का नाम, status dot (Draft के लिए नारंगी, In Progress के लिए नीला, या Ready के लिए हरा), release type pill (Single, EP या Album), format pill (Stereo, Dolby Atmos या Stereo + Atmos) और ट्रैक पूर्णता की गिनती जैसे \"6 में से 1 ट्रैक briefed\" दिखाई देती है। अगर [payment tracking](/app/settings) सक्षम है, तो आपको शीर्ष पर भुगतान सारांश भी दिखेगा: Outstanding, Earned और Total fees सभी रिलीज़ के लिए, साथ ही [Payments](/app/payments) पेज का \"सभी देखें\" लिंक। किसी भी रिलीज़ कार्ड पर pin आइकन का उपयोग करके उसे डैशबोर्ड के शीर्ष पर पिन करें, और त्वरित कार्रवाइयों के लिए three-dot मेनू का उपयोग करें। sort dropdown से आप रिलीज़ को Last Modified, Title या Date Created के अनुसार क्रमबद्ध कर सकते हैं।",
        "mockup": "dashboard"
      },
      {
        "heading": "Grid view बनाम Timeline view",
        "body": "डैशबोर्ड हेडर में दो view toggle बटन हैं: Grid और Timeline। Grid view (डिफ़ॉल्ट) आपकी रिलीज़ को responsive grid में कार्ड के रूप में दिखाता है। Timeline view रिलीज़ को उनकी target release dates के आधार पर कालानुक्रमिक रूप से व्यवस्थित करता है, countdown और शेड्यूलिंग जानकारी दिखाता है। आपकी view प्राथमिकता स्वचालित रूप से सहेजी जाती है। अधिक जानें [Timeline View का उपयोग करना](/app/help?article=timeline-overview) में।"
      },
      {
        "heading": "ऐप में नेविगेशन",
        "body": "साइडबार (डेस्कटॉप) या bottom bar (मोबाइल) आपको ऐप के हर सेक्शन तक त्वरित पहुँच देता है: [डैशबोर्ड](/app) आपकी रिलीज़ के लिए, Search (या Cmd+K / Ctrl+K) किसी भी रिलीज़ या ट्रैक पर तुरंत जाने के लिए, [Templates](/app/templates) पुन: उपयोग योग्य release presets के लिए, [Payments](/app/payments) fee tracking के लिए (अगर सक्षम है), [Settings](/app/settings) आपकी प्रोफ़ाइल, defaults और subscription के लिए, और [Help](/app/help) documentation के लिए। साइडबार में Notifications भी हैं गतिविधि अपडेट के लिए, Auto ऑटोमेशन सुविधाओं के लिए, और Sign Out। Light, Dark और System मोड के बीच थीम स्विचिंग [Settings](/app/settings) में Appearance के अंतर्गत उपलब्ध है।",
        "tip": "ऐप में कहीं से भी Cmd+K (Mac) या Ctrl+K (Windows) दबाएँ, किसी भी रिलीज़ या ट्रैक को तुरंत खोजने और उस पर जाने के लिए।",
        "mockup": "nav-rail"
      },
      {
        "heading": "मुख्य अवधारणाएँ",
        "body": "Releases आपके शीर्ष-स्तरीय प्रोजेक्ट हैं (albums, EPs या singles)। प्रत्येक रिलीज़ में एक या अधिक ट्रैक होते हैं। डेस्कटॉप पर, release detail पेज में दो-कॉलम लेआउट होता है: बाईं ओर ट्रैक सूची और दाईं ओर एक inspector साइडबार जो cover art, Release Info (artist, type, format, status, target date, genre), Global Mix Direction, Global References और Payment status दिखाता है। प्रत्येक ट्रैक में छह tabs होते हैं: Intent, Specs, Audio, Distribution, Portal और Notes। रिलीज़ हेडर में settings gear आइकन पर क्लिक करें Release Settings खोलने के लिए, जहाँ आप सभी metadata संपादित कर सकते हैं, अपनी टीम प्रबंधित कर सकते हैं और payment कॉन्फ़िगर कर सकते हैं। हेडर में Portal toggle (portal खोलने के लिंक के साथ), Save as Template और settings gear के बटन भी हैं।",
        "mockup": "key-concepts"
      }
    ]
  },
  {
    "id": "create-first-release",
    "title": "अपनी पहली रिलीज़ बनाना",
    "category": "getting-started",
    "summary": "रिलीज़ बनाने, cover art जोड़ने, ट्रैक अपलोड करने और अपना status सेट करने की चरण-दर-चरण मार्गदर्शिका।",
    "tags": [
      "create",
      "release",
      "new project",
      "setup"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "नई रिलीज़ बनाएँ",
        "body": "[डैशबोर्ड](/app) से, ऊपरी दाएँ कोने में \"+ New Release\" बटन पर क्लिक करें। अगर आपके पास सहेजे हुए [templates](/app/templates) हैं, तो पहले एक template picker दिखाया जाता है जहाँ आप एक template चुन सकते हैं या \"Start from scratch\" पर क्लिक कर सकते हैं। creation form में शीर्षक, एक वैकल्पिक artist/client नाम, release type (Single, EP या Album), format (Stereo, Dolby Atmos या Stereo + Atmos), genre tags (Rock, Pop, Hip-Hop, Electronic आदि सुझावों में से चुनें या अपने खुद के जोड़ें), और एक target release date माँगी जाती है।",
        "tip": "जब आप Single बनाते हैं, तो release title के साथ एक ट्रैक स्वचालित रूप से बन जाता है और [Settings](/app/settings) से आपके default specs लागू हो जाते हैं।",
        "mockup": "create-release"
      },
      {
        "heading": "Release Detail पेज",
        "body": "बनाने के बाद आप release detail पेज पर पहुँचते हैं। डेस्कटॉप पर इसमें दो-कॉलम लेआउट है: बाईं ओर ट्रैक सूची जिसमें \"Flow\" बटन और \"+ Add Track\" बटन हैं, और दाईं ओर एक inspector साइडबार। Inspector साइडबार cover art, Release Info (Artist, Type, Format, Status, Target Date, Genre), Global Mix Direction (अपडेट करने के लिए pencil आइकन पर क्लिक करें), और Global References (खोजने और reference tracks जोड़ने के लिए \"+ Add\" पर क्लिक करें) दिखाता है। अगर payment tracking सक्षम है, तो Payment सेक्शन साइडबार के नीचे दिखता है। Cover art जोड़ने या बदलने के लिए, साइडबार में artwork पर pencil आइकन पर क्लिक करें। इससे image के नीचे विकल्प दिखते हैं: फ़ाइल चुनने के लिए Upload बटन, Remove बटन (अगर art पहले से मौजूद है), और image को सीधे लिंक करने के लिए \"Or paste URL\" फ़ील्ड। नई रिलीज़ में \"Click to upload\" (JPEG या PNG, न्यूनतम 1400x1400) के साथ एक dashed upload एरिया दिखता है। अन्य release metadata संपादित करने के लिए, हेडर में settings gear आइकन पर क्लिक करें Release Settings खोलने के लिए।",
        "mockup": "cover-art-upload"
      },
      {
        "heading": "ट्रैक जोड़ें",
        "body": "Release detail view में, Flow बटन के बगल में हेडर में \"+ Add Track\" पर क्लिक करें। अपने ट्रैक को एक शीर्षक दें और यह [Settings](/app/settings) से आपके default specs के साथ बन जाएगा। प्रत्येक ट्रैक सूची में एक नंबर, शीर्षक, intent preview, status dot और approval badge के साथ दिखता है। आप बाईं ओर grip handle का उपयोग करके ट्रैक को drag करके पुनः क्रमबद्ध कर सकते हैं, या move up/down बटन का उपयोग कर सकते हैं। दाईं ओर trash आइकन से ट्रैक हटाएँ। किसी भी ट्रैक पर क्लिक करें उसे खोलने और उसके छह tabs में काम शुरू करने के लिए।",
        "mockup": "track-upload"
      },
      {
        "heading": "रिलीज़ Status सेट करें",
        "body": "प्रत्येक रिलीज़ का एक status होता है: Draft, In Progress या Ready। आप inspector साइडबार में Release Info सेक्शन में \"Status\" के बगल में status badge पर क्लिक करके, या Release Settings (gear आइकन) से status बदल सकते हैं। काम शुरू होने पर (उदाहरण के लिए, audio अपलोड करना या ट्रैक जोड़ना) रिलीज़ स्वचालित रूप से In Progress में बदल जाती है। Status badge का रंग आपके [डैशबोर्ड](/app) release cards पर दिखता है (Draft के लिए नारंगी, In Progress के लिए नीला, Ready के लिए हरा) और सभी collaborators तथा client portal में दिखाई देता है।",
        "mockup": "release-status"
      }
    ]
  },
  {
    "id": "invite-collaborators",
    "title": "रिलीज़ में Collaborators को आमंत्रित करना",
    "category": "getting-started",
    "summary": "Roles और portal का उपयोग करके अपनी रिलीज़ को टीम के सदस्यों और बाहरी clients के साथ साझा करें।",
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
        "heading": "आमंत्रण भेजना",
        "body": "कोई रिलीज़ खोलें और Release Settings पर जाने के लिए हेडर में settings gear आइकन पर क्लिक करें। Release metadata के नीचे Team सेक्शन तक स्क्रॉल करें। जिस व्यक्ति को आप आमंत्रित करना चाहते हैं उसका email address दर्ज करें, dropdown से उनकी role चुनें (Collaborator या Client), और \"Invite\" पर क्लिक करें। उन्हें रिलीज़ में शामिल होने के लिंक के साथ एक email प्राप्त होगा। सक्रिय टीम के सदस्य invite form के नीचे उनके email, role badge, status और उन्हें हटाने के लिए delete बटन के साथ दिखाई देते हैं।",
        "mockup": "invite-collaborator"
      },
      {
        "heading": "Collaborator बनाम Client Roles",
        "body": "दो roles हैं। Collaborators के पास सभी release content को देखने और संपादित करने का पूर्ण access होता है: tracks, intent, specs, audio, notes, distribution metadata और release settings। Clients के पास client portal के माध्यम से view-only access होता है और वे comments के ज़रिए feedback दे सकते हैं, individual tracks को approve कर सकते हैं या changes का request कर सकते हैं, और अगर अनुमति हो तो audio files download कर सकते हैं। Role badge प्रत्येक टीम सदस्य के email के बगल में Team सेक्शन में दिखता है।",
        "mockup": "collaborator-roles"
      },
      {
        "heading": "आमंत्रण स्वीकार करना",
        "body": "जब कोई invite लिंक पर क्लिक करके रिलीज़ में शामिल होता है, तो वे Team सूची में अपने role badge और \"Active\" status के साथ दिखाई देते हैं। आपको एक in-app notification मिलेगा जो बताएगा कि वे शामिल हो गए हैं। जिन invitees के पास Mix Architect खाता नहीं है, उन्हें invite लिंक पर क्लिक करने पर एक खाता बनाने के लिए कहा जाएगा।",
        "tip": "आप Release Settings के Team सेक्शन में किसी भी सदस्य के नाम के बगल में trash आइकन पर क्लिक करके उन्हें कभी भी हटा सकते हैं।",
        "mockup": "accept-invitation"
      },
      {
        "heading": "Client Portal शेयरिंग",
        "body": "जिन बाहरी stakeholders को बिना login किए review करना हो, उनके लिए release detail पेज हेडर से client portal को activate करें। Portal toggle पर क्लिक करें (सक्रिय होने पर यह हरा हो जाता है), फिर unique share URL कॉपी करने के लिए toggle के बगल में link आइकन का उपयोग करें। Portal, Mix Architect account की आवश्यकता के बिना release brief, track list, audio playback और comment system तक read-only access प्रदान करता है। Portal settings का उपयोग करके नियंत्रित करें कि clients को कौन से release-level सेक्शन दिखाई दें: mix direction, specs, references, payment status, distribution info और lyrics। प्रत्येक ट्रैक के लिए per-track control के लिए, उस ट्रैक के Portal tab का उपयोग करें।",
        "mockup": "portal-sharing"
      }
    ]
  },
  {
    "id": "track-tabs",
    "title": "Track Detail: Tabs को समझना",
    "category": "releases",
    "summary": "प्रत्येक ट्रैक में आपके mix के हर पहलू को manage करने के लिए छह tabs हैं: Intent, Specs, Audio, Distribution, Portal और Notes।",
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
        "body": "Intent tab वह जगह है जहाँ आप ट्रैक के लिए creative vision का वर्णन करते हैं। शीर्ष पर \"What should this track feel like?\" के अंतर्गत एक free-form text area है जहाँ आप mix direction लिख सकते हैं (संशोधित करने के लिए \"Edit\" पर क्लिक करें)। उसके नीचे, Emotional Qualities सेक्शन आपको ट्रैक को वर्णनात्मक शब्दों से tag करने देता है: चुने हुए tags filled pills के रूप में दिखते हैं (जैसे spacious, warm, punchy, nostalgic), और उपलब्ध सुझाव outline pills के रूप में दिखते हैं जिन्हें आप क्लिक करके जोड़ सकते हैं (aggressive, intimate, gritty, polished, dark, bright, raw, lush, dreamy, lo-fi, cinematic, minimal, dense, ethereal, hypnotic, euphoric, melancholic, organic, synthetic, chaotic, smooth, haunting, playful, anthemic, delicate, heavy, airy)। नीचे Anti-References सेक्शन में आप उन sounds या approaches का वर्णन कर सकते हैं जिनसे बचना चाहते हैं। दाएँ साइडबार में Quick View ट्रैक status, audio quality (sample rate / bit depth) और format एक नज़र में दिखाता है। उसके नीचे, References सेक्शन आपको reference tracks (Apple Music से) खोजने और जोड़ने देता है, साथ ही वैकल्पिक notes जो बताते हैं कि प्रत्येक track से क्या reference करना है।",
        "mockup": "track-tab-intent"
      },
      {
        "heading": "Specs",
        "body": "Specs tab आपके ट्रैक की technical specifications रखता है। Technical Settings सेक्शन में तीन dropdowns हैं: Format (Stereo, Dolby Atmos या Stereo + Atmos), Sample Rate (44.1kHz, 48kHz, 88.2kHz, 96kHz), और Bit Depth (16-bit, 24-bit, 32-bit float)। ये values source audio का वर्णन करने वाले reference metadata हैं और templates से बनाए गए नए tracks के लिए defaults के रूप में उपयोग किए जाते हैं; ये conversion output को नियंत्रित करने के लिए उपयोग नहीं होते। उसके नीचे, Delivery सेक्शन आपके output formats का प्रबंधन करता है। Format chips पर क्लिक करके चुनें कि कौन से formats उपलब्ध हों: convertible formats में WAV, AIFF, FLAC, MP3, AAC, OGG और ALAC शामिल हैं। Non-convertible formats (DDP, ADM BWF/Atmos, MQA) को reference के लिए चुना जा सकता है लेकिन एक info tooltip दिखाते हैं जो बताता है कि auto-conversion संभव नहीं है। चुने हुए formats हरे रंग में checkmark के साथ highlighted दिखते हैं। \"Export from\" dropdown का उपयोग करें यह चुनने के लिए कि किस audio version से convert करना है (जैसे \"v3 - Typical Wonderful 2025-10-10 MGO.wav (latest)\")। किसी भी चुने हुए convertible format के बगल में download arrow आइकन पर क्लिक करें conversion शुरू करने के लिए। आप \"Custom format...\" फ़ील्ड में custom format नाम भी टाइप कर सकते हैं और \"+ Add\" पर क्लिक कर सकते हैं। नीचे, Special Requirements text area में आप delivery-specific निर्देश नोट कर सकते हैं।",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Audio",
        "body": "Audio tab वह जगह है जहाँ आप files अपलोड करते हैं, versions प्रबंधित करते हैं और audio playback करते हैं। हेडर में release और track का नाम album art के साथ दिखता है। Version selector (v1, v2, v3 आदि) से आप revisions के बीच स्विच कर सकते हैं; नया version अपलोड करने के लिए + बटन पर क्लिक करें। प्रत्येक version अपना version number, upload date, comment count और download बटन दिखाता है। Waveform visualization interactive playback के साथ audio दिखाता है: seek करने के लिए कहीं भी क्लिक करें, और नीचे transport controls (loop, skip back, play/pause, skip forward, repeat) का उपयोग करें। LUFS loudness measurement file metadata (format, sample rate, bit depth) के बगल में दिखता है, loudness targets के अनुसार color-coded। Waveform के नीचे Feedback सेक्शन वर्तमान version के सभी timestamped comments दिखाता है। उस timecode पर नया comment जोड़ने के लिए waveform पर कहीं भी double-click करें। Comment markers waveform पर उनके संबंधित positions पर छोटे icons के रूप में दिखते हैं।",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "Loudness Analysis (LUFS)",
        "body": "जब आप audio अपलोड करते हैं, Mix Architect स्वचालित रूप से integrated loudness को LUFS (Loudness Units Full Scale) में मापता है। Version metadata के बगल में LUFS reading पर क्लिक करें Loudness Analysis पैनल खोलने के लिए। यह दिखाता है कि हर प्रमुख streaming service, broadcast standard और social platform playback के दौरान आपके ट्रैक को कैसे adjust करेगा। प्रत्येक row में platform का नाम, उसकी target loudness (जैसे Spotify -14 LUFS को target करता है), और आपकी file पर लागू होने वाला gain change दिखता है। एक positive value का मतलब है कि service आपके ट्रैक को louder करेगी; एक negative value (नारंगी में दिखाई गई) का मतलब है कि इसे softer किया जाएगा। उदाहरण के लिए, अगर आपका mix -14.9 LUFS मापता है, तो Spotify +0.9 dB लागू करेगा जबकि Apple Music (target -16) -1.1 dB लागू करेगा। पैनल Streaming (Spotify, Apple Music, YouTube, Tidal, Amazon Music, Deezer, Qobuz, Pandora), Broadcast (EBU R128, ATSC A/85, ITU-R BS.1770), और Social (Instagram/Reels, TikTok, Facebook) में grouped है। इसका उपयोग delivery से पहले यह जाँचने के लिए करें कि आपका master किसी platform पर significantly बदला जाएगा या नहीं।",
        "mockup": "track-tab-lufs"
      },
      {
        "heading": "Distribution",
        "body": "Distribution tab digital distribution के लिए आवश्यक सभी metadata कैप्चर करता है। इसमें तीन split sections हैं, प्रत्येक में \"+ Add Person\" बटन: Writing Split (व्यक्ति का नाम, प्रतिशत, PRO affiliation जैसे ASCAP/BMI, Member Account number, और Writer IPI number), Publishing Split (publisher का नाम, प्रतिशत, Publisher Member ID, और Publisher IPI), और Master Recording Split (entity का नाम और प्रतिशत)। प्रत्येक split section का running total 100% होने पर हरे रंग में और न होने पर नारंगी रंग में दिखता है। Splits के नीचे: Codes and Identifiers (ISRC और ISWC फ़ील्ड), Credits (producer और composer/songwriter नाम), Track Properties (featured artist, language selector, explicit lyrics, instrumental, और cover song के लिए toggles), Copyright (registration number और copyright date), और Lyrics (पूर्ण lyrics text area)।",
        "mockup": "track-tab-distribution"
      },
      {
        "heading": "Portal",
        "body": "Portal tab नियंत्रित करता है कि clients इस विशिष्ट ट्रैक के साथ कैसे interact करते हैं। शीर्ष पर Client Approval सेक्शन वर्तमान approval status दिखाता है (जैसे हरे रंग में \"Approved\") साथ ही सभी approval events का timestamped इतिहास: approved, requested changes (client के note के साथ), reopened for review, और re-approved, प्रत्येक तिथियों के साथ। उसके नीचे, Track Portal Visibility आपको toggle करने देता है कि क्या यह ट्रैक portal पर दिखाई दे, downloads सक्षम हों, और कौन से specific audio versions (Version 1, Version 2, Version 3 आदि) client access कर सकें, प्रत्येक का अपना toggle switch। नीचे एक note याद दिलाता है कि portal activation और share link release पेज हेडर में मिल सकते हैं।",
        "mockup": "track-tab-portal"
      },
      {
        "heading": "Notes",
        "body": "Notes tab revision notes और चर्चा के लिए एक सामान्य-उद्देश्य स्थान है जो किसी विशिष्ट timecode से जुड़ा नहीं है। शीर्ष पर \"Add a note...\" placeholder और \"Post\" बटन के साथ एक text area है। Notes नीचे उल्टे कालानुक्रमिक क्रम में दिखते हैं। प्रत्येक note में author का नाम, date या relative time, और संदेश दिखता है। Client notes एक हरे \"Client\" badge के साथ visually अलग दिखाई देते हैं ताकि आप internal feedback को external feedback से तुरंत पहचान सकें। इस tab का उपयोग सामान्य revision directions, to-do items और चर्चा के लिए करें जिन्हें audio में किसी विशिष्ट क्षण को reference करने की आवश्यकता नहीं है। Time-specific feedback के लिए, Audio tab के waveform comments का उपयोग करें।",
        "mockup": "track-tab-notes"
      }
    ]
  },
  {
    "id": "client-portal",
    "title": "Client Portal और Approvals",
    "category": "releases",
    "summary": "एक unique link के माध्यम से अपनी रिलीज़ clients के साथ साझा करें, वे क्या देखें नियंत्रित करें, और per-track approvals ट्रैक करें।",
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
        "heading": "Portal को Activate करना",
        "body": "Release detail पेज पर, हेडर area (ऊपरी दाएँ) में Portal toggle देखें। इसे activate करने के लिए toggle पर क्लिक करें (सक्रिय होने पर यह हरा हो जाता है)। सक्रिय होने पर, unique share URL कॉपी करने के लिए toggle के बगल में link आइकन पर क्लिक करें। Mix Architect account की आवश्यकता के बिना review access के लिए यह लिंक अपने client को भेजें। Portal release brief, track list, audio players और comment system दिखाता है। Portal settings का उपयोग करके नियंत्रित करें कि clients को कौन से release-level sections दिखें: mix direction, specs, references, payment status, distribution metadata और lyrics।",
        "mockup": "portal-settings"
      },
      {
        "heading": "Per-Track Visibility",
        "body": "प्रत्येक ट्रैक के लिए, Portal tab पर जाकर नियंत्रित करें कि आपका client क्या देख सकता है। Track Portal Visibility सेक्शन में toggle switches हैं: \"Visible on portal\" (पूरे ट्रैक को दिखाना या छिपाना), \"Enable download\" (audio downloads को अनुमति देना या ब्लॉक करना), और individual version toggles (Version 1, Version 2, Version 3 आदि) यह नियंत्रित करने के लिए कि client कौन से audio revisions access कर सकें। यह आपको fine-grained control देता है ताकि आप work in progress को छिपा सकें और केवल finished mixes साझा कर सकें। सभी toggles स्वतंत्र हैं, इसलिए आप किसी ट्रैक को visible बना सकते हैं लेकिन downloads disable कर सकते हैं, या केवल latest version दिखा सकते हैं।",
        "mockup": "portal-track-visibility"
      },
      {
        "heading": "Track Approvals",
        "body": "Clients portal के माध्यम से individual tracks को approve कर सकते हैं या changes का request कर सकते हैं। Approval status प्रत्येक ट्रैक के Portal tab के Client Approval सेक्शन में ट्रैक किया जाता है। Status एक colored badge दिखाता है (जैसे हरा \"Approved\") साथ ही हर approval event का पूर्ण timestamped इतिहास: client ने कब approve किया, कब changes का request किया (उनके note सहित, जैसे \"Vocals too quiet\"), कब ट्रैक review के लिए reopen किया गया, और कब re-approve किया गया। यह आपको सभी client decisions का एक स्पष्ट audit trail देता है। Approval badges release detail पेज में track list पर भी दिखते हैं, ताकि आप एक नज़र में देख सकें कि कौन से tracks approved हैं।",
        "mockup": "portal-approval"
      }
    ]
  },
  {
    "id": "templates",
    "title": "Release Templates का उपयोग करना",
    "category": "releases",
    "summary": "Pre-configured specs और settings वाले reusable templates से रिलीज़ बनाकर समय बचाएँ।",
    "tags": [
      "templates",
      "reuse",
      "workflow",
      "presets"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Templates में क्या शामिल है",
        "body": "एक template छह collapsible sections में release defaults का एक व्यापक सेट कैप्चर करता है। Basics: template नाम, विवरण, \"Set as default template\" checkbox (नई रिलीज़ के लिए auto-selected), और artist/client नाम और email। Release Settings: release type (Single, EP या Album), format (Stereo, Dolby Atmos या Stereo + Atmos), और genre tags। Technical Specs: sample rate, bit depth, delivery format selections (WAV, AIFF, FLAC, MP3, AAC, OGG, DDP, ADM BWF/Atmos, MQA, ALAC), और special requirements। Intent Defaults: नए tracks के लिए pre-selected emotional quality tags। Distribution Metadata: distributor, record label, copyright holder, language, primary genre, और rights and publishing contacts। Payment Defaults: payment status, currency, और payment notes। जब आप template से रिलीज़ बनाते हैं, तो ये सभी defaults स्वचालित रूप से लागू होते हैं।",
        "mockup": "template-contents"
      },
      {
        "heading": "Templates बनाना और प्रबंधित करना",
        "body": "Template बनाने के दो तरीके हैं। किसी भी release detail पेज से, हेडर में \"Save as Template\" बटन पर क्लिक करें (settings gear के बगल में) उस रिलीज़ की वर्तमान configuration कैप्चर करने के लिए। या [Templates](/app/templates) पेज पर जाएँ और \"+ New Template\" पर क्लिक करें full template form का उपयोग करके शुरू से बनाने के लिए। [Templates](/app/templates) पेज पर प्रत्येक template card उसका नाम, विवरण और सारांश line दिखाता है जैसे \"Single, Stereo + Atmos, 96 kHz / 24-bit, 4 delivery formats\"। संपादित या हटाने जैसे विकल्पों के लिए किसी भी template card पर three-dot मेनू का उपयोग करें। Templates को व्यवस्थित रखने के लिए वर्णनात्मक नाम दें जैसे \"Stereo Master\" या \"Atmos EP\"।",
        "mockup": "template-create"
      },
      {
        "heading": "Template से रिलीज़ बनाना",
        "body": "[डैशबोर्ड](/app) से नई रिलीज़ बनाते समय, अगर आपके पास सहेजे हुए templates हैं, तो पहले चरण के रूप में \"Start from a template\" picker दिखाया जाता है। यह लिखता है \"Pre-fill your release settings, or start from scratch.\" एक template card चुनें और नई release form को उन settings से pre-fill करने के लिए \"Use Template\" पर क्लिक करें, या skip करने के लिए \"Start from scratch\" पर क्लिक करें। Create release form के नीचे \"Change template\" लिंक भी है अगर आप बदलना चाहें। रिलीज़ बनने के बाद किसी भी template setting को customize किया जा सकता है।",
        "tip": "अपने सबसे अधिक उपयोग किए जाने वाले template को default के रूप में mark करें (\"Set as default template\" checkbox) ताकि जब भी आप नई रिलीज़ बनाएँ तो वह auto-selected रहे।",
        "mockup": "template-use"
      }
    ]
  },
  {
    "id": "payment-tracking",
    "title": "Payment Tracking",
    "category": "releases",
    "summary": "अपनी रिलीज़ में fees, payments और outstanding balances ट्रैक करें।",
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
        "heading": "Payment Tracking सक्षम करना",
        "body": "[Settings](/app/settings) पर जाएँ और Payment Tracking सेक्शन खोजें। सेक्शन में लिखा है: \"Track fees and payment status on releases and tracks. Turn this off if you're mixing your own projects.\" \"Enable payment tracking\" को on करें। सक्षम होने पर, payment-संबंधी सुविधाएँ पूरे ऐप में दिखती हैं: [डैशबोर्ड](/app) पर fee stats (Outstanding, Earned, Total Fees), प्रत्येक रिलीज़ पर inspector साइडबार में Payment सेक्शन, और साइडबार navigation में [Payments](/app/payments) पेज।",
        "mockup": "payment-dashboard"
      },
      {
        "heading": "Release Fees सेट करना",
        "body": "Release Settings खोलें (किसी भी रिलीज़ पर gear आइकन पर क्लिक करें)। Payment सेक्शन तक स्क्रॉल करें। Payment Status सेट करें: No Fee, Unpaid, Partial या Paid। Payment Notes text area में terms, deposit info या due dates रिकॉर्ड करें। Fee amount और payment info, release detail पेज पर inspector साइडबार में Payment heading के अंतर्गत भी दिखाई देती है, जहाँ आप status पर क्लिक करके तुरंत बदल सकते हैं।",
        "mockup": "payment-release-fees"
      },
      {
        "heading": "Payments डैशबोर्ड",
        "body": "साइडबार से [Payments](/app/payments) पेज पर जाएँ। शीर्ष पर तीन summary cards दिखते हैं: Outstanding (कुल unpaid), Earned (कुल paid), और Total Fees सभी रिलीज़ में, प्रत्येक के साथ release count। नीचे, एक table हर रिलीज़ को payment data के साथ सूचीबद्ध करती है: Release नाम, Date, Artist, Fee, Paid, Balance, और Status (colored badges जैसे नारंगी में \"Partial\" के साथ)। नीचे Total row सभी fees का योग दिखाती है। Payment data को spreadsheet के रूप में download करने के लिए \"Export CSV\" बटन का उपयोग करें, या print-ready payment summary generate करने के लिए \"Download PDF\"।",
        "tip": "[डैशबोर्ड](/app) पर Outstanding या Earned stat cards पर क्लिक करें उस payment status से मेल खाने वाली रिलीज़ को तुरंत filter करने के लिए।",
        "mockup": "payment-track-fees"
      }
    ]
  },
  {
    "id": "distribution-tracker",
    "title": "Distribution Tracker",
    "category": "releases",
    "summary": "ट्रैक करें कि आपकी रिलीज़ कहाँ submit की गई है, विभिन्न platforms पर status मॉनिटर करें, और Spotify पर live होने पर notification पाएँ।",
    "tags": ["distribution", "tracker", "spotify", "apple music", "platform", "status", "live", "submitted"],
    "updatedAt": "2026-03-14",
    "content": [
      {
        "heading": "रिलीज़ में Platforms जोड़ना",
        "body": "कोई भी रिलीज़ खोलें और track list के नीचे Distribution Tracker पैनल तक स्क्रॉल करें। Streaming platform जोड़ने के लिए \"+ Add Platform\" पर क्लिक करें। Spotify, Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud या Bandcamp में से चुनें। प्रत्येक platform एक row के रूप में अपने official logo, status indicator और distributor tag के साथ दिखता है। आप \"Mark as Submitted\" का उपयोग करके एक साथ कई platforms भी जोड़ सकते हैं: एक distributor चुनें (DistroKid, TuneCore, CD Baby, LANDR, Ditto, AWAL, UnitedMasters, Amuse, RouteNote या Self-released), जिन platforms पर submit किया उन्हें check करें, और Submit पर क्लिक करें।",
        "mockup": "distribution-add-platform"
      },
      {
        "heading": "Status States",
        "body": "प्रत्येक platform entry का एक status होता है जो ट्रैक करता है कि वह release pipeline में कहाँ है। छह states हैं: Not Submitted (gray, नए जोड़े गए platforms के लिए default), Submitted (नीला, आपने रिलीज़ अपने distributor को भेज दी है), Processing (नारंगी, distributor review या processing कर रहा है), Live (हरा, रिलीज़ platform पर उपलब्ध है), Rejected (लाल, platform या distributor ने रिलीज़ को reject कर दिया), और Taken Down (लाल, रिलीज़ पहले live थी लेकिन हटा दी गई है)। इसे बदलने के लिए किसी भी platform row पर status indicator पर क्लिक करें। Status changes platform history में log होते हैं ताकि आप देख सकें कि हर transition कब हुआ।",
        "mockup": "distribution-status"
      },
      {
        "heading": "Spotify Auto-Detection",
        "body": "Spotify, Distribution Tracker में सबसे ऊपर \"Updates automatically\" label के साथ listed है। एक बार जब आप Spotify को Submitted के रूप में mark करते हैं, Mix Architect समय-समय पर ISRC code (track के Distribution tab से) या release title और artist name का उपयोग करके Spotify catalog में आपकी रिलीज़ की जाँच करता है। जब आपकी रिलीज़ Spotify पर मिलती है, तो status स्वचालित रूप से Live में बदल जाता है, Spotify URL सहेजा जाता है, और आपको notification मिलता है। तुरंत जाँच शुरू करने के लिए आप \"Check Now\" पर भी क्लिक कर सकते हैं। Auto-detection सभी submitted Spotify entries के लिए प्रतिदिन चलता है।",
        "tip": "Submit करने से पहले अपने track के Distribution tab पर ISRC code भरें। ISRC-आधारित detection, title/artist matching से अधिक विश्वसनीय है, विशेषकर सामान्य नामों के लिए।",
        "mockup": "distribution-spotify"
      },
      {
        "heading": "Status अपडेट करना और Links जोड़ना",
        "body": "किसी platform का status बदलने के लिए, platform row पर status indicator पर क्लिक करें। Status pills की एक row दिखती है जहाँ आप नया state चुन सकते हैं। उस platform पर रिलीज़ का link जोड़ने के लिए, platform name के बगल में \"Add link\" पर क्लिक करें। URL दर्ज करें (उदाहरण के लिए, Spotify album link या Apple Music page) और Save पर क्लिक करें। Link icon एक clickable external link में बदल जाता है जो उस platform पर release page खोलता है। अतिरिक्त विकल्पों के लिए किसी भी platform row पर three-dot menu का उपयोग करें: details संपादित करें, platform हटाएँ, या status change history देखें।",
        "mockup": "distribution-edit"
      },
      {
        "heading": "Bulk Submit और Refresh",
        "body": "\"Mark as Submitted\" आपको अपने distributor को batch submission record करने देता है। Dropdown से distributor चुनें, जिन platforms पर submit किया उन्हें check करें, और Submit पर क्लिक करें। सभी चुने हुए platforms Submitted status और distributor tag के साथ जोड़ दिए जाते हैं। \"Check Now\" उन Spotify entries पर दिखता है जो submit की गई हैं। इस पर क्लिक करने से तुरंत Spotify catalog search शुरू होती है। अगर मिल जाती है, तो status Live में अपडेट हो जाता है और URL स्वचालित रूप से सहेजा जाता है। अन्य सभी platforms (Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud, Bandcamp) के लिए, जब आप confirm करें कि रिलीज़ live है तो status manually अपडेट करें।",
        "mockup": "distribution-bulk"
      },
      {
        "heading": "Distributor Tags",
        "body": "प्रत्येक platform entry में एक distributor tag हो सकता है जो दिखाता है कि आपने submit करने के लिए कौन सी service उपयोग की (DistroKid, TuneCore, CD Baby आदि)। यह status indicator के बगल में एक छोटे pill के रूप में दिखता है। Distributor tags स्वचालित रूप से set होते हैं जब आप \"Mark as Submitted\" उपयोग करते हैं, या आप platform entry संपादित करते समय उन्हें individually set कर सकते हैं। यह आपको ट्रैक करने में मदद करता है कि किस distributor ने कौन सा platform handle किया, विशेषकर अगर आप विभिन्न territories या platforms के लिए अलग-अलग distributors उपयोग करते हैं।",
        "warning": "Analytics केवल वही data दर्शाता है जो आपने Mix Architect में ट्रैक किया है। अगर आप distributor के अपने dashboard के माध्यम से submit करते हैं, तो यहाँ status अपडेट करना न भूलें ताकि आपका tracker सटीक रहे।",
        "mockup": "distribution-distributor"
      }
    ]
  },
  {
    "id": "user-analytics",
    "title": "User Analytics",
    "category": "releases",
    "summary": "Analytics dashboard में अपनी पूर्ण रिलीज़, औसत turnaround time, कुल revenue और per-client breakdown देखें।",
    "tags": ["analytics", "dashboard", "revenue", "turnaround", "velocity", "clients", "charts"],
    "updatedAt": "2026-03-14",
    "content": [
      {
        "heading": "Analytics पेज क्या दिखाता है",
        "body": "साइडबार से [Analytics](/app/analytics) पेज पर जाएँ। Dashboard शीर्ष पर चार summary cards दिखाता है: Completed Releases (कुल पूर्ण projects, monthly average के साथ), Average Turnaround Time (creation से completion तक के दिन, fastest और slowest breakdown के साथ), Total Revenue (सभी tracked fees का योग, outstanding balance के साथ), और Clients (unique client count, कुल releases के साथ)। Summary cards के नीचे, तीन charts आपके data को समय के साथ visualize करते हैं, और एक client breakdown table per-client statistics दिखाती है।",
        "mockup": "analytics-overview"
      },
      {
        "heading": "Release Velocity और Turnaround Time",
        "body": "Release Velocity chart एक bar chart है जो दिखाता है कि चुनी गई date range में आपने प्रत्येक महीने कितनी releases पूरी कीं। ऊँचे bars का मतलब अधिक productive महीने। इसका उपयोग अपनी output में trends पहचानने और busy या slow periods identify करने के लिए करें। Turnaround Time chart प्रति माह release creation से completion तक के औसत दिनों की संख्या दिखाता है। कम bars का मतलब तेज़ delivery। साथ मिलकर, ये charts आपको अपनी capacity समझने और यह जानने में मदद करते हैं कि आपका workflow समय के साथ तेज़ हो रहा है या धीमा।",
        "mockup": "analytics-velocity"
      },
      {
        "heading": "Revenue Chart",
        "body": "Revenue chart एक area chart है जो प्रति माह कुल earned fees दिखाता है। यह आपकी releases पर recorded payment amounts को track करता है, इसलिए यह दर्शाता है कि clients ने वास्तव में क्या भुगतान किया है। Income trends देखने, अपने highest-earning months identify करने और शांत periods के लिए plan करने के लिए इसका उपयोग करें। Revenue data प्रत्येक release की payment tracking feature से आता है, इसलिए सटीक reporting के लिए सुनिश्चित करें कि fees और payment statuses अपडेट हैं।",
        "mockup": "analytics-revenue"
      },
      {
        "heading": "Client Breakdown",
        "body": "Analytics पेज के नीचे Client Breakdown table हर client को उनके key metrics के साथ सूचीबद्ध करती है: releases की संख्या, कुल revenue, भुगतान की गई राशि, और औसत turnaround time। यह आपको पहचानने में मदद करता है कि कौन से clients सबसे अधिक काम और revenue generate करते हैं, कौन समय पर भुगतान करता है, और आपका समय कहाँ खर्च होता है। उनकी releases देखने के लिए किसी भी client row पर क्लिक करें। Table डिफ़ॉल्ट रूप से revenue के अनुसार sort होती है।",
        "mockup": "analytics-clients"
      },
      {
        "heading": "Date Range Picker",
        "body": "Analytics किस अवधि को cover करे, यह नियंत्रित करने के लिए ऊपरी दाएँ कोने में date range picker का उपयोग करें। Preset ranges में Last 7 Days, Last 30 Days, Last 90 Days और Last 365 Days शामिल हैं। आप specific start और end dates चुनकर custom date range भी set कर सकते हैं। सभी चार summary cards और तीनों charts चुनी गई अवधि को reflect करने के लिए अपडेट होते हैं। Date range picker पूरे analytics dashboard में समान तरीके से काम करता है।",
        "tip": "वार्षिक समीक्षा और tax तैयारी के लिए 365-day range का उपयोग करें। अपने business की monthly स्थिति जाँचने के लिए 30-day range उपयोगी है।",
        "mockup": "analytics-date-range"
      }
    ]
  },
  {
    "id": "release-settings",
    "title": "रिलीज़ सेटिंग्स",
    "category": "releases",
    "summary":
      "प्रत्येक रिलीज़ के लिए रिलीज़ विवरण, क्लाइंट जानकारी, डिस्ट्रीब्यूशन मेटाडेटा, पेमेंट ट्रैकिंग, और टीम सदस्यों को कॉन्फ़िगर करें।",
    "tags": ["release", "settings", "client", "distribution", "payment", "team", "collaborators", "metadata", "UPC", "copyright"],
    "updatedAt": "2026-03-15",
    "content": [
      {
        "heading": "रिलीज़ सेटिंग्स खोलना",
        "body": "किसी भी रिलीज़ से, रिलीज़ toolbar में gear आइकन पर क्लिक करें या three-dot मेनू से \"Settings\" चुनें। सेटिंग्स पेज में पाँच सेक्शन हैं: Release Details, Client Information, Distribution, Payment, और Team Management। शीर्ष पर एक back arrow आपको रिलीज़ view पर वापस ले जाता है। फ़ॉर्म के नीचे Save बटन पर क्लिक करने पर बदलाव सेव होते हैं।",
        "mockup": "release-settings-overview"
      },
      {
        "heading": "रिलीज़ विवरण",
        "body": "Release Details सेक्शन में आपके प्रोजेक्ट का मुख्य मेटाडेटा होता है। Image area पर क्लिक करके cover art अपलोड या बदलें। Text fields में रिलीज़ Title और Artist name सेट करें। Pill-style selectors का उपयोग करके Release Type (Single, EP, या Album) और Format (Stereo, Dolby Atmos, या Stereo + Atmos) चुनें। उसी तरह Status (Draft, In Progress, या Ready) सेट करें। Autocomplete suggestions (Rock, Pop, Hip-Hop, Electronic, आदि) वाले tag input का उपयोग करके Genre Tags जोड़ें। अपनी रिलीज़ deadline के लिए Target Date सेट करें, जो Calendar subscription में भी दिखाई देती है।",
        "mockup": "release-settings-details"
      },
      {
        "heading": "क्लाइंट जानकारी",
        "body": "Client Information सेक्शन इस रिलीज़ से जुड़े क्लाइंट के संपर्क विवरण संग्रहीत करता है। फ़ील्ड में Client Name, Client Email, Client Phone, और Delivery Notes शामिल हैं। क्लाइंट का नाम Analytics client breakdown और payment reports में दिखाई देता है। Delivery Notes एक free-text area है जहाँ विशेष निर्देश जैसे preferred file naming conventions या delivery platforms लिखे जा सकते हैं।",
        "mockup": "release-settings-client"
      },
      {
        "heading": "डिस्ट्रीब्यूशन मेटाडेटा",
        "body": "Distribution सेक्शन digital distribution के लिए आवश्यक मेटाडेटा कैप्चर करता है। फ़ील्ड में Distributor (उदा. DistroKid, TuneCore), Record Label, UPC/EAN barcode, Catalog Number, Copyright Holder, Copyright Year, और Phonographic Copyright (P-line) शामिल हैं। ये वैल्यूज़ Distribution Tracker द्वारा उपयोग की जाती हैं और आपके data export में दिखाई देती हैं।",
        "mockup": "release-settings-distribution"
      },
      {
        "heading": "पेमेंट सेटिंग्स",
        "body": "Payment सेक्शन केवल तभी दिखाई देता है जब आपकी User Settings में payment tracking सक्षम हो। यह pill selectors (No Fee, Unpaid, Partial, Paid) का उपयोग करके Payment Status दिखाता है, एक Project Fee फ़ील्ड currency selector के साथ, Paid Amount, और calculated Balance Due। एक Payment Notes text area आपको payment terms या invoice references रिकॉर्ड करने देता है। Payment status और amounts dashboard cards और Analytics revenue charts में दिखाई देते हैं।",
        "mockup": "release-settings-payment",
        "tip": "जब deposit प्राप्त हो जाए तो payment status को \"Partial\" पर सेट करें। Balance due project fee में से paid amount घटाकर स्वचालित रूप से calculated होता है।"
      },
      {
        "heading": "टीम प्रबंधन",
        "body": "Team Management सेक्शन आपको रिलीज़ में collaborators और clients को invite करने देता है। Email address दर्ज करें, role (Collaborator या Client) चुनें, और Invite पर क्लिक करें। Pending invitations एक \"Invited\" badge और Resend बटन के साथ दिखाई देती हैं। स्वीकृत सदस्य अपना display name, role, और उन्हें remove करने का विकल्प दिखाते हैं। Release owner हमेशा सूचीबद्ध रहता है और उसे remove नहीं किया जा सकता। Collaborators ट्रैक संपादित कर सकते हैं और कमेंट छोड़ सकते हैं; Clients के पास read-only access है और वे client portal के माध्यम से tracks approve कर सकते हैं।",
        "mockup": "release-settings-team",
        "warning": "किसी टीम सदस्य को remove करने से उनका access तुरंत रद्द हो जाता है। वे रिलीज़ या उसके किसी भी ट्रैक को देखने में सक्षम नहीं रहेंगे।"
      }
    ]
  },
  {
    "id": "upload-audio-tracks",
    "title": "Audio अपलोड और प्रबंधन",
    "category": "audio",
    "summary": "Audio files अपलोड करना, versions प्रबंधित करना, और waveform player का उपयोग करना।",
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
        "heading": "Audio अपलोड करना",
        "body": "कोई भी ट्रैक खोलें और Audio tab पर जाएँ। Upload area पर क्लिक करें या सीधे उस पर file drag and drop करें। समर्थित formats: WAV, AIFF, FLAC, MP3, AAC, और M4A, प्रति file 500 MB तक। File secure cloud storage में अपलोड होती है, और waveform visualization स्वचालित रूप से generate होता है। File metadata (format, sample rate, bit depth, duration) कैप्चर किया जाता है और version info के नीचे दिखाया जाता है, उदाहरण के लिए: \"Typical Wonderful 2025-10-10 MGO.wav, WAV, 48kHz, 24-bit\"।",
        "mockup": "audio-upload"
      },
      {
        "heading": "Track Versions",
        "body": "हर बार जब आप उसी ट्रैक में नई file अपलोड करते हैं, यह अगला version बन जाती है। Waveform के ऊपर version selector numbered बटन (v1, v2, v3 आदि) और एक अन्य version अपलोड करने के लिए + बटन दिखाता है। किसी भी version पर क्लिक करें उस पर स्विच करने के लिए। प्रत्येक version अपना version number, upload date, comment count, और original file download करने के लिए download आइकन दिखाता है। पिछले versions अपने comments और waveform के साथ पूरी तरह सुरक्षित रहते हैं।",
        "tip": "नया ट्रैक बनाने के बजाय उसी ट्रैक में revised mixes अपलोड करें। इससे आपका version history साफ़ रहता है, पुराने versions पर comments सुरक्षित रहते हैं, और आप समय के साथ mixes की तुलना कर सकते हैं।",
        "mockup": "track-versions"
      },
      {
        "heading": "Waveform Player",
        "body": "हर अपलोड किया गया version एक interactive waveform दिखाता है। उस position पर seek करने के लिए waveform पर कहीं भी क्लिक करें। Waveform के नीचे transport controls में शामिल हैं: current time, loop toggle, skip backward, play/pause, skip forward, repeat toggle, और total duration। Player file metadata के बगल में एक integrated LUFS loudness measurement भी दिखाता है (जैसे \"-14.8 LUFS\"), loudness targets के अनुसार color-coded ताकि आप एक नज़र में levels का मूल्यांकन कर सकें। अगर वर्तमान version पर timestamped comments हैं, तो छोटे marker icons waveform पर उनके positions पर दिखते हैं।",
        "mockup": "track-tab-audio"
      }
    ]
  },
  {
    "id": "audio-converter",
    "title": "Delivery Formats और Conversion",
    "category": "audio",
    "summary": "Delivery formats सेट करें, audio convert करें, और artist, cover art, ISRC, और lyrics जैसे metadata tags स्वचालित रूप से embed करें।",
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
        "heading": "Delivery Formats सेट करना",
        "body": "कोई भी ट्रैक खोलें और Specs tab पर जाएँ। Delivery सेक्शन तक स्क्रॉल करें। यहाँ format chips पर क्लिक करके चुनें कि आपके project को कौन से output formats चाहिए। उपलब्ध convertible formats: WAV, AIFF, FLAC, MP3, AAC, OGG, और ALAC। चुने हुए formats checkmark आइकन के साथ हरे रंग में highlighted दिखते हैं। अतिरिक्त non-convertible formats (DDP, ADM BWF/Atmos, MQA) को reference के लिए toggle किया जा सकता है; वे एक info tooltip दिखाते हैं जो बताता है कि automatic conversion उपलब्ध नहीं है। आप \"Custom format...\" input field में कोई भी custom format नाम टाइप कर सकते हैं और सूची में न दिए गए किसी format के लिए \"+ Add\" पर क्लिक कर सकते हैं। \"Export from\" dropdown का उपयोग करें यह चुनने के लिए कि किस audio version से convert करना है, जैसे \"v3 - filename.wav (latest)\"।",
        "mockup": "format-convert"
      },
      {
        "heading": "Converting और Downloading",
        "body": "Delivery सेक्शन में format chips पर क्लिक करके चुनें कि कौन से formats उपलब्ध हों: convertible formats में WAV, AIFF, FLAC, MP3, AAC, OGG, और ALAC शामिल हैं। चुने हुए formats checkmark के साथ हरे रंग में highlighted दिखते हैं। Conversion शुरू करने के लिए किसी भी चुने हुए convertible format के बगल में download arrow आइकन पर क्लिक करें। Conversion background में process होने के दौरान आइकन spinner दिखाता है। Conversion पूरा होने पर, file स्वचालित रूप से आपके browser में download हो जाती है। प्रत्येक conversion \"Export from\" dropdown में चुने गए audio version का उपयोग करता है, maximum audio quality बनाए रखने के लिए original uploaded file से convert करता है। Lossless formats (WAV, AIFF, FLAC, ALAC) source file की sample rate और bit depth बनाए रखते हैं। Lossy formats optimized presets उपयोग करते हैं: MP3 44.1 kHz / 320 kbps पर export होता है, AAC 44.1 kHz / 256 kbps पर, और OGG 44.1 kHz / Quality 8 पर।",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Automatic Metadata Embedding",
        "body": "जब आप MP3, FLAC, AAC, OGG, या ALAC में convert करते हैं, Mix Architect स्वचालित रूप से industry-standard metadata tags output file में लिखता है। इसमें शामिल हैं: artist, title, album, track number, genre, release year, copyright, ISRC, UPC/barcode, lyrics, cover art, और ReplayGain। ReplayGain एक loudness tag है जो compatible players को बताता है कि volume कितना adjust करना है ताकि tracks consistent level पर playback हों बिना clipping के। Mix Architect इसे आपके audio की measured LUFS से ReplayGain 2.0 standard (reference level -18 LUFS) का उपयोग करके calculate करता है। MP3 files को ID3v2 tags मिलते हैं, FLAC और OGG Vorbis comments का उपयोग करते हैं, और AAC/ALAC iTunes-style MP4 atoms का उपयोग करते हैं। सभी metadata आपकी release और track details से लिया जाता है (Distribution tab से ISRC और lyrics, और release cover art सहित)। WAV और AIFF exports में metadata tags शामिल नहीं होते। Conversion पूरा होने के बाद, format chip के बगल में tag आइकन पर hover करें यह देखने के लिए कि ठीक कौन से tags embed किए गए।",
        "tip": "Export करने से पहले अपना Distribution tab (ISRC, lyrics) भरें और cover art अपलोड करें। आप जितना अधिक metadata प्रदान करेंगे, distribution के लिए आपकी exported files उतनी ही पूर्ण होंगी।"
      },
      {
        "heading": "Supported Formats Reference",
        "body": "Lossless formats source quality बनाए रखते हैं: WAV (PCM, source rate/depth), AIFF (PCM, source rate/depth), FLAC (source rate), ALAC (source rate)। Lossy formats distribution के लिए optimized fixed presets उपयोग करते हैं: MP3 (44.1 kHz, 320 kbps, stereo), AAC (44.1 kHz, 256 kbps, stereo), OGG Vorbis (44.1 kHz, quality 8, stereo)। Non-convertible formats (केवल tag, कोई auto-conversion नहीं): DDP, ADM BWF (Atmos), MQA। Specs tab के शीर्ष पर Technical Settings (sample rate और bit depth) source audio का वर्णन करने वाले reference metadata हैं; ये conversion output को नियंत्रित नहीं करते। Delivery formats के नीचे Special Requirements text area आपको delivery निर्देशों के बारे में notes जोड़ने देता है।",
        "warning": "किसी lossy format (MP3, AAC, OGG) से lossless format (WAV, FLAC) में convert करने से audio quality नहीं सुधरती। मूल compression artifacts बने रहते हैं। हमेशा अपनी highest-quality source file अपलोड करें।",
        "mockup": "supported-formats"
      }
    ]
  },
  {
    "id": "audio-review-comments",
    "title": "Timestamped Comments छोड़ना",
    "category": "audio",
    "summary": "Waveform पर सीधे time-coded feedback जोड़ें ताकि collaborators को ठीक पता चले कहाँ सुनना है।",
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
        "heading": "Comment जोड़ना",
        "body": "कोई ट्रैक खोलें और Audio tab पर जाएँ। Waveform पर उस ठीक बिंदु पर double-click करें जिसे आप reference करना चाहते हैं। Waveform के नीचे Feedback सेक्शन में एक text input दिखता है जहाँ आप अपना comment टाइप कर सकते हैं। Comment उस timecode और version से जुड़ा होता है। Feedback सेक्शन में, प्रत्येक comment author का नाम, एक colored timestamp badge (जैसे \"0:07\" या \"1:22\"), relative date, और संदेश text दिखाता है। Comment markers छोटे icons के रूप में waveform पर उनके positions पर भी दिखते हैं। Playback head को उस moment पर ले जाने के लिए किसी भी timestamp पर क्लिक करें।",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "Portal Comments",
        "body": "Portal के माध्यम से review करने वाले clients भी waveform पर timestamped comments छोड़ सकते हैं। उनके comments उसी Feedback सेक्शन में team comments के साथ दिखते हैं लेकिन \"Client\" badge के साथ visually अलग पहचाने जाते हैं ताकि आप external feedback को तुरंत पहचान सकें। यह सभी feedback, internal और external, को relevant audio version के अंतर्गत एक ही जगह organized रखता है।",
        "mockup": "portal-comments"
      },
      {
        "heading": "Notes बनाम Audio Comments",
        "body": "Audio tab waveform में विशिष्ट moments से जुड़े timestamped feedback के लिए है: \"1:22 पर vocals बढ़ाएँ\" या \"यहाँ snare बहुत loud है\"। Notes tab सामान्य चर्चा और revision notes के लिए है जो किसी timecode से जुड़े नहीं हैं: \"overall mix में more low end चाहिए\" या \"client more aggressive approach चाहता है\"। Audio comments version-specific होते हैं (v1, v2 आदि से जुड़े), जबकि Notes पूरे ट्रैक पर लागू होते हैं। Overall creative vision, emotional tags और reference tracks को document करने के लिए Intent tab का उपयोग करें।",
        "tip": "किसी ट्रैक पर feedback की पूरी तस्वीर के लिए, Audio tab का Feedback सेक्शन (time-specific notes के लिए) और Notes tab (सामान्य चर्चा के लिए) दोनों देखें। Client feedback दोनों जगह दिखाई दे सकता है।",
        "mockup": "resolve-feedback"
      }
    ]
  },
  {
    "id": "timeline-overview",
    "title": "Timeline View का उपयोग करना",
    "category": "timeline",
    "summary": "Release schedules को visualize करने और release dates तक countdown देखने के लिए अपने डैशबोर्ड पर timeline view पर स्विच करें।",
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
        "heading": "Timeline View पर स्विच करना",
        "body": "[डैशबोर्ड](/app) पर, हेडर area में (payment stats के नीचे) दो view toggle बटन देखें। Grid view से timeline view पर स्विच करने के लिए timeline आइकन (दूसरा बटन) पर क्लिक करें। Timeline आपकी रिलीज़ को उनकी target release dates के आधार पर कालानुक्रमिक रूप से दिखाता है। बिना target date वाली releases नीचे एक अलग \"Unscheduled\" सेक्शन में दिखती हैं। आपकी view प्राथमिकता स्वचालित रूप से सहेजी जाती है, इसलिए अगली बार डैशबोर्ड पर आने पर यह आपकी पसंद याद रखेगा।",
        "mockup": "timeline-full"
      },
      {
        "heading": "Timeline पढ़ना",
        "body": "प्रत्येक रिलीज़ अपनी target release date के अनुसार positioned card के रूप में दिखती है। Timeline एक countdown दिखाता है: आगामी dates के लिए \"X days until release\" या बीती dates के लिए \"Released X days ago\"। Release cards grid view जैसी ही जानकारी दिखाते हैं (title, artist, status, format, track count) साथ ही scheduling context। Status dots color-coded हैं: Draft के लिए नारंगी, In Progress के लिए नीला, और Ready के लिए हरा। Pinned releases timeline के शीर्ष पर दिखती हैं।",
        "mockup": "timeline-navigate"
      },
      {
        "heading": "Target Dates सेट करना",
        "body": "Timeline में रिलीज़ जोड़ने के लिए, रिलीज़ बनाते समय या Release Settings (release पेज पर gear आइकन) में target release date सेट करें। Target Release Date फ़ील्ड date picker का उपयोग करती है। जैसे आप dates adjust करते हैं, timeline स्वचालित रूप से अपडेट होता है। यह आपको अपने schedule को visualize करने और कई projects में overlapping release windows से बचने में मदद करता है।",
        "tip": "Planning के दौरान timeline view का उपयोग करें अपनी releases को space out करने के लिए। आगामी deadlines की स्पष्ट दृश्यता आपके mixing, mastering, या distribution workflow में bottlenecks रोकने में मदद करती है।",
        "mockup": "timeline-dates"
      }
    ]
  },
  {
    "id": "export-data",
    "title": "अपना Account Data Export करना",
    "category": "account",
    "summary": "अपनी releases, tracks, audio files, और payment records का पूर्ण ZIP export download करें।",
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
        "heading": "क्या शामिल है",
        "body": "Data export एक ZIP file है जिसमें आपका सभी release metadata, track details, audio files (सभी versions), और payment records शामिल हैं। Download करने से पहले, ऐप export size का अनुमान counts के साथ दिखाता है: शामिल releases, tracks और audio files की संख्या। यह आपको अपने account की हर चीज़ का पूर्ण backup देता है।",
        "mockup": "export-contents"
      },
      {
        "heading": "Export शुरू करना",
        "body": "[Settings](/app/settings) पर जाएँ और \"Your Data\" सेक्शन तक स्क्रॉल करें। शुरू करने के लिए \"Export My Data\" पर क्लिक करें। ऐप पहले approximate file size और counts दिखाने वाला अनुमान calculate करता है (जैसे \"3 releases, 12 tracks, 8 audio files\")। अनुमान देखें, फिर export शुरू करने के लिए \"Download\" पर क्लिक करें। एक progress bar download status दिखाता है। कई audio files वाले बड़े accounts के लिए, export में कुछ समय लग सकता है। पूरा होने पर ZIP file स्वचालित रूप से आपके browser में download हो जाती है। बिना download किए वापस जाने के लिए आप \"Cancel\" पर क्लिक कर सकते हैं।",
        "mockup": "export-progress"
      },
      {
        "heading": "Data Privacy",
        "body": "आपके export में केवल वही data होता है जो आपका है या आपने बनाया है। Collaborator contributions (जैसे आपकी releases पर comments) शामिल हैं, लेकिन अन्य users का private data शामिल नहीं है। Export on-demand generate होता है और download के बाद हमारे servers पर store नहीं किया जाता।",
        "tip": "अपने projects और audio files के backup के रूप में समय-समय पर data export करें। यह विशेष रूप से आपके account में बड़े बदलाव करने से पहले उपयोगी है।",
        "mockup": "export-privacy"
      }
    ]
  },
  {
    "id": "user-settings",
    "title": "उपयोगकर्ता सेटिंग्स",
    "category": "account",
    "summary":
      "अपनी प्रोफ़ाइल, दिखावट, ईमेल सूचनाएँ, मिक्स डिफ़ॉल्ट्स, और अन्य सेटिंग्स कॉन्फ़िगर करें।",
    "tags": ["settings", "profile", "email", "notifications", "preferences", "theme", "appearance", "defaults", "persona", "integrations", "calendar", "export"],
    "updatedAt": "2026-03-15",
    "content": [
      {
        "heading": "सेटिंग्स अवलोकन",
        "body": "साइडबार या टॉप बार में अकाउंट मेनू से [User Settings](/app/settings) खोलें। सेटिंग्स पैनलों में व्यवस्थित हैं: Profile, Subscription, Region & Currency, Appearance, Persona, Payment Tracking, Email Preferences, Integrations, Mix Defaults, Calendar, और Your Data। जैसे ही आप किसी पैनल के साथ इंटरैक्ट करते हैं, बदलाव तुरंत सेव हो जाते हैं।",
        "mockup": "settings-overview"
      },
      {
        "heading": "प्रोफ़ाइल",
        "body": "Profile पैनल पेज पर पहला सेक्शन है। इसमें तीन फ़ील्ड हैं: Display Name (कमेंट्स, नोटिफ़िकेशन्स, और सहयोगियों को भेजे गए ईमेल पर दिखता है), Company Name (वैकल्पिक, ब्रांडिंग के लिए), और Email (केवल पठनीय, आपके ऑथेंटिकेशन प्रोवाइडर के माध्यम से प्रबंधित)। अपना नाम दर्ज करें और Save पर क्लिक करें। टॉप बार में आपके पहले नाम का उपयोग करके एक व्यक्तिगत अभिवादन दिखाई देता है।",
        "mockup": "settings-profile"
      },
      {
        "heading": "सब्सक्रिप्शन",
        "body": "Subscription पैनल आपका वर्तमान प्लान दिखाता है। Pro अकाउंट्स एक हरा \"PRO\" बैज, मासिक मूल्य, और एक \"Manage Billing\" बटन प्रदर्शित करते हैं जो Stripe portal खोलता है जहाँ आप payment methods अपडेट कर सकते हैं, invoices देख सकते हैं, और receipts download कर सकते हैं। Free अकाउंट्स इसके बजाय \"Upgrade to Pro\" बटन दिखाते हैं। Pro unlimited releases, audio format conversion, और priority support अनलॉक करता है।",
        "mockup": "settings-subscription"
      },
      {
        "heading": "क्षेत्र और मुद्रा",
        "body": "Region & Currency पैनल में दो ड्रॉपडाउन हैं। Locale ड्रॉपडाउन आपकी भाषा और date format सेट करता है, प्रत्येक विकल्प के बगल में एक flag emoji के साथ। अपना locale बदलने से डिफ़ॉल्ट मुद्रा भी स्वचालित रूप से अपडेट हो जाती है। Currency ड्रॉपडाउन आपको payment tracking के लिए उपयोग की जाने वाली मुद्रा को ओवरराइड करने देता है। नीचे एक format preview दिखाता है कि राशियाँ कैसी दिखेंगी (उदा. \"$1,234.56\")।",
        "mockup": "settings-region"
      },
      {
        "heading": "दिखावट",
        "body": "Appearance पैनल आपको तीन स्टाइल्ड बटनों का उपयोग करके Light, Dark, और System थीम के बीच स्विच करने देता है। सक्रिय थीम आपके accent color के साथ हाइलाइट होती है। System मोड आपके ऑपरेटिंग सिस्टम की प्राथमिकता का पालन करता है। आपकी थीम पसंद आपके अकाउंट में सेव होती है और सभी डिवाइस पर लागू होती है।",
        "mockup": "settings-appearance"
      },
      {
        "heading": "पर्सोना",
        "body": "Persona पैनल पूछता है कि आप Mix Architect का उपयोग कैसे करते हैं। Radio buttons का उपयोग करके Artist, Engineer, Both, या Other में से चुनें। आपका चयन अनुभव को अनुकूलित करता है: Engineer या Both चुनने से payment tracking स्वचालित रूप से सक्षम हो जाती है, जबकि Artist इसे डिफ़ॉल्ट रूप से बंद रखता है। आप payment tracking को हमेशा स्वतंत्र रूप से ओवरराइड कर सकते हैं। विकल्पों के नीचे एक नोट बताता है कि persona डिफ़ॉल्ट सेटिंग्स को कैसे प्रभावित करता है।",
        "mockup": "settings-persona"
      },
      {
        "heading": "पेमेंट ट्रैकिंग",
        "body": "Payment Tracking पैनल में एक सिंगल टॉगल स्विच है। सक्षम होने पर, डैशबोर्ड पर रिलीज़ कार्ड payment summary stats (Outstanding, Earned, Total fees) दिखाते हैं, और प्रत्येक रिलीज़ की सेटिंग्स में एक Payment सेक्शन मिलता है। अक्षम होने पर, सभी payment-related UI छिप जाती है। टॉगल तुरंत सेव होता है और पेज रिफ़्रेश करता है।",
        "mockup": "settings-payment-tracking",
        "tip": "जब आप अपने persona के रूप में Engineer या Both चुनते हैं तो Payment tracking स्वचालित रूप से सक्षम हो जाती है, और Artist के लिए अक्षम हो जाती है। आप इसे किसी भी समय मैन्युअल रूप से ओवरराइड कर सकते हैं।"
      },
      {
        "heading": "ईमेल सूचनाएँ",
        "body": "Email Preferences पैनल नियंत्रित करता है कि आप Mix Architect से कौन से ट्रांज़ैक्शनल ईमेल प्राप्त करते हैं। प्रत्येक श्रेणी में एक ऑन/ऑफ़ टॉगल है। श्रेणियों में शामिल हैं: Release Live Alerts (जब कोई रिलीज़ किसी प्लेटफ़ॉर्म पर लाइव होती है), New Comment Alerts (जब कोई आपकी रिलीज़ पर कमेंट करता है), Weekly Digest (आपकी रिलीज़ों की गतिविधि का साप्ताहिक सारांश), Payment Reminders (जब सब्सक्रिप्शन भुगतान विफल होता है), Payment Confirmations (जब भुगतान प्रोसेस होता है), Subscription Confirmations (जब आपका प्लान एक्टिवेट होता है), और Cancellation Notices (जब आपका प्लान रद्द होता है)। सभी श्रेणियाँ डिफ़ॉल्ट रूप से सक्षम हैं। प्रत्येक ईमेल के नीचे एक अनसब्सक्राइब लिंक शामिल होता है।",
        "mockup": "settings-email-prefs",
        "tip": "आप किसी भी नोटिफ़िकेशन ईमेल के नीचे अनसब्सक्राइब लिंक पर क्लिक करके किसी विशिष्ट ईमेल श्रेणी से भी अनसब्सक्राइब कर सकते हैं। साइन-इन की आवश्यकता नहीं है।"
      },
      {
        "heading": "इंटीग्रेशन",
        "body": "Integrations पैनल उपलब्ध cloud storage कनेक्शन दिखाता है। प्रत्येक integration सर्विस का नाम, विवरण, और एक Connect या Disconnect बटन प्रदर्शित करता है। वर्तमान में समर्थित: Google Drive और Dropbox। कनेक्टेड सर्विसेज एक हरा \"Connected\" बैज दिखाती हैं। अपनी रिलीज़ के साथ आसान फ़ाइल प्रबंधन के लिए अपने cloud storage को लिंक करने के लिए integrations का उपयोग करें।",
        "mockup": "settings-integrations"
      },
      {
        "heading": "मिक्स डिफ़ॉल्ट्स",
        "body": "Mix Defaults पैनल नई रिलीज़ के लिए आपकी पसंदीदा शुरुआती वैल्यूज़ सेट करता है। Pill-style buttons का उपयोग करके डिफ़ॉल्ट Format (Stereo, Dolby Atmos, या Stereo + Atmos) चुनें। ड्रॉपडाउन से डिफ़ॉल्ट Sample Rate (44.1kHz, 48kHz, या 96kHz) और Bit Depth (16-bit, 24-bit, या 32-bit float) चुनें। आप tag input का उपयोग करके एक डिफ़ॉल्ट Element List भी परिभाषित कर सकते हैं (उदा. Vocals, Bass, Drums)। जब आप नई रिलीज़ बनाते हैं तो ये डिफ़ॉल्ट्स स्वचालित रूप से भर जाते हैं, जिससे दोहराव वाले सेटअप पर समय बचता है। अपनी पसंद सेव करने के लिए Save पर क्लिक करें।",
        "mockup": "settings-mix-defaults"
      },
      {
        "heading": "कैलेंडर",
        "body": "Calendar पैनल आपकी रिलीज़ deadline के लिए एक iCal subscription feed प्रदान करता है। एक read-only URL फ़ील्ड आपका व्यक्तिगत feed address दिखाता है, जिसमें clipboard पर कॉपी करने के लिए एक Copy बटन है। उसके नीचे, setup instructions बताते हैं कि Google Calendar, Apple Calendar, या Outlook में feed कैसे जोड़ें। एक Regenerate बटन एक नया feed URL बनाता है अगर आपको पुराने तक पहुँच रद्द करनी हो।",
        "mockup": "settings-calendar",
        "warning": "अपना calendar feed URL regenerate करने से पुराना लिंक अमान्य हो जाता है। पिछले URL से subscribe किए गए किसी भी calendar को अपडेट मिलना बंद हो जाएगा।"
      },
      {
        "heading": "आपका डेटा",
        "body": "Your Data पैनल आपको अपना सारा Mix Architect डेटा export करने देता है। यह एक अनुमानित export आकार दिखाता है और एक Download बटन प्रदान करता है। Export में सभी releases, tracks, audio file metadata, notes, comments, collaborator lists, और settings शामिल हैं। बैकअप के लिए या अगर आप अपने काम की local copy चाहते हैं तो इसका उपयोग करें।",
        "mockup": "settings-data"
      }
    ]
  },
  {
    "id": "manage-subscription",
    "title": "अपना Pro Subscription प्रबंधित करना",
    "category": "billing",
    "summary": "अपना plan देखें, payment details अपडेट करें, और Stripe के माध्यम से अपना Pro subscription प्रबंधित करें।",
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
        "heading": "अपना Plan देखना",
        "body": "[Settings](/app/settings) पर जाएँ और नीचे Subscription सेक्शन तक स्क्रॉल करें। सेक्शन में लिखा है \"Manage your Mix Architect plan.\" आपको अपना वर्तमान plan दिखेगा: Pro accounts \"$14/month, Unlimited releases\" हरे \"PRO\" badge और \"Manage Billing\" बटन के साथ दिखाते हैं। Free accounts इसके बजाय \"Upgrade to Pro\" बटन दिखाते हैं।",
        "mockup": "plan-current"
      },
      {
        "heading": "Pro में Upgrade करना",
        "body": "[Settings](/app/settings) पेज से, Subscription सेक्शन में \"Upgrade to Pro\" पर क्लिक करें। आपको एक secure Stripe checkout पेज पर ले जाया जाएगा। Payment confirm होने पर, आपका account तुरंत upgrade हो जाता है और आपको सभी Pro features तक access मिल जाता है, जिसमें unlimited releases और audio conversion शामिल हैं। Pro badge आपके plan info के बगल में दिखता है।",
        "mockup": "upgrade-pro"
      },
      {
        "heading": "Payment प्रबंधित करना",
        "body": "Stripe billing portal खोलने के लिए [Settings](/app/settings) के Subscription सेक्शन में \"Manage Billing\" पर क्लिक करें। वहाँ से आप अपना payment method अपडेट कर सकते हैं, invoices देख सकते हैं, और receipts download कर सकते हैं। सभी payment processing Stripe द्वारा सुरक्षित रूप से handled होती है।",
        "mockup": "manage-payment"
      }
    ]
  },
  {
    "id": "cancel-resubscribe",
    "title": "Cancellation और Resubscription",
    "category": "billing",
    "summary": "अपना Pro subscription कैसे cancel करें और आपके data का क्या होता है।",
    "tags": [
      "cancel",
      "resubscribe",
      "downgrade",
      "billing"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "अपना Subscription Cancel करना",
        "body": "Stripe portal खोलने के लिए [Settings](/app/settings) के Subscription सेक्शन में \"Manage Billing\" पर क्लिक करें, फिर \"Cancel plan\" पर क्लिक करें। आपका Pro access वर्तमान billing period के अंत तक जारी रहता है। [Settings](/app/settings) में एक notice दिखाएगा कि आपका Pro plan कब expire होता है ताकि आपको ठीक पता चले कि आपका access कब तक है।",
        "mockup": "cancel-subscription"
      },
      {
        "heading": "आपके Data का क्या होता है",
        "body": "आपकी सभी releases, tracks, audio files, comments और payment records पूरी तरह सुरक्षित रहते हैं। Downgrade करने पर आप कुछ भी नहीं खोते। हालाँकि, Pro features (जैसे unlimited releases और audio conversion) resubscribe करने तक अनुपलब्ध हो जाएँगी। आपकी मौजूदा releases accessible बनी रहती हैं।",
        "warning": "Free accounts एक active release तक सीमित हैं। अगर आपके Pro plan expire होने पर एक से अधिक releases हैं, तो आपकी मौजूदा releases सुरक्षित रहती हैं लेकिन आप नई releases तब तक नहीं बना पाएँगे जब तक आप resubscribe नहीं करते या एक release तक कम नहीं करते।",
        "mockup": "data-after-cancel"
      },
      {
        "heading": "Resubscribe करना",
        "body": "Pro को reactivate करने के लिए, [Settings](/app/settings) में Subscription सेक्शन पर जाएँ और \"Upgrade to Pro\" पर फिर से क्लिक करें, या Stripe portal के माध्यम से resubscribe करने के लिए \"Manage Billing\" का उपयोग करें। आपका पिछला data, settings, templates और team configurations सभी intact और तुरंत उपलब्ध हैं।",
        "mockup": "resubscribe"
      }
    ]
  }
];
