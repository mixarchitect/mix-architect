import type { HelpArticle } from "./types";

export const articles: HelpArticle[] = [
  {
    "id": "getting-started-overview",
    "title": "Välkommen till Mix Architect",
    "category": "getting-started",
    "summary": "En snabb rundtur i plattformen: din instrumentpanel, releaser, spår och samarbetsverktyg.",
    "tags": [
      "overview",
      "intro",
      "dashboard",
      "getting started"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Din instrumentpanel",
        "body": "Efter inloggning hamnar du på [Instrumentpanelen](/app). Den visar alla dina releaser i ett responsivt rutnät, sorterade efter senaste aktivitet. Varje release-kort visar sitt omslag, titel, artistnamn, en statuspunkt (färgkodad för Utkast, Pågående eller Klar), en release-typ-etikett (Single, EP eller Album), en formatetikett (Stereo, Dolby Atmos eller Stereo + Atmos) samt antal avklarade spår som \"1 av 6 spår briefade\". Om [betalningsspårning](/app/settings) är aktiverad ser du även betalningsstatistik högst upp: Utestående, Intjänat och Totala arvoden för alla releaser, med en länk \"Visa alla\" till sidan [Betalningar](/app/payments). Använd nålikonen på valfritt release-kort för att fästa det högst upp på instrumentpanelen, och trепunktsmenyn för snabbåtgärder. Sorteringsmenyn låter dig ordna releaser efter Senast ändrad, Titel eller Skapad datum.",
        "mockup": "dashboard"
      },
      {
        "heading": "Rutnätsvy kontra tidslinjevy",
        "body": "Instrumentpanelens sidhuvud har två vyknappar: Rutnät och Tidslinje. Rutnätsvyn (standard) visar dina releaser som kort i ett responsivt rutnät. Tidslinjvyn ordnar releaser kronologiskt baserat på deras planerade releasedatum och visar nedräkningar och schemaläggningsinformation. Din vyinställning sparas automatiskt. Läs mer i [Använda tidslinjvyn](/app/help?article=timeline-overview)."
      },
      {
        "heading": "Navigera i appen",
        "body": "Sidofältet (dator) eller bottenfältet (mobil) ger dig snabb åtkomst till alla delar av appen: [Instrumentpanelen](/app) för dina releaser, Sök (eller Cmd+K / Ctrl+K) för att direkt hoppa till valfri release eller spår, [Mallar](/app/templates) för återanvändbara release-förinställningar, [Betalningar](/app/payments) för arvodespårning (om aktiverad), [Inställningar](/app/settings) för din profil, standardvärden och prenumeration, samt [Hjälp](/app/help) för dokumentation. Sidofältet inkluderar även Notiser för aktivitetsuppdateringar, Auto för automationsfunktioner och Logga ut. Temaväxling mellan Ljust, Mörkt och Systemläge finns i [Inställningar](/app/settings) under Utseende.",
        "tip": "Tryck Cmd+K (Mac) eller Ctrl+K (Windows) var som helst i appen för att direkt söka efter och hoppa till valfri release eller spår.",
        "mockup": "nav-rail"
      },
      {
        "heading": "Nyckelbegrepp",
        "body": "Releaser är dina toppnivåprojekt (album, EP:er eller singlar). Varje release innehåller ett eller flera spår. På datorn har release-detaljsidan en tvåkolumnslayout: spårlistan till vänster och ett inspektörssidofält till höger som visar omslaget, Release-info (artist, typ, format, status, måldatum, genre), Global mixriktning, Globala referenser och Betalningsstatus. Varje spår har sex flikar: Intent, Specs, Audio, Distribution, Portal och Notes. Klicka på kugghjulsikonen i release-huvudet för att öppna Release-inställningar, där du kan redigera all metadata, hantera ditt team och konfigurera betalning. Sidhuvudet har även knappar för Portal-växlaren (med en länk för att öppna portalen), Spara som mall och kugghjulsikonen.",
        "mockup": "key-concepts"
      }
    ]
  },
  {
    "id": "create-first-release",
    "title": "Skapa din första release",
    "category": "getting-started",
    "summary": "Steg-för-steg-guide för att skapa en release, lägga till omslag, ladda upp spår och ställa in status.",
    "tags": [
      "create",
      "release",
      "new project",
      "setup"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Skapa en ny release",
        "body": "Från [Instrumentpanelen](/app) klickar du på knappen \"+ New Release\" i övre högra hörnet. Om du har sparade [mallar](/app/templates) visas först en mallväljare där du kan välja en mall eller klicka \"Start from scratch\". Skapandeformuläret frågar efter en titel, ett valfritt artist-/klientnamn, release-typ (Single, EP eller Album), format (Stereo, Dolby Atmos eller Stereo + Atmos), genretaggar (välj bland förslag som Rock, Pop, Hip-Hop, Electronic osv. eller lägg till egna) och ett planerat releasedatum.",
        "tip": "När du skapar en Single skapas automatiskt ett spår med release-titeln och dina standardspecifikationer från [Inställningar](/app/settings) tillämpade.",
        "mockup": "create-release"
      },
      {
        "heading": "Release-detaljsidan",
        "body": "Efter skapandet hamnar du på release-detaljsidan. På datorn har denna en tvåkolumnslayout: spårlistan till vänster med en \"Flow\"-knapp och en \"+ Add Track\"-knapp, och ett inspektörssidofält till höger. Inspektörssidofältet visar omslaget, Release-info (Artist, Typ, Format, Status, Måldatum, Genre), Global mixriktning (klicka på pennikonen för att uppdatera) och Globala referenser (klicka \"+ Add\" för att söka och lägga till referensspår). Om betalningsspårning är aktiverad visas sektionen Betalning längst ner i sidofältet. För att lägga till eller ändra omslaget klickar du på pennikonen på konstverket i sidofältet. Detta visar alternativ under bilden: en Ladda upp-knapp för att välja en fil, en Ta bort-knapp (om konst redan finns) och ett fält \"Or paste URL\" för att länka en bild direkt. Nya releaser visar ett streckad uppladdningsområde med \"Click to upload\" (JPEG eller PNG, minst 1400x1400). För att redigera annan release-metadata klickar du på kugghjulsikonen i sidhuvudet för att öppna Release-inställningar.",
        "mockup": "cover-art-upload"
      },
      {
        "heading": "Lägg till spår",
        "body": "I release-detaljvyn klickar du på \"+ Add Track\" i sidhuvudet bredvid Flow-knappen. Ge ditt spår en titel så skapas det med dina standardspecifikationer från [Inställningar](/app/settings) tillämpade. Varje spår visas i listan med nummer, titel, intent-förhandsvisning, statuspunkt och godkännandeetikett. Du kan dra spår för att ordna om dem med grepphandtaget till vänster, eller använda flytta upp/ner-knapparna. Ta bort spår med papperskorgsikonen till höger. Klicka på valfritt spår för att öppna det och börja arbeta i dess sex flikar.",
        "mockup": "track-upload"
      },
      {
        "heading": "Ställ in release-status",
        "body": "Varje release har en status: Utkast, Pågående eller Klar. Du kan ändra status från inspektörssidofältet genom att klicka på statusetiketten bredvid \"Status\" i Release-info-sektionen, eller från Release-inställningar (kugghjulsikonen). En release ändras automatiskt till Pågående när arbete har påbörjats (till exempel vid uppladdning av ljud eller tillägg av spår). Statusetikettens färg visas på dina release-kort på [Instrumentpanelen](/app) (orange för Utkast, blå för Pågående, grön för Klar) och är synlig för alla medarbetare och i klientportalen.",
        "mockup": "release-status"
      }
    ]
  },
  {
    "id": "invite-collaborators",
    "title": "Bjuda in medarbetare till en release",
    "category": "getting-started",
    "summary": "Dela din release med teammedlemmar och externa klienter med hjälp av roller och portalen.",
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
        "heading": "Skicka inbjudningar",
        "body": "Öppna en release och klicka på kugghjulsikonen i sidhuvudet för att gå till Release-inställningar. Scrolla ner förbi release-metadata till sektionen Team längst ner. Ange e-postadressen till personen du vill bjuda in, välj deras roll från rullgardinsmenyn (Medarbetare eller Klient) och klicka \"Invite\". De får ett e-postmeddelande med en länk för att gå med i releasen. Aktiva teammedlemmar visas under inbjudningsformuläret med sin e-postadress, rolletikett, status och en raderingsknapp för att ta bort dem.",
        "mockup": "invite-collaborator"
      },
      {
        "heading": "Medarbetare kontra klientroller",
        "body": "Det finns två roller. Medarbetare har full åtkomst att visa och redigera allt release-innehåll: spår, intent, specs, ljud, anteckningar, distributionsmetadata och release-inställningar. Klienter har skrivskyddad åtkomst via klientportalen och kan ge feedback genom kommentarer, godkänna eller begära ändringar på enskilda spår och ladda ner ljudfiler om det är tillåtet. Rolletiketten visas bredvid varje teammedlems e-postadress i sektionen Team.",
        "mockup": "collaborator-roles"
      },
      {
        "heading": "Acceptera inbjudningar",
        "body": "När någon klickar på inbjudningslänken och går med i releasen visas de i teamlistan med sin rolletikett och statusen \"Active\". Du får en notis i appen som meddelar att de har gått med. Inbjudna som inte har ett Mix Architect-konto uppmanas att skapa ett när de klickar på inbjudningslänken.",
        "tip": "Du kan ta bort en teammedlem när som helst genom att klicka på papperskorgsikonen bredvid deras namn i sektionen Team i Release-inställningar.",
        "mockup": "accept-invitation"
      },
      {
        "heading": "Delning via klientportalen",
        "body": "För externa intressenter som behöver granska utan att logga in aktiverar du klientportalen från release-detaljsidans sidhuvud. Klicka på Portal-växlaren för att aktivera den (växlaren blir grön när den är aktiv), och använd sedan länkikonen bredvid växlaren för att kopiera den unika delnings-URL:en. Skicka denna länk till din klient för läsåtkomst utan att behöva ett Mix Architect-konto. Portalen visar release-briefen, spårlistan, ljuduppspelning och ett kommentarssystem. Använd portalinställningarna för att styra vilka release-sektioner som är synliga för klienter: mixriktning, specs, referenser, betalningsstatus, distributionsinformation och låttexter. För kontroll per spår använder du Portal-fliken på varje spår.",
        "mockup": "portal-sharing"
      }
    ]
  },
  {
    "id": "track-tabs",
    "title": "Spårdetaljer: Förstå flikarna",
    "category": "releases",
    "summary": "Varje spår har sex flikar för att hantera alla aspekter av din mix: Intent, Specs, Audio, Distribution, Portal och Notes.",
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
        "body": "Fliken Intent är där du beskriver den kreativa visionen för ett spår. Högst upp finns ett fritextfält under \"What should this track feel like?\" där du kan skriva mixriktningen (klicka \"Edit\" för att ändra). Under det låter sektionen Emotional Qualities dig tagga spåret med beskrivande ord: valda taggar visas som fyllda etiketter (t.ex. spacious, warm, punchy, nostalgic), och tillgängliga förslag visas som konturetiketter du kan klicka för att lägga till (aggressive, intimate, gritty, polished, dark, bright, raw, lush, dreamy, lo-fi, cinematic, minimal, dense, ethereal, hypnotic, euphoric, melancholic, organic, synthetic, chaotic, smooth, haunting, playful, anthemic, delicate, heavy, airy). Sektionen Anti-References längst ner låter dig beskriva ljud eller tillvägagångssätt du vill undvika. I det högra sidofältet visar Quick View spårets status, ljudkvalitet (samplingsfrekvens/bitdjup) och format med en snabb överblick. Under det låter sektionen References dig söka och lägga till referensspår (från Apple Music) med valfria anteckningar som beskriver vad som ska refereras från varje spår.",
        "mockup": "track-tab-intent"
      },
      {
        "heading": "Specs",
        "body": "Fliken Specs innehåller de tekniska specifikationerna för ditt spår. Sektionen Technical Settings har tre rullgardinsmenyer: Format (Stereo, Dolby Atmos eller Stereo + Atmos), Sample Rate (44.1kHz, 48kHz, 88.2kHz, 96kHz) och Bit Depth (16-bit, 24-bit, 32-bit float). Dessa värden är referensmetadata som beskriver källjudet och används som standardvärden för nya spår skapade från mallar; de styr inte konverteringsutdata. Under det hanterar sektionen Delivery dina utdataformat. Välj vilka format som ska vara tillgängliga genom att klicka på formatchipsen: konverterbara format inkluderar WAV, AIFF, FLAC, MP3, AAC, OGG och ALAC. Icke-konverterbara format (DDP, ADM BWF/Atmos, MQA) kan väljas som referens men visar en infotooltip som förklarar att de inte kan autokonverteras. Valda format markeras i grönt med en bockikon. Använd rullgardinsmenyn \"Export from\" för att välja vilken ljudversion konverteringen ska utgå ifrån (t.ex. \"v3 - Typical Wonderful 2025-10-10 MGO.wav (latest)\"). Klicka på nedladdningsilikonen bredvid valfritt valt konverterbart format för att starta en konvertering. Du kan också skriva ett anpassat formatnamn i fältet \"Custom format...\" och klicka \"+ Add\". Längst ner låter textfältet Special Requirements dig notera eventuella leveransspecifika instruktioner.",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Audio",
        "body": "Fliken Audio är där du laddar upp filer, hanterar versioner och spelar upp ljud. Sidhuvudet visar release- och spårnamnet med albumomslaget. Versionsväljaren (v1, v2, v3 osv.) låter dig växla mellan revisioner; klicka på +-knappen för att ladda upp en ny version. Varje version visar sitt versionsnummer, uppladdningsdatum, antal kommentarer och en nedladdningsknapp. Vågformsvisualiseringen visar ljudet med interaktiv uppspelning: klicka var som helst för att hoppa till den positionen, och använd transportkontrollerna nedanför (loop, hoppa bakåt, spela/pausa, hoppa framåt, upprepa). LUFS-ljudstyrkemätningen visas bredvid filens metadata (format, samplingsfrekvens, bitdjup), färgkodad mot ljudstyrkemål. Sektionen Feedback under vågformen visar alla tidsstämplade kommentarer för aktuell version. Dubbelklicka var som helst på vågformen för att lägga till en ny kommentar vid den tidkoden. Kommentarsmarkörer visas som små ikoner på vågformen vid sina respektive positioner.",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "Ljudstyrkeanalys (LUFS)",
        "body": "När du laddar upp ljud mäter Mix Architect automatiskt den integrerade ljudstyrkan i LUFS (Loudness Units Full Scale). Klicka på LUFS-värdet bredvid versionsmetadata för att expandera panelen Loudness Analysis. Denna visar hur varje större streamingtjänst, sändningsstandard och social plattform kommer att justera ditt spår under uppspelning. Varje rad visar plattformens namn, dess målloudness (t.ex. Spotify riktar sig mot -14 LUFS) och den förstärkningsändring som skulle tillämpas på din fil. Ett positivt värde betyder att tjänsten höjer volymen på ditt spår; ett negativt värde (visat i orange) betyder att den sänks. Om din mix till exempel mäter -14.9 LUFS skulle Spotify tillämpa +0.9 dB medan Apple Music (mål -16) skulle tillämpa -1.1 dB. Panelen är grupperad i Streaming (Spotify, Apple Music, YouTube, Tidal, Amazon Music, Deezer, Qobuz, Pandora), Broadcast (EBU R128, ATSC A/85, ITU-R BS.1770) och Social (Instagram/Reels, TikTok, Facebook). Använd detta för att kontrollera om din master kommer att ändras avsevärt på någon plattform innan leverans.",
        "mockup": "track-tab-lufs"
      },
      {
        "heading": "Distribution",
        "body": "Fliken Distribution samlar all metadata som behövs för digital distribution. Den inkluderar tre uppdelade sektioner, var och en med knappar för \"+ Add Person\": Writing Split (personnamn, procent, PRO-tillhörighet som ASCAP/BMI, medlemskontonummer och Writer IPI-nummer), Publishing Split (förlagsnamn, procent, Publisher Member ID och Publisher IPI) och Master Recording Split (enhetsnamn och procent). Den löpande summan för varje split-sektion visas i grönt när den är 100 % eller i orange när den inte är det. Under splitsen: Codes and Identifiers (fälten ISRC och ISWC), Credits (producent- och kompositörs-/låtskrivarnamn), Track Properties (featured artist, språkväljare, växlare för explicit lyrics, instrumental och cover song), Copyright (registreringsnummer och copyrightdatum) och Lyrics (textfält för hela låttexten).",
        "mockup": "track-tab-distribution"
      },
      {
        "heading": "Portal",
        "body": "Fliken Portal styr hur klienter interagerar med detta specifika spår. Högst upp visar sektionen Client Approval aktuell godkännandestatus (t.ex. \"Approved\" i grönt) tillsammans med en tidsstämplad historik över alla godkännandehändelser: godkänt, begärt ändringar (med klientens anteckning), återöppnat för granskning och återgodkänt, var och en med datum. Under det låter Track Portal Visibility dig växla om spåret är synligt på portalen, om nedladdningar är aktiverade och vilka specifika ljudversioner (Version 1, Version 2, Version 3 osv.) klienten kan komma åt, var och en med sin egen växlare. En anteckning längst ner påminner dig om att portalaktivering och delningslänken finns i release-sidans sidhuvud.",
        "mockup": "track-tab-portal"
      },
      {
        "heading": "Notes",
        "body": "Fliken Notes är ett allmänt utrymme för revisionsanteckningar och diskussion som inte är kopplat till en specifik tidskod. Högst upp finns ett textfält med platshållaren \"Add a note...\" och en \"Post\"-knapp. Anteckningar visas nedan i omvänd kronologisk ordning. Varje anteckning visar författarens namn, ett datum eller relativ tid och meddelandet. Klientanteckningar särskiljs visuellt med en grön \"Client\"-etikett så att du kan skilja intern feedback från extern feedback med en blick. Använd denna flik för allmänna revisionsdirektiv, att-göra-listor och diskussion som inte behöver referera till ett specifikt ögonblick i ljudet. För tidsspecifik feedback, använd fliken Audios vågformskommentarer istället.",
        "mockup": "track-tab-notes"
      }
    ]
  },
  {
    "id": "client-portal",
    "title": "Klientportal och godkännanden",
    "category": "releases",
    "summary": "Dela din release med klienter via en unik länk, styr vad de ser och följ godkännanden per spår.",
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
        "heading": "Aktivera portalen",
        "body": "På release-detaljsidan letar du efter Portal-växlaren i sidhuvudet (uppe till höger). Klicka på växlaren för att aktivera den (den blir grön när den är aktiv). När den är aktiv klickar du på länkikonen bredvid växlaren för att kopiera den unika delnings-URL:en. Skicka denna länk till din klient för läsåtkomst utan att behöva ett Mix Architect-konto. Portalen visar release-briefen, spårlistan, ljudspelarna och ett kommentarssystem. Använd portalinställningarna för att styra vilka release-sektioner som är synliga för klienter: mixriktning, specs, referenser, betalningsstatus, distributionsmetadata och låttexter.",
        "mockup": "portal-settings"
      },
      {
        "heading": "Synlighet per spår",
        "body": "För varje spår går du till Portal-fliken för att styra vad din klient kan se. Sektionen Track Portal Visibility har växlare för: \"Visible on portal\" (visa eller dölj hela spåret), \"Enable download\" (tillåt eller blockera ljudnedladdningar) och individuella versionsväxlare (Version 1, Version 2, Version 3 osv.) för att styra vilka ljudrevisioner klienten kan komma åt. Detta ger dig detaljerad kontroll så att du kan dölja pågående arbeten och bara dela färdiga mixar. Alla växlare är oberoende, så du kan göra ett spår synligt men inaktivera nedladdningar, eller bara visa den senaste versionen.",
        "mockup": "portal-track-visibility"
      },
      {
        "heading": "Spårgodkännanden",
        "body": "Klienter kan godkänna eller begära ändringar på enskilda spår via portalen. Godkännandestatusen spåras i sektionen Client Approval på varje spårs Portal-flik. Statusen visar en färgad etikett (t.ex. grön \"Approved\") med en komplett tidsstämplad historik över varje godkännandehändelse: när klienten godkände, när de begärde ändringar (inklusive deras anteckning, som \"Vocals too quiet\"), när spåret återöppnades för granskning och när det återgodkändes. Detta ger dig en tydlig revisionshistorik över alla klientbeslut. Godkännandeetiketter visas även i spårlistan på release-detaljsidan, så att du snabbt kan se vilka spår som är godkända.",
        "mockup": "portal-approval"
      }
    ]
  },
  {
    "id": "templates",
    "title": "Använda release-mallar",
    "category": "releases",
    "summary": "Spara tid genom att skapa releaser från återanvändbara mallar med förkonfigurerade specifikationer och inställningar.",
    "tags": [
      "templates",
      "reuse",
      "workflow",
      "presets"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Vad mallar innehåller",
        "body": "En mall fångar en omfattande uppsättning release-standardvärden fördelade på sex hopfällbara sektioner. Basics: mallnamn, beskrivning, en kryssruta \"Set as default template\" (auto-vald för nya releaser) och artist-/klientnamn samt e-post. Release Settings: release-typ (Single, EP eller Album), format (Stereo, Dolby Atmos eller Stereo + Atmos) och genretaggar. Technical Specs: samplingsfrekvens, bitdjup, leveransformatval (WAV, AIFF, FLAC, MP3, AAC, OGG, DDP, ADM BWF/Atmos, MQA, ALAC) och specialkrav. Intent Defaults: förvalda emotional quality-taggar för nya spår. Distribution Metadata: distributör, skivbolag, copyrightinnehavare, språk, primärgenre och rättighets- och förlagskontakter. Payment Defaults: betalningsstatus, valuta och betalningsanteckningar. När du skapar en release från en mall tillämpas alla dessa standardvärden automatiskt.",
        "mockup": "template-contents"
      },
      {
        "heading": "Skapa och hantera mallar",
        "body": "Det finns två sätt att skapa en mall. Från valfri release-detaljsida klickar du på knappen \"Save as Template\" i sidhuvudet (bredvid kugghjulsikonen) för att fånga den releasens aktuella konfiguration. Eller gå till sidan [Mallar](/app/templates) och klicka \"+ New Template\" för att bygga en från grunden med det fullständiga mallformuläret. Varje mallkort på sidan [Mallar](/app/templates) visar sitt namn, beskrivning och en sammanfattningsrad som \"Single, Stereo + Atmos, 96 kHz / 24-bit, 4 delivery formats\". Använd trepunktsmenyn på valfritt mallkort för alternativ som redigering eller radering. Ge mallar beskrivande namn som \"Stereo Master\" eller \"Atmos EP\" för att hålla dem organiserade.",
        "mockup": "template-create"
      },
      {
        "heading": "Skapa en release från en mall",
        "body": "När du skapar en ny release från [Instrumentpanelen](/app) visas, om du har sparade mallar, en \"Start from a template\"-väljare som första steg. Den lyder \"Pre-fill your release settings, or start from scratch.\" Välj ett mallkort och klicka \"Use Template\" för att förfylla det nya release-formuläret med dessa inställningar, eller klicka \"Start from scratch\" för att hoppa över. Formuläret för att skapa release har också en länk \"Change template\" längst ner om du vill byta. Alla mallinställningar kan anpassas efter att releasen har skapats.",
        "tip": "Markera din mest använda mall som standard (kryssrutan \"Set as default template\") så att den auto-väljs varje gång du skapar en ny release.",
        "mockup": "template-use"
      }
    ]
  },
  {
    "id": "payment-tracking",
    "title": "Betalningsspårning",
    "category": "releases",
    "summary": "Spåra arvoden, betalningar och utestående saldon över dina releaser.",
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
        "heading": "Aktivera betalningsspårning",
        "body": "Gå till [Inställningar](/app/settings) och hitta sektionen Payment Tracking. Sektionen lyder: \"Track fees and payment status on releases and tracks. Turn this off if you're mixing your own projects.\" Aktivera \"Enable payment tracking\". När den är aktiverad visas betalningsrelaterade funktioner genom hela appen: arvodesstatistik på [Instrumentpanelen](/app) (Utestående, Intjänat, Totala arvoden), en sektion Betalning i inspektörssidofältet på varje release och sidan [Betalningar](/app/payments) i sidofältets navigation.",
        "mockup": "payment-dashboard"
      },
      {
        "heading": "Ställa in release-arvoden",
        "body": "Öppna Release-inställningar (klicka på kugghjulsikonen på valfri release). Scrolla ner till sektionen Payment. Ställ in betalningsstatus: No Fee, Unpaid, Partial eller Paid. Använd textfältet Payment Notes för att notera villkor, insättningsinformation eller förfallodatum. Arvodesbeloppet och betalningsinformationen syns även i inspektörssidofältet på release-detaljsidan under rubriken Payment, där du kan klicka på statusen för att snabbt ändra den.",
        "mockup": "payment-release-fees"
      },
      {
        "heading": "Betalningsöversikt",
        "body": "Gå till sidan [Betalningar](/app/payments) från sidofältet. Högst upp visar tre sammanfattningskort Utestående (totalt obetalt), Intjänat (totalt betalt) och Totala arvoden för alla releaser, var och en med antal releaser. Nedanför listar en tabell varje release med betalningsdata: Release-namn, Datum, Artist, Arvode, Betalt, Saldo och Status (med färgade etiketter som \"Partial\" i orange). En Total-rad längst ner summerar alla arvoden. Använd knappen \"Export CSV\" för att ladda ner betalningsdata som ett kalkylblad, eller \"Download PDF\" för att generera en utskriftsklar betalningssammanfattning.",
        "tip": "Klicka på kortet Utestående eller Intjänat på [Instrumentpanelen](/app) för att snabbt filtrera till releaser som matchar den betalningsstatusen.",
        "mockup": "payment-track-fees"
      }
    ]
  },
  {
    "id": "distribution-tracker",
    "title": "Distributionsspårare",
    "category": "releases",
    "summary": "Spåra var din release har skickats in, övervaka status på olika plattformar och bli notifierad när den går live på Spotify.",
    "tags": ["distribution", "tracker", "spotify", "apple music", "platform", "status", "live", "submitted"],
    "updatedAt": "2026-03-14",
    "content": [
      {
        "heading": "Lägga till plattformar till en release",
        "body": "Öppna valfri release och scrolla ner till panelen Distribution Tracker under spårlistan. Klicka \"+ Add Platform\" för att lägga till en streamingplattform. Välj bland Spotify, Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud eller Bandcamp. Varje plattform visas som en rad med sin officiella logotyp, en statusindikator och en distributörstagg. Du kan även använda \"Mark as Submitted\" för att lägga till flera plattformar samtidigt: välj en distributör (DistroKid, TuneCore, CD Baby, LANDR, Ditto, AWAL, UnitedMasters, Amuse, RouteNote eller Self-released), markera vilka plattformar du skickade till och klicka Submit.",
        "mockup": "distribution-add-platform"
      },
      {
        "heading": "Statuslägen",
        "body": "Varje plattformspost har en status som spårar var den befinner sig i releasepipelinen. De sex lägena är: Not Submitted (grå, standard för nyligen tillagda plattformar), Submitted (blå, du har skickat releasen till din distributör), Processing (orange, distributören granskar eller bearbetar), Live (grön, releasen är tillgänglig på plattformen), Rejected (röd, plattformen eller distributören avvisade releasen) och Taken Down (röd, releasen var tidigare live men har tagits bort). Klicka på statusindikatorn på valfri plattformsrad för att ändra den. Statusändringar loggas i plattformshistoriken så att du kan se när varje övergång skedde.",
        "mockup": "distribution-status"
      },
      {
        "heading": "Spotify automatisk upptäckt",
        "body": "Spotify listas högst upp i Distribution Tracker med en etikett \"Updates automatically\". När du markerar Spotify som Submitted kontrollerar Mix Architect regelbundet Spotifys katalog efter din release med hjälp av ISRC-koden (från spårets Distribution-flik) eller releasens titel och artistnamn. När din release hittas på Spotify ändras statusen automatiskt till Live, Spotify-URL:en sparas och du får en notifikation. Du kan också klicka \"Check Now\" för att utlösa en omedelbar kontroll. Automatisk upptäckt körs dagligen för alla inskickade Spotify-poster.",
        "tip": "Fyll i ISRC-koden på ditt spårs Distribution-flik innan du skickar in. ISRC-baserad upptäckt är mer tillförlitlig än titel/artist-matchning, särskilt för vanliga namn.",
        "mockup": "distribution-spotify"
      },
      {
        "heading": "Uppdatera status och lägga till länkar",
        "body": "För att ändra en plattforms status klickar du på statusindikatorn på plattformsraden. En rad med statusetiketter visas där du kan välja det nya läget. För att lägga till en länk till releasen på den plattformen klickar du på \"Add link\" bredvid plattformsnamnet. Ange URL:en (till exempel Spotify-albumlänken eller Apple Music-sidan) och klicka Save. Länkikonen förvandlas till en klickbar extern länk som öppnar releasesidan på den plattformen. Använd trepunktsmenyn på valfri plattformsrad för ytterligare alternativ: redigera detaljer, ta bort plattformen eller visa historiken över statusändringar.",
        "mockup": "distribution-edit"
      },
      {
        "heading": "Massinskickning och uppdatering",
        "body": "\"Mark as Submitted\" låter dig registrera en massinskickning till din distributör. Välj distributören från rullgardinsmenyn, markera plattformarna du skickade till och klicka Submit. Alla valda plattformar läggs till med statusen Submitted och distributörstaggen. \"Check Now\" visas på Spotify-poster som har skickats in. Att klicka på den utlöser en omedelbar Spotify-katalogsökning. Om releasen hittas uppdateras statusen till Live och URL:en sparas automatiskt. För alla andra plattformar (Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud, Bandcamp) uppdaterar du statusen manuellt när du bekräftar att releasen är live.",
        "mockup": "distribution-bulk"
      },
      {
        "heading": "Distributörstaggar",
        "body": "Varje plattformspost kan ha en distributörstagg som visar vilken tjänst du använde för att skicka in (DistroKid, TuneCore, CD Baby osv.). Denna visas som en liten etikett bredvid statusindikatorn. Distributörstaggar sätts automatiskt när du använder \"Mark as Submitted\", eller så kan du ställa in dem individuellt när du redigerar en plattformspost. Detta hjälper dig att spåra vilken distributör som hanterade vilken plattform, särskilt om du använder olika distributörer för olika territorier eller plattformar.",
        "warning": "Analys återspeglar bara data du har spårat i Mix Architect. Om du skickar in via en distributörs egen instrumentpanel, kom ihåg att uppdatera statusen här så att din spårare förblir korrekt.",
        "mockup": "distribution-distributor"
      }
    ]
  },
  {
    "id": "user-analytics",
    "title": "Användaranalys",
    "category": "releases",
    "summary": "Visa dina avslutade releaser, genomsnittlig handläggningstid, total intäkt och uppdelning per klient i analysinstrumentpanelen.",
    "tags": ["analytics", "dashboard", "revenue", "turnaround", "velocity", "clients", "charts"],
    "updatedAt": "2026-03-14",
    "content": [
      {
        "heading": "Vad analyssidan visar",
        "body": "Gå till sidan [Analys](/app/analytics) från sidofältet. Instrumentpanelen visar fyra sammanfattningskort högst upp: Avslutade releaser (totalt antal färdiga projekt med månadsgenomsnitt), Genomsnittlig handläggningstid (dagar från skapande till färdigställande, med uppdelning på snabbast och långsammast), Total intäkt (summan av alla spårade arvoden med utestående saldo) och Klienter (unikt klientantal med totalt antal releaser). Under sammanfattningskorten visualiserar tre diagram din data över tid, och en klientuppdelningstabell visar statistik per klient.",
        "mockup": "analytics-overview"
      },
      {
        "heading": "Releasehastighet och handläggningstid",
        "body": "Diagrammet Releasehastighet är ett stapeldiagram som visar hur många releaser du färdigställde varje månad inom det valda datumintervallet. Högre staplar innebär mer produktiva månader. Använd detta för att upptäcka trender i din produktion och identifiera intensiva eller lugna perioder. Diagrammet Handläggningstid visar det genomsnittliga antalet dagar från skapande till färdigställande per månad. Lägre staplar innebär snabbare leverans. Tillsammans hjälper dessa diagram dig att förstå din kapacitet och om ditt arbetsflöde blir snabbare eller långsammare över tid.",
        "mockup": "analytics-velocity"
      },
      {
        "heading": "Intäktsdiagram",
        "body": "Intäktsdiagrammet är ett ytdiagram som visar totala arvoden intjänade per månad. Det spårar betalningsbeloppen registrerade på dina releaser, så det återspeglar vad klienter faktiskt har betalat. Använd detta för att se intäktstrender, identifiera dina mest inkomstbringande månader och planera för lugnare perioder. Intäktsdata kommer från betalningsspårningsfunktionen på varje release, så se till att arvoden och betalningsstatusar är uppdaterade för korrekt rapportering.",
        "mockup": "analytics-revenue"
      },
      {
        "heading": "Klientuppdelning",
        "body": "Tabellen Klientuppdelning längst ner på analyssidan listar varje klient med sina nyckeltal: antal releaser, total intäkt, betalt belopp och genomsnittlig handläggningstid. Detta hjälper dig att identifiera vilka klienter som genererar mest arbete och intäkt, vem som betalar i tid och var din tid spenderas. Klicka på valfri klientrad för att se deras releaser. Tabellen sorteras efter intäkt som standard.",
        "mockup": "analytics-clients"
      },
      {
        "heading": "Datumintervallväljare",
        "body": "Använd datumintervallväljaren i övre högra hörnet för att styra vilken period analysen täcker. Förinställda intervall inkluderar Senaste 7 dagarna, Senaste 30 dagarna, Senaste 90 dagarna och Senaste 365 dagarna. Du kan också ställa in ett anpassat datumintervall genom att välja specifika start- och slutdatum. Alla fyra sammanfattningskort och alla tre diagram uppdateras för att återspegla den valda perioden. Datumintervallväljaren fungerar på samma sätt i hela analysinstrumentpanelen.",
        "tip": "Använd 365-dagarsintervallet för årsöversikter och skatteförberedelser. 30-dagarsintervallet är användbart för månatliga avstämningar av din verksamhets hälsa.",
        "mockup": "analytics-date-range"
      }
    ]
  },
  {
    "id": "upload-audio-tracks",
    "title": "Ladda upp och hantera ljud",
    "category": "audio",
    "summary": "Hur du laddar upp ljudfiler, hanterar versioner och använder vågformsspelaren.",
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
        "heading": "Ladda upp ljud",
        "body": "Öppna valfritt spår och gå till fliken Audio. Klicka på uppladdningsområdet eller dra och släpp en fil direkt på det. Stödda format: WAV, AIFF, FLAC, MP3, AAC och M4A, upp till 500 MB per fil. Filen laddas upp till säker molnlagring och en vågformsvisualisering genereras automatiskt. Filmetadata (format, samplingsfrekvens, bitdjup, längd) fångas och visas under versionsinformationen, till exempel: \"Typical Wonderful 2025-10-10 MGO.wav, WAV, 48kHz, 24-bit\".",
        "mockup": "audio-upload"
      },
      {
        "heading": "Spårversioner",
        "body": "Varje gång du laddar upp en ny fil till samma spår blir den nästa version. Versionsväljaren ovanför vågformen visar numrerade knappar (v1, v2, v3 osv.) plus en +-knapp för att ladda upp ytterligare en version. Klicka på valfri version för att växla till den. Varje version visar sitt versionsnummer, uppladdningsdatum, antal kommentarer och en nedladdningsikon för att ladda ner originalfilen. Tidigare versioner bevaras fullständigt med sina egna kommentarer och vågform.",
        "tip": "Ladda upp reviderade mixar till samma spår istället för att skapa ett nytt spår. Detta håller din versionshistorik ren, bevarar kommentarer på äldre versioner och låter dig jämföra mixar över tid.",
        "mockup": "track-versions"
      },
      {
        "heading": "Vågformsspelaren",
        "body": "Varje uppladdad version visar en interaktiv vågform. Klicka var som helst på vågformen för att hoppa till den positionen. Transportkontrollerna under vågformen inkluderar: aktuell tid, loop-växlare, hoppa bakåt, spela/pausa, hoppa framåt, upprepningsväxlare och total längd. Spelaren visar även en integrerad LUFS-ljudstyrkemätning (t.ex. \"-14.8 LUFS\") bredvid filens metadata, färgkodad mot ljudstyrkemål så att du kan bedöma nivåer med en blick. Om det finns tidsstämplade kommentarer på aktuell version visas små markörikoner på vågformen vid deras positioner.",
        "mockup": "track-tab-audio"
      }
    ]
  },
  {
    "id": "audio-converter",
    "title": "Leveransformat och konvertering",
    "category": "audio",
    "summary": "Ställ in leveransformat, konvertera ljud och bädda automatiskt in metadatataggar som artist, omslag, ISRC och låttexter.",
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
        "heading": "Ställa in leveransformat",
        "body": "Öppna valfritt spår och gå till fliken Specs. Scrolla till sektionen Delivery. Här väljer du vilka utdataformat ditt projekt behöver genom att klicka på formatchipsen. Tillgängliga konverterbara format: WAV, AIFF, FLAC, MP3, AAC, OGG och ALAC. Valda format markeras i grönt med en bockikon. Ytterligare icke-konverterbara format (DDP, ADM BWF/Atmos, MQA) kan aktiveras som referens; de visar en infotooltip som förklarar att automatisk konvertering inte är tillgänglig. Du kan också skriva ett anpassat formatnamn i inmatningsfältet \"Custom format...\" och klicka \"+ Add\" för format som inte listas. Använd rullgardinsmenyn \"Export from\" för att välja vilken ljudversion konverteringen ska utgå ifrån, som \"v3 - filename.wav (latest)\".",
        "mockup": "format-convert"
      },
      {
        "heading": "Konvertera och ladda ner",
        "body": "Välj vilka format som ska vara tillgängliga genom att klicka på formatchipsen i sektionen Delivery: konverterbara format inkluderar WAV, AIFF, FLAC, MP3, AAC, OGG och ALAC. Valda format markeras i grönt med en bock. Klicka på nedladdningsilikonen bredvid valfritt valt konverterbart format för att starta en konvertering. Ikonen visar en spinner medan konverteringen bearbetas i bakgrunden. När konverteringen är klar laddas filen automatiskt ner till din webbläsare. Varje konvertering använder den ljudversion du valde i rullgardinsmenyn \"Export from\" och konverterar från den ursprungliga uppladdade filen för att bevara maximal ljudkvalitet. Förlustfria format (WAV, AIFF, FLAC, ALAC) bevarar källfilens samplingsfrekvens och bitdjup. Förlustbehäftade format använder optimerade förinställningar: MP3 exporteras med 44.1 kHz / 320 kbps, AAC med 44.1 kHz / 256 kbps och OGG med 44.1 kHz / Quality 8.",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Automatisk metadata-inbäddning",
        "body": "När du konverterar till MP3, FLAC, AAC, OGG eller ALAC skriver Mix Architect automatiskt branschstandardiserade metadatataggar i utdatafilen. Detta inkluderar: artist, titel, album, spårnummer, genre, utgivningsår, copyright, ISRC, UPC/streckkod, låttexter, omslag och ReplayGain. ReplayGain är en loudness-tagg som talar om för kompatibla spelare hur mycket volymen ska justeras så att spår spelas upp på en konsekvent nivå utan clipping. Mix Architect beräknar det från det uppmätta LUFS-värdet av ditt ljud med standarden ReplayGain 2.0 (referensnivå -18 LUFS). MP3-filer får ID3v2-taggar, FLAC och OGG använder Vorbis comments, och AAC/ALAC använder iTunes-stil MP4 atoms. All metadata hämtas från dina release- och spårdetaljer (inklusive fliken Distribution för ISRC och låttexter, samt release-omslaget). WAV- och AIFF-exporter inkluderar inte metadatataggar. Efter att en konvertering är klar, hovra över taggikonen bredvid formatchipet för att se exakt vilka taggar som bäddades in.",
        "tip": "Fyll i din Distribution-flik (ISRC, låttexter) och ladda upp omslag innan du exporterar. Ju mer metadata du tillhandahåller, desto mer kompletta blir dina exporterade filer för distribution."
      },
      {
        "heading": "Referens för stödda format",
        "body": "Förlustfria format bevarar källkvaliteten: WAV (PCM, källfrekvens/djup), AIFF (PCM, källfrekvens/djup), FLAC (källfrekvens), ALAC (källfrekvens). Förlustbehäftade format använder fasta förinställningar optimerade för distribution: MP3 (44.1 kHz, 320 kbps, stereo), AAC (44.1 kHz, 256 kbps, stereo), OGG Vorbis (44.1 kHz, quality 8, stereo). Icke-konverterbara format (endast tagg, ingen autokonvertering): DDP, ADM BWF (Atmos), MQA. Technical Settings (samplingsfrekvens och bitdjup) högst upp på fliken Specs är referensmetadata som beskriver källjudet; de styr inte konverteringsutdata. Textfältet Special Requirements under leveransformaten låter dig lägga till anteckningar om leveransinstruktioner.",
        "warning": "Konvertering från ett förlustbehäftat format (MP3, AAC, OGG) till ett förlustfritt format (WAV, FLAC) förbättrar inte ljudkvaliteten. De ursprungliga kompressionsartefakterna kvarstår. Ladda alltid upp din källfil med högsta kvalitet.",
        "mockup": "supported-formats"
      }
    ]
  },
  {
    "id": "audio-review-comments",
    "title": "Lämna tidsstämplade kommentarer",
    "category": "audio",
    "summary": "Lägg till tidskodad feedback direkt på vågformen så att medarbetare vet exakt var de ska lyssna.",
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
        "heading": "Lägga till en kommentar",
        "body": "Öppna ett spår och gå till fliken Audio. Dubbelklicka på vågformen vid exakt den punkt du vill referera till. Ett textfält visas i sektionen Feedback under vågformen där du kan skriva din kommentar. Kommentaren är kopplad till den tidskoden och versionen. I sektionen Feedback visar varje kommentar författarens namn, en färgad tidsstämpeletikett (t.ex. \"0:07\" eller \"1:22\"), det relativa datumet och meddelandetexten. Kommentarsmarkörer visas även som små ikoner direkt på vågformen vid sina positioner. Klicka på valfri tidsstämpel för att hoppa uppspelningshuvudet till det ögonblicket.",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "Portalkommentarer",
        "body": "Klienter som granskar via portalen kan också lämna tidsstämplade kommentarer på vågformen. Deras kommentarer visas i samma Feedback-sektion tillsammans med teamkommentarer men särskiljs visuellt med en \"Client\"-etikett så att du snabbt kan identifiera extern feedback. Detta håller all feedback, intern och extern, organiserad på ett ställe under den relevanta ljudversionen.",
        "mockup": "portal-comments"
      },
      {
        "heading": "Notes kontra Audio-kommentarer",
        "body": "Fliken Audio är för tidsstämplad feedback kopplad till specifika ögonblick i vågformen: \"höj vokalen vid 1:22\" eller \"virveltrumman är för hög här\". Fliken Notes är för allmän diskussion och revisionsanteckningar som inte är kopplade till en tidskod: \"mixens lågregister behöver förstärkas överlag\" eller \"klienten vill ha ett mer aggressivt sound\". Audio-kommentarer är versionsspecifika (kopplade till v1, v2 osv.), medan Notes gäller för spåret som helhet. Använd fliken Intent för att dokumentera den övergripande kreativa visionen, känslotaggar och referensspår.",
        "tip": "För en komplett bild av feedbacken på ett spår, kontrollera både fliken Audios Feedback-sektion (för tidsspecifika anteckningar) och fliken Notes (för allmän diskussion). Klientfeedback kan finnas på båda ställena.",
        "mockup": "resolve-feedback"
      }
    ]
  },
  {
    "id": "timeline-overview",
    "title": "Använda tidslinjvyn",
    "category": "timeline",
    "summary": "Växla till tidslinjvy på din instrumentpanel för att visualisera release-scheman och räkna ner till releasedatum.",
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
        "heading": "Växla till tidslinjvy",
        "body": "På [Instrumentpanelen](/app) letar du efter de två vyknapparna i sidhuvudet (under betalningsstatistiken). Klicka på tidslinjikonen (den andra knappen) för att växla från rutnätsvy till tidslinjvy. Tidslinjen visar dina releaser kronologiskt baserat på deras planerade releasedatum. Releaser utan måldatum visas i en separat sektion \"Unscheduled\" längst ner. Din vyinställning sparas automatiskt, så instrumentpanelen kommer att komma ihåg ditt val nästa gång du besöker den.",
        "mockup": "timeline-full"
      },
      {
        "heading": "Läsa tidslinjen",
        "body": "Varje release visas som ett kort placerat efter sitt planerade releasedatum. Tidslinjen visar en nedräkning: \"X days until release\" för kommande datum eller \"Released X days ago\" för passerade datum. Release-kort visar samma information som rutnätsvyn (titel, artist, status, format, antal spår) plus schemaläggningskontexten. Statuspunkter är färgkodade: orange för Utkast, blå för Pågående och grön för Klar. Fästa releaser visas högst upp på tidslinjen.",
        "mockup": "timeline-navigate"
      },
      {
        "heading": "Ställa in måldatum",
        "body": "För att lägga till en release på tidslinjen anger du ett planerat releasedatum antingen vid skapandet av releasen eller i Release-inställningar (kugghjulsikonen på release-sidan). Fältet Target Release Date använder en datumväljare. Tidslinjen uppdateras automatiskt när du justerar datum. Detta hjälper dig att visualisera ditt schema och undvika överlappande releasefönster över flera projekt.",
        "tip": "Använd tidslinjvyn under planering för att sprida ut dina releaser. Tydlig överblick över kommande deadlines hjälper till att förhindra flaskhalsar i ditt mix-, mastering- eller distributionsarbetsflöde.",
        "mockup": "timeline-dates"
      }
    ]
  },
  {
    "id": "export-data",
    "title": "Exportera dina kontodata",
    "category": "account",
    "summary": "Ladda ner en komplett ZIP-export av dina releaser, spår, ljudfiler och betalningshistorik.",
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
        "heading": "Vad som ingår",
        "body": "Dataexporten är en ZIP-fil som innehåller all din release-metadata, spårdetaljer, ljudfiler (alla versioner) och betalningshistorik. Innan nedladdning visar appen en uppskattning av exportstorleken tillsammans med antal: antal releaser, spår och ljudfiler som ingår. Detta ger dig en komplett säkerhetskopia av allt i ditt konto.",
        "mockup": "export-contents"
      },
      {
        "heading": "Starta en export",
        "body": "Gå till [Inställningar](/app/settings) och scrolla till sektionen \"Your Data\". Klicka \"Export My Data\" för att börja. Appen beräknar först en uppskattning som visar ungefärlig filstorlek och antal (t.ex. \"3 releases, 12 tracks, 8 audio files\"). Granska uppskattningen och klicka sedan \"Download\" för att starta exporten. En förloppsindikator visar nedladdningsstatusen. För stora konton med många ljudfiler kan exporten ta en stund. ZIP-filen laddas automatiskt ner till din webbläsare när den är klar. Du kan klicka \"Cancel\" för att gå tillbaka utan att ladda ner.",
        "mockup": "export-progress"
      },
      {
        "heading": "Datasekretess",
        "body": "Din export innehåller enbart data som du äger eller har skapat. Medarbetarbidrag (som kommentarer på dina releaser) ingår, men andra användares privata data ingår inte. Exporten genereras på begäran och lagras inte på våra servrar efter nedladdning.",
        "tip": "Kör en dataexport regelbundet som säkerhetskopia av dina projekt och ljudfiler. Detta är särskilt användbart innan du gör stora ändringar i ditt konto.",
        "mockup": "export-privacy"
      }
    ]
  },
  {
    "id": "manage-subscription",
    "title": "Hantera din Pro-prenumeration",
    "category": "billing",
    "summary": "Visa din plan, uppdatera betalningsuppgifter och hantera din Pro-prenumeration via Stripe.",
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
        "heading": "Visa din plan",
        "body": "Gå till [Inställningar](/app/settings) och scrolla till sektionen Subscription längst ner. Sektionen lyder \"Manage your Mix Architect plan.\" Du ser din aktuella plan: Pro-konton visar \"$14/month, Unlimited releases\" med en grön \"PRO\"-etikett och en knapp \"Manage Billing\". Gratiskonton visar istället en knapp \"Upgrade to Pro\".",
        "mockup": "plan-current"
      },
      {
        "heading": "Uppgradera till Pro",
        "body": "Från sidan [Inställningar](/app/settings) klickar du på \"Upgrade to Pro\" i sektionen Subscription. Du skickas till en säker Stripe-utcheckningssida. När betalningen är bekräftad uppgraderas ditt konto omedelbart och du får tillgång till alla Pro-funktioner, inklusive obegränsade releaser och ljudkonvertering. Pro-etiketten visas bredvid din planinformation.",
        "mockup": "upgrade-pro"
      },
      {
        "heading": "Hantera betalning",
        "body": "Klicka \"Manage Billing\" i sektionen Subscription i [Inställningar](/app/settings) för att öppna Stripe-faktureringsportalen. Därifrån kan du uppdatera din betalningsmetod, visa fakturor och ladda ner kvitton. All betalningshantering sköts säkert av Stripe.",
        "mockup": "manage-payment"
      }
    ]
  },
  {
    "id": "cancel-resubscribe",
    "title": "Avsluta och återprenumerera",
    "category": "billing",
    "summary": "Hur du avslutar din Pro-prenumeration och vad som händer med dina data.",
    "tags": [
      "cancel",
      "resubscribe",
      "downgrade",
      "billing"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Avsluta din prenumeration",
        "body": "Klicka \"Manage Billing\" i sektionen Subscription i [Inställningar](/app/settings) för att öppna Stripe-portalen och klicka sedan \"Cancel plan\". Din Pro-åtkomst fortsätter till slutet av din aktuella faktureringsperiod. Ett meddelande i [Inställningar](/app/settings) visar när din Pro-plan löper ut så att du vet exakt hur länge din åtkomst varar.",
        "mockup": "cancel-subscription"
      },
      {
        "heading": "Vad som händer med dina data",
        "body": "Alla dina releaser, spår, ljudfiler, kommentarer och betalningshistorik bevaras fullständigt. Du förlorar ingenting vid nedgradering. Däremot blir Pro-funktioner (som obegränsade releaser och ljudkonvertering) otillgängliga tills du återprenumererar. Dina befintliga releaser förblir åtkomliga.",
        "warning": "Gratiskonton är begränsade till en aktiv release. Om du har mer än en release när din Pro-plan löper ut bevaras dina befintliga releaser, men du kan inte skapa nya releaser förrän du återprenumererar eller minskar till en release.",
        "mockup": "data-after-cancel"
      },
      {
        "heading": "Återprenumerera",
        "body": "För att återaktivera Pro går du till sektionen Subscription i [Inställningar](/app/settings) och klickar \"Upgrade to Pro\" igen, eller använder \"Manage Billing\" för att återprenumerera via Stripe-portalen. Dina tidigare data, inställningar, mallar och teamkonfigurationer är alla intakta och omedelbart tillgängliga.",
        "mockup": "resubscribe"
      }
    ]
  }
];
