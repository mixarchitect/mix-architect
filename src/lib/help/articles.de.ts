import type { HelpArticle } from "./types";

export const articles: HelpArticle[] = [
  {
    "id": "getting-started-overview",
    "title": "Willkommen bei Mix Architect",
    "category": "getting-started",
    "summary": "Ein kurzer Rundgang durch die Plattform: Ihr Dashboard, Ihre Veröffentlichungen, Ihre Tracks und Ihre Kollaborationswerkzeuge.",
    "tags": [
      "overview",
      "intro",
      "dashboard",
      "getting started"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Ihr Dashboard",
        "body": "Nach der Anmeldung gelangen Sie zum [Dashboard](/app). Es zeigt alle Ihre Veröffentlichungen in einem responsiven Raster an, sortiert nach der neuesten Aktivität. Jede Veröffentlichungskarte zeigt das Cover, den Titel, den Künstlernamen, einen Statuspunkt (farbcodiert für Entwurf, In Bearbeitung oder Fertig), ein Veröffentlichungstyp-Badge (Single, EP oder Album), ein Format-Badge (Stereo, Dolby Atmos oder Stereo + Atmos) und eine Track-Zählung wie \"1 von 6 Tracks gebrieft\". Wenn die [Zahlungsverfolgung](/app/settings) aktiviert ist, sehen Sie oben auch Zahlungsstatistiken: Ausstehend, Verdient und Gesamthonorare über alle Veröffentlichungen, mit einem Link \"Alle anzeigen\" zur Seite [Zahlungen](/app/payments). Verwenden Sie das Pinnnadel-Symbol auf jeder Veröffentlichungskarte, um sie oben in Ihrem Dashboard anzuheften, und das Drei-Punkte-Menü für Schnellaktionen. Das Sortier-Dropdown ermöglicht es Ihnen, Veröffentlichungen nach Zuletzt bearbeitet, Titel oder Erstellungsdatum zu ordnen.",
        "mockup": "dashboard"
      },
      {
        "heading": "Rasteransicht vs. Zeitachsenansicht",
        "body": "Die Dashboard-Kopfzeile enthält zwei Ansichtsumschalter: Raster und Zeitachse. Die Rasteransicht (Standard) zeigt Ihre Veröffentlichungen als Karten in einem responsiven Raster. Die Zeitachsenansicht ordnet Veröffentlichungen chronologisch nach ihren geplanten Veröffentlichungsterminen an und zeigt Countdowns und Planungsinformationen. Ihre Ansichtseinstellung wird automatisch gespeichert. Erfahren Sie mehr unter [Die Zeitachsenansicht verwenden](/app/help?article=timeline-overview)."
      },
      {
        "heading": "In der App navigieren",
        "body": "Die Seitenleiste (Desktop) oder die untere Leiste (Mobilgerät) bietet Ihnen schnellen Zugriff auf alle Bereiche der App: [Dashboard](/app) für Ihre Veröffentlichungen, Suche (oder Cmd+K / Ctrl+K) um sofort zu einer Veröffentlichung oder einem Track zu springen, [Vorlagen](/app/templates) für wiederverwendbare Veröffentlichungs-Presets, [Zahlungen](/app/payments) für die Honorarverfolgung (falls aktiviert), [Einstellungen](/app/settings) für Ihr Profil, Standardwerte und Abonnement, und [Hilfe](/app/help) für die Dokumentation. Die Seitenleiste enthält außerdem Benachrichtigungen für Aktivitätsupdates, Auto für Automatisierungsfunktionen und Abmelden. Der Themenwechsel zwischen den Modi Hell, Dunkel und System ist in den [Einstellungen](/app/settings) unter Erscheinungsbild verfügbar.",
        "tip": "Drücken Sie Cmd+K (Mac) oder Ctrl+K (Windows) von überall in der App, um sofort nach einer Veröffentlichung oder einem Track zu suchen und dorthin zu springen.",
        "mockup": "nav-rail"
      },
      {
        "heading": "Grundlegende Konzepte",
        "body": "Veröffentlichungen sind Ihre übergeordneten Projekte (Alben, EPs oder Singles). Jede Veröffentlichung enthält einen oder mehrere Tracks. Auf dem Desktop hat die Detailseite einer Veröffentlichung ein Zwei-Spalten-Layout: die Trackliste links und eine Inspektor-Seitenleiste rechts, die das Cover, die Veröffentlichungsinfos (Künstler, Typ, Format, Status, Zieldatum, Genre), die Globale Mix-Richtung, Globale Referenzen und den Zahlungsstatus anzeigt. Jeder Track hat vier Tabs: Brief, Audio, Delivery und Notes. Klicken Sie auf das Zahnrad-Symbol in der Kopfzeile der Veröffentlichung, um die Veröffentlichungseinstellungen zu öffnen, wo Sie alle Metadaten bearbeiten, Ihr Team verwalten und die Zahlung konfigurieren können. Die Kopfzeile enthält außerdem Schaltflächen für den Portal-Umschalter (mit einem Link zum Öffnen des Portals), Als Vorlage speichern und das Einstellungs-Zahnrad.",
        "mockup": "key-concepts"
      }
    ]
  },
  {
    "id": "create-first-release",
    "title": "Ihre erste Veröffentlichung erstellen",
    "category": "getting-started",
    "summary": "Schritt-für-Schritt-Anleitung zum Erstellen einer Veröffentlichung, Hinzufügen eines Covers, Hochladen von Tracks und Festlegen Ihres Status.",
    "tags": [
      "create",
      "release",
      "new project",
      "setup"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Eine neue Veröffentlichung erstellen",
        "body": "Klicken Sie im [Dashboard](/app) auf die Schaltfläche \"+ Neue Veröffentlichung\" in der oberen rechten Ecke. Wenn Sie gespeicherte [Vorlagen](/app/templates) haben, wird zuerst ein Vorlagenauswahldialog angezeigt, in dem Sie eine Vorlage auswählen oder auf \"Von Grund auf starten\" klicken können. Das Erstellungsformular fragt nach einem Titel, einem optionalen Künstler-/Kundennamen, dem Veröffentlichungstyp (Single, EP oder Album), dem Format (Stereo, Dolby Atmos oder Stereo + Atmos), Genre-Tags (wählen Sie aus Vorschlägen wie Rock, Pop, Hip-Hop, Electronic usw. oder fügen Sie eigene hinzu) und einem geplanten Veröffentlichungsdatum.",
        "tip": "Wenn Sie eine Single erstellen, wird automatisch ein Track mit dem Veröffentlichungstitel und Ihren Standardspezifikationen aus den [Einstellungen](/app/settings) erstellt.",
        "mockup": "create-release"
      },
      {
        "heading": "Die Detailseite der Veröffentlichung",
        "body": "Nach der Erstellung gelangen Sie auf die Detailseite der Veröffentlichung. Auf dem Desktop hat diese ein Zwei-Spalten-Layout: die Trackliste links mit einer \"Flow\"-Schaltfläche und einer \"+ Track hinzufügen\"-Schaltfläche, und eine Inspektor-Seitenleiste rechts. Die Inspektor-Seitenleiste zeigt das Cover, die Veröffentlichungsinfos (Künstler, Typ, Format, Status, Zieldatum, Genre), die Globale Mix-Richtung (klicken Sie auf das Stift-Symbol zum Aktualisieren) und Globale Referenzen (klicken Sie auf \"+ Hinzufügen\" zum Suchen und Hinzufügen von Referenztracks). Wenn die Zahlungsverfolgung aktiviert ist, erscheint der Zahlungsbereich am unteren Ende der Seitenleiste. Um das Cover hinzuzufügen oder zu ändern, klicken Sie auf das Stift-Symbol auf dem Artwork in der Seitenleiste. Darunter erscheinen Optionen: eine Hochladen-Schaltfläche zum Auswählen einer Datei, eine Entfernen-Schaltfläche (falls bereits ein Cover vorhanden ist) und ein Feld \"Oder URL einfügen\" zum direkten Verlinken eines Bildes. Neue Veröffentlichungen zeigen einen gestrichelten Upload-Bereich mit \"Klicken zum Hochladen\" (JPEG oder PNG, min. 1400x1400). Um andere Metadaten der Veröffentlichung zu bearbeiten, klicken Sie auf das Zahnrad-Symbol in der Kopfzeile, um die Veröffentlichungseinstellungen zu öffnen.",
        "mockup": "cover-art-upload"
      },
      {
        "heading": "Tracks hinzufügen",
        "body": "Klicken Sie in der Detailansicht der Veröffentlichung auf \"+ Track hinzufügen\" in der Kopfzeile neben der Flow-Schaltfläche. Geben Sie Ihrem Track einen Titel, und er wird mit Ihren Standardspezifikationen aus den [Einstellungen](/app/settings) erstellt. Jeder Track erscheint in der Liste mit einer Nummer, einem Titel, einer Intentionsvorschau, einem Statuspunkt und einem Genehmigungs-Badge. Sie können Tracks per Drag-and-Drop mit dem Griffsymbol auf der linken Seite neu anordnen oder die Schaltflächen zum Hoch-/Runterschieben verwenden. Löschen Sie Tracks mit dem Papierkorb-Symbol auf der rechten Seite. Klicken Sie auf einen Track, um ihn zu öffnen und in seinen vier Tabs zu arbeiten.",
        "mockup": "track-upload"
      },
      {
        "heading": "Veröffentlichungsstatus festlegen",
        "body": "Jede Veröffentlichung hat einen Status: Entwurf, In Bearbeitung oder Fertig. Sie können den Status in der Inspektor-Seitenleiste ändern, indem Sie auf das Status-Badge neben \"Status\" im Bereich Veröffentlichungsinfos klicken, oder über die Veröffentlichungseinstellungen (Zahnrad-Symbol). Eine Veröffentlichung wechselt automatisch zu In Bearbeitung, sobald die Arbeit daran begonnen hat (z. B. durch Hochladen von Audio oder Hinzufügen von Tracks). Die Farbe des Status-Badges erscheint auf Ihren Veröffentlichungskarten im [Dashboard](/app) (Orange für Entwurf, Blau für In Bearbeitung, Grün für Fertig) und ist für alle Mitarbeiter und im Kundenportal sichtbar.",
        "mockup": "release-status"
      }
    ]
  },
  {
    "id": "invite-collaborators",
    "title": "Mitarbeiter zu einer Veröffentlichung einladen",
    "category": "getting-started",
    "summary": "Teilen Sie Ihre Veröffentlichung mit Teammitgliedern und externen Kunden mithilfe von Rollen und dem Portal.",
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
        "heading": "Einladungen versenden",
        "body": "Öffnen Sie eine Veröffentlichung und klicken Sie auf das Zahnrad-Symbol in der Kopfzeile, um zu den Veröffentlichungseinstellungen zu gelangen. Scrollen Sie über die Veröffentlichungsmetadaten hinaus zum Teambereich am unteren Ende. Geben Sie die E-Mail-Adresse der Person ein, die Sie einladen möchten, wählen Sie deren Rolle aus dem Dropdown (Mitarbeiter oder Kunde) und klicken Sie auf \"Einladen\". Die Person erhält eine E-Mail mit einem Link, um der Veröffentlichung beizutreten. Aktive Teammitglieder erscheinen unter dem Einladungsformular mit ihrer E-Mail, ihrem Rollen-Badge, ihrem Status und einer Löschen-Schaltfläche zum Entfernen.",
        "mockup": "invite-collaborator"
      },
      {
        "heading": "Mitarbeiter- vs. Kundenrollen",
        "body": "Es gibt zwei Rollen. Mitarbeiter haben vollen Zugriff zum Anzeigen und Bearbeiten aller Veröffentlichungsinhalte: Tracks, Intention, Spezifikationen, Audio, Notizen, Distributionsmetadaten und Veröffentlichungseinstellungen. Kunden haben über das Kundenportal nur Lesezugriff und können Feedback über Kommentare geben, einzelne Tracks genehmigen oder Änderungen anfordern und Audiodateien herunterladen, falls erlaubt. Das Rollen-Badge wird neben der E-Mail jedes Teammitglieds im Teambereich angezeigt.",
        "mockup": "collaborator-roles"
      },
      {
        "heading": "Einladungen annehmen",
        "body": "Wenn jemand auf den Einladungslink klickt und der Veröffentlichung beitritt, erscheint die Person in der Teamliste mit ihrem Rollen-Badge und dem Status \"Aktiv\". Sie erhalten eine In-App-Benachrichtigung, die Sie darüber informiert, dass die Person beigetreten ist. Eingeladene, die kein Mix Architect-Konto haben, werden aufgefordert, eines zu erstellen, wenn sie auf den Einladungslink klicken.",
        "tip": "Sie können ein Teammitglied jederzeit entfernen, indem Sie auf das Papierkorb-Symbol neben dem Namen im Teambereich der Veröffentlichungseinstellungen klicken.",
        "mockup": "accept-invitation"
      },
      {
        "heading": "Kundenportal teilen",
        "body": "Für externe Beteiligte, die eine Überprüfung ohne Anmeldung durchführen müssen, aktivieren Sie das Kundenportal über die Kopfzeile der Veröffentlichungsdetailseite. Klicken Sie auf den Portal-Umschalter, um ihn zu aktivieren (er wird grün, wenn er aktiv ist), und verwenden Sie dann das Link-Symbol neben dem Umschalter, um die eindeutige Freigabe-URL zu kopieren. Das Portal bietet schreibgeschützten Zugriff auf das Release-Briefing, die Trackliste, die Audiowiedergabe und Kommentare. Sie können über die Portaleinstellungen genau konfigurieren, was sichtbar ist: Mix-Richtung, Spezifikationen, Referenzen, Zahlungsstatus, Distributionsinfos und Songtexte. Für die Steuerung pro Track verwenden Sie den Delivery-Tab bei jedem Track.",
        "mockup": "portal-sharing"
      }
    ]
  },
  {
    "id": "track-tabs",
    "title": "Track-Details: Die Tabs verstehen",
    "category": "releases",
    "summary": "Jeder Track hat vier Tabs zur Verwaltung aller Aspekte Ihres Mixes: Brief, Audio, Delivery und Notes.",
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
        "heading": "Brief",
        "body": "Der Intention-Tab ist der Ort, an dem Sie die kreative Vision für einen Track beschreiben. Oben befindet sich ein Freitextfeld unter \"Wie soll dieser Track klingen?\", in dem Sie die Mix-Richtung beschreiben können (klicken Sie auf \"Bearbeiten\" zum Ändern). Darunter können Sie im Bereich Emotionale Qualitäten den Track mit beschreibenden Wörtern taggen: Ausgewählte Tags erscheinen als ausgefüllte Badges (z. B. spacious, warm, punchy, nostalgic), und verfügbare Vorschläge erscheinen als Umriss-Badges, die Sie anklicken können (aggressive, intimate, gritty, polished, dark, bright, raw, lush, dreamy, lo-fi, cinematic, minimal, dense, ethereal, hypnotic, euphoric, melancholic, organic, synthetic, chaotic, smooth, haunting, playful, anthemic, delicate, heavy, airy). Der Bereich Anti-Referenzen unten ermöglicht es Ihnen, Klänge oder Ansätze zu beschreiben, die Sie vermeiden möchten. In der rechten Seitenleiste zeigt die Schnellansicht den Track-Status, die Audioqualität (Abtastrate / Bittiefe) und das Format auf einen Blick. Darunter können Sie im Bereich Referenzen Referenztracks suchen und hinzufügen (von Apple Music) mit optionalen Notizen, die beschreiben, was daran als Referenz dienen soll.",
        "mockup": "track-tab-intent"
      },
      {
        "heading": "Spezifikationen",
        "body": "Der Brief-Tab enthält die technischen Vorgaben für Ihren Track. Der Bereich Technische Einstellungen hat drei Dropdowns: Format (Stereo, Dolby Atmos oder Stereo + Atmos), Abtastrate (44.1kHz, 48kHz, 88.2kHz, 96kHz) und Bittiefe (16-bit, 24-bit, 32-bit float). Diese Werte sind Referenz-Metadaten, die das Quell-Audio beschreiben, und werden als Standardwerte für neue Tracks aus Vorlagen verwendet; sie steuern nicht die Konvertierungsausgabe. Darunter verwaltet der Bereich Auslieferung Ihre Ausgabeformate. Wählen Sie die verfügbaren Formate aus, indem Sie auf die Format-Chips klicken: Konvertierbare Formate sind WAV, AIFF, FLAC, MP3, AAC, OGG und ALAC. Nicht-konvertierbare Formate (DDP, ADM BWF/Atmos, MQA) können als Referenz ausgewählt werden, zeigen aber einen Info-Tooltip, der erklärt, dass sie nicht automatisch konvertiert werden können. Ausgewählte Formate erscheinen grün hervorgehoben mit einem Häkchen. Verwenden Sie das \"Exportieren von\"-Dropdown, um auszuwählen, von welcher Audioversion konvertiert werden soll (z. B. \"v3 - Typical Wonderful 2025-10-10 MGO.wav (aktuellste)\"). Klicken Sie auf das Download-Pfeil-Symbol neben einem ausgewählten konvertierbaren Format, um eine Konvertierung zu starten. Sie können auch einen benutzerdefinierten Formatnamen im Feld \"Benutzerdefiniertes Format...\" eingeben und auf \"+ Hinzufügen\" klicken. Am unteren Ende können Sie im Textfeld Besondere Anforderungen Anweisungen für die Auslieferung notieren.",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Audio",
        "body": "Der Audio-Tab ist der Ort zum Hochladen von Dateien, Verwalten von Versionen und Abspielen von Audio. Die Kopfzeile zeigt den Veröffentlichungs- und Tracknamen mit dem Album-Cover. Der Versionsauswähler (v1, v2, v3 usw.) ermöglicht das Wechseln zwischen Revisionen; klicken Sie auf die +-Schaltfläche, um eine neue Version hochzuladen. Jede Version zeigt ihre Versionsnummer, das Uploaddatum, die Kommentaranzahl und eine Download-Schaltfläche. Die Wellenformvisualisierung zeigt das Audio mit interaktiver Wiedergabe: Klicken Sie irgendwo, um zu dieser Position zu springen, und verwenden Sie die Transportsteuerung darunter (Schleife, Zurückspringen, Play/Pause, Vorwärtsspringen, Wiederholen). Die LUFS-Lautheitsmessung wird neben den Dateimetadaten (Format, Abtastrate, Bittiefe) angezeigt, farbcodiert anhand von Lautheitszielwerten. Der Feedback-Bereich unterhalb der Wellenform zeigt alle zeitgestempelten Kommentare für die aktuelle Version. Doppelklicken Sie irgendwo auf die Wellenform, um einen neuen Kommentar an diesem Timecode hinzuzufügen. Kommentarmarkierungen erscheinen als kleine Symbole auf der Wellenform an ihren jeweiligen Positionen.",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "Lautheitsanalyse (LUFS)",
        "body": "Wenn Sie Audio hochladen, misst Mix Architect automatisch die integrierte Lautheit in LUFS (Loudness Units Full Scale). Klicken Sie auf den LUFS-Wert neben den Versionsmetadaten, um das Lautheitsanalyse-Panel zu erweitern. Dieses zeigt, wie jeder große Streaming-Dienst, Broadcast-Standard und jede soziale Plattform Ihren Track während der Wiedergabe anpassen wird. Jede Zeile zeigt den Plattformnamen, deren Ziellautheit (z. B. Spotify zielt auf -14 LUFS) und die Verstärkungsänderung, die auf Ihre Datei angewendet würde. Ein positiver Wert bedeutet, dass der Dienst Ihren Track lauter macht; ein negativer Wert (in Orange dargestellt) bedeutet, dass er leiser gemacht wird. Wenn Ihr Mix beispielsweise -14,9 LUFS misst, würde Spotify +0,9 dB anwenden, während Apple Music (Zielwert -16) -1,1 dB anwenden würde. Das Panel ist gruppiert in Streaming (Spotify, Apple Music, YouTube, Tidal, Amazon Music, Deezer, Qobuz, Pandora), Broadcast (EBU R128, ATSC A/85, ITU-R BS.1770) und Social (Instagram/Reels, TikTok, Facebook). Verwenden Sie dies, um vor der Auslieferung zu prüfen, ob Ihr Master auf einer Plattform wesentlich verändert wird.",
        "mockup": "track-tab-lufs"
      },
      {
        "heading": "Distribution",
        "body": "Der Delivery-Tab erfasst alle Metadaten, die für die digitale Distribution benötigt werden. Er enthält drei Split-Bereiche, jeweils mit \"+ Person hinzufügen\"-Schaltflächen: Autoren-Split (Personenname, Prozentsatz, PRO-Zugehörigkeit wie ASCAP/BMI, Mitgliedskontonummer und Autoren-IPI-Nummer), Verlags-Split (Verlagsname, Prozentsatz, Verlags-Mitglieds-ID und Verlags-IPI) und Masteraufnahme-Split (Name der Entität und Prozentsatz). Die laufende Gesamtsumme für jeden Split-Bereich wird grün angezeigt, wenn sie 100 % ergibt, oder orange, wenn nicht. Unterhalb der Splits: Codes und Identifikatoren (ISRC- und ISWC-Felder), Credits (Produzenten- und Komponisten-/Songwriter-Namen), Track-Eigenschaften (Featured Artist, Sprachauswahl, Umschalter für explizite Texte, Instrumental und Coversong), Copyright (Registrierungsnummer und Copyright-Datum) und Songtexte (Volltextfeld für Songtexte).",
        "mockup": "track-tab-distribution"
      },
      {
        "heading": "Portal",
        "body": "Der Delivery-Tab steuert, wie Kunden mit diesem speziellen Track interagieren. Oben zeigt der Bereich Kundengenehmigung den aktuellen Genehmigungsstatus (z. B. \"Genehmigt\" in Grün) zusammen mit einem zeitgestempelten Verlauf aller Genehmigungsereignisse: genehmigt, Änderungen angefordert (mit der Kundennotiz), zur Überprüfung erneut geöffnet und erneut genehmigt, jeweils mit Datum. Darunter können Sie unter Track-Portal-Sichtbarkeit umschalten, ob dieser Track im Portal sichtbar ist, ob Downloads aktiviert sind und welche spezifischen Audioversionen (Version 1, Version 2, Version 3 usw.) der Kunde abrufen kann, jeweils mit eigenem Umschalter. Ein Hinweis am unteren Ende erinnert Sie daran, dass die Portalaktivierung und der Freigabelink in der Kopfzeile der Veröffentlichungsseite zu finden sind.",
        "mockup": "track-tab-portal"
      },
      {
        "heading": "Notizen",
        "body": "Der Notizen-Tab ist ein universeller Bereich für Revisionsnotizen und Diskussionen, die nicht an einen bestimmten Timecode gebunden sind. Oben befindet sich ein Textfeld mit dem Platzhalter \"Notiz hinzufügen...\" und eine \"Veröffentlichen\"-Schaltfläche. Notizen erscheinen darunter in umgekehrt chronologischer Reihenfolge. Jede Notiz zeigt den Autorennamen, ein Datum oder eine relative Zeitangabe und den Nachrichtentext. Kundennotizen sind visuell durch ein grünes \"Kunde\"-Badge hervorgehoben, damit Sie internes Feedback von externem Feedback auf einen Blick unterscheiden können. Verwenden Sie diesen Tab für allgemeine Revisionsanweisungen, Aufgaben und Diskussionen, die sich nicht auf einen bestimmten Moment im Audio beziehen müssen. Für zeitspezifisches Feedback verwenden Sie stattdessen die Wellenform-Kommentare im Audio-Tab.",
        "mockup": "track-tab-notes"
      }
    ]
  },
  {
    "id": "client-portal",
    "title": "Kundenportal und Genehmigungen",
    "category": "releases",
    "summary": "Teilen Sie Ihre Veröffentlichung über einen eindeutigen Link mit Kunden, kontrollieren Sie, was sie sehen, und verfolgen Sie Genehmigungen pro Track.",
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
        "heading": "Das Portal aktivieren",
        "body": "Suchen Sie auf der Detailseite der Veröffentlichung den Portal-Umschalter im Kopfbereich (oben rechts). Klicken Sie auf den Umschalter, um ihn zu aktivieren (er wird grün, wenn er aktiv ist). Nach der Aktivierung klicken Sie auf das Link-Symbol neben dem Umschalter, um die eindeutige Freigabe-URL zu kopieren. Senden Sie diesen Link an Ihren Kunden für den Überprüfungszugriff ohne Mix Architect-Konto. Das Portal bietet schreibgeschützten Zugriff auf das Release-Briefing, die Trackliste, Audioplayer und ein Kommentarsystem. Verwenden Sie die Portaleinstellungen, um zu steuern, welche Bereiche auf Veröffentlichungsebene für Kunden sichtbar sind: Mix-Richtung, Spezifikationen, Referenzen, Zahlungsstatus, Distributionsmetadaten und Songtexte.",
        "mockup": "portal-settings"
      },
      {
        "heading": "Sichtbarkeit pro Track",
        "body": "Gehen Sie für jeden Track zum Delivery-Tab, um zu steuern, was Ihr Kunde sehen kann. Der Bereich Track-Portal-Sichtbarkeit hat Umschalter für: \"Im Portal sichtbar\" (den gesamten Track ein- oder ausblenden), \"Download aktivieren\" (Audio-Downloads erlauben oder blockieren) und individuelle Versionsumschalter (Version 1, Version 2, Version 3 usw.), um zu steuern, auf welche Audiorevisionen der Kunde zugreifen kann. Dies gibt Ihnen feinkörnige Kontrolle, sodass Sie laufende Arbeiten verbergen und nur fertige Mixe teilen können. Alle Umschalter sind unabhängig, sodass Sie einen Track sichtbar machen, aber Downloads deaktivieren können, oder nur die neueste Version anzeigen.",
        "mockup": "portal-track-visibility"
      },
      {
        "heading": "Track-Genehmigungen",
        "body": "Kunden können einzelne Tracks über das Portal genehmigen oder Änderungen anfordern. Der Genehmigungsstatus wird im Bereich Kundengenehmigung des Delivery-Tabs jedes Tracks verfolgt. Der Status zeigt ein farbiges Badge (z. B. grün \"Genehmigt\") mit einem vollständigen zeitgestempelten Verlauf jedes Genehmigungsereignisses: wann der Kunde genehmigt hat, wann er Änderungen angefordert hat (einschließlich seiner Notiz, z. B. \"Gesang zu leise\"), wann der Track zur erneuten Überprüfung geöffnet wurde und wann er erneut genehmigt wurde. Dies gibt Ihnen einen klaren Audit-Trail aller Kundenentscheidungen. Genehmigungs-Badges erscheinen auch in der Trackliste auf der Detailseite der Veröffentlichung, sodass Sie auf einen Blick sehen können, welche Tracks genehmigt sind.",
        "mockup": "portal-approval"
      }
    ]
  },
  {
    "id": "templates",
    "title": "Veröffentlichungsvorlagen verwenden",
    "category": "releases",
    "summary": "Sparen Sie Zeit, indem Sie Veröffentlichungen aus wiederverwendbaren Vorlagen mit vorkonfigurierten Spezifikationen und Einstellungen erstellen.",
    "tags": [
      "templates",
      "reuse",
      "workflow",
      "presets"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Was Vorlagen enthalten",
        "body": "Eine Vorlage erfasst einen umfassenden Satz von Veröffentlichungsstandards über sechs einklappbare Bereiche. Grundlagen: Vorlagenname, Beschreibung, ein Kontrollkästchen \"Als Standardvorlage festlegen\" (automatisch ausgewählt für neue Veröffentlichungen) sowie Künstler-/Kundenname und E-Mail. Veröffentlichungseinstellungen: Veröffentlichungstyp (Single, EP oder Album), Format (Stereo, Dolby Atmos oder Stereo + Atmos) und Genre-Tags. Technische Spezifikationen: Abtastrate, Bittiefe, Auslieferungsformat-Auswahl (WAV, AIFF, FLAC, MP3, AAC, OGG, DDP, ADM BWF/Atmos, MQA, ALAC) und besondere Anforderungen. Intentions-Standardwerte: vorausgewählte emotionale Qualitäts-Tags für neue Tracks. Distributionsmetadaten: Distributor, Plattenlabel, Copyright-Inhaber, Sprache, Hauptgenre sowie Rechte- und Verlagskontakte. Zahlungs-Standardwerte: Zahlungsstatus, Währung und Zahlungshinweise. Wenn Sie eine Veröffentlichung aus einer Vorlage erstellen, werden alle diese Standardwerte automatisch angewendet.",
        "mockup": "template-contents"
      },
      {
        "heading": "Vorlagen erstellen und verwalten",
        "body": "Es gibt zwei Möglichkeiten, eine Vorlage zu erstellen. Klicken Sie auf einer beliebigen Detailseite einer Veröffentlichung auf die Schaltfläche \"Als Vorlage speichern\" in der Kopfzeile (neben dem Einstellungs-Zahnrad), um die aktuelle Konfiguration dieser Veröffentlichung zu übernehmen. Oder gehen Sie zur Seite [Vorlagen](/app/templates) und klicken Sie auf \"+ Neue Vorlage\", um eine von Grund auf mit dem vollständigen Vorlagenformular zu erstellen. Jede Vorlagenkarte auf der Seite [Vorlagen](/app/templates) zeigt ihren Namen, ihre Beschreibung und eine Zusammenfassungszeile wie \"Single, Stereo + Atmos, 96 kHz / 24-bit, 4 Auslieferungsformate\". Verwenden Sie das Drei-Punkte-Menü auf jeder Vorlagenkarte für Optionen wie Bearbeiten oder Löschen. Geben Sie Vorlagen beschreibende Namen wie \"Stereo Master\" oder \"Atmos EP\", um sie übersichtlich zu halten.",
        "mockup": "template-create"
      },
      {
        "heading": "Eine Veröffentlichung aus einer Vorlage erstellen",
        "body": "Wenn Sie eine neue Veröffentlichung vom [Dashboard](/app) erstellen und gespeicherte Vorlagen haben, wird als erster Schritt ein Vorlagenauswahldialog \"Veröffentlichungseinstellungen vorausfüllen oder von Grund auf starten\" angezeigt. Wählen Sie eine Vorlagenkarte aus und klicken Sie auf \"Vorlage verwenden\", um das Formular für die neue Veröffentlichung mit diesen Einstellungen vorzufüllen, oder klicken Sie auf \"Von Grund auf starten\", um den Schritt zu überspringen. Das Erstellungsformular für Veröffentlichungen hat auch einen Link \"Vorlage wechseln\" am unteren Ende, falls Sie wechseln möchten. Alle Vorlageneinstellungen können nach der Erstellung der Veröffentlichung angepasst werden.",
        "tip": "Markieren Sie Ihre meistgenutzte Vorlage als Standard (Kontrollkästchen \"Als Standardvorlage festlegen\"), damit sie bei jeder neuen Veröffentlichung automatisch ausgewählt wird.",
        "mockup": "template-use"
      }
    ]
  },
  {
    "id": "payment-tracking",
    "title": "Zahlungsverfolgung",
    "category": "releases",
    "summary": "Verfolgen Sie Honorare, Zahlungen und ausstehende Beträge über Ihre Veröffentlichungen hinweg.",
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
        "heading": "Zahlungsverfolgung aktivieren",
        "body": "Gehen Sie zu [Einstellungen](/app/settings) und suchen Sie den Bereich Zahlungsverfolgung. Der Bereich lautet: \"Verfolgen Sie Honorare und Zahlungsstatus bei Veröffentlichungen und Tracks. Deaktivieren Sie dies, wenn Sie Ihre eigenen Projekte mixen.\" Schalten Sie \"Zahlungsverfolgung aktivieren\" ein. Nach der Aktivierung erscheinen zahlungsbezogene Funktionen in der gesamten App: Honorarstatistiken im [Dashboard](/app) (Ausstehend, Verdient, Gesamthonorare), ein Zahlungsbereich in der Inspektor-Seitenleiste jeder Veröffentlichung und die Seite [Zahlungen](/app/payments) in der Seitenleisten-Navigation.",
        "mockup": "payment-dashboard"
      },
      {
        "heading": "Veröffentlichungshonorare festlegen",
        "body": "Öffnen Sie die Veröffentlichungseinstellungen (klicken Sie auf das Zahnrad-Symbol bei einer Veröffentlichung). Scrollen Sie nach unten zum Zahlungsbereich. Legen Sie den Zahlungsstatus fest: Kein Honorar, Unbezahlt, Teilweise oder Bezahlt. Verwenden Sie das Textfeld Zahlungshinweise, um Konditionen, Anzahlungsinformationen oder Fälligkeitsdaten festzuhalten. Der Honorarbetrag und die Zahlungsinformationen sind auch in der Inspektor-Seitenleiste auf der Detailseite der Veröffentlichung unter der Überschrift Zahlung sichtbar, wo Sie auf den Status klicken können, um ihn schnell zu ändern.",
        "mockup": "payment-release-fees"
      },
      {
        "heading": "Zahlungs-Dashboard",
        "body": "Rufen Sie die Seite [Zahlungen](/app/payments) über die Seitenleiste auf. Oben zeigen drei Zusammenfassungskarten Ausstehend (Gesamtbetrag unbezahlt), Verdient (Gesamtbetrag bezahlt) und Gesamthonorare über alle Veröffentlichungen, jeweils mit einer Veröffentlichungsanzahl. Darunter listet eine Tabelle jede Veröffentlichung mit Zahlungsdaten auf: Veröffentlichungsname, Datum, Künstler, Honorar, Bezahlt, Saldo und Status (mit farbigen Badges wie \"Teilweise\" in Orange). Eine Gesamtzeile am unteren Ende summiert alle Honorare. Verwenden Sie die Schaltfläche \"CSV exportieren\", um Zahlungsdaten als Tabellenkalkulation herunterzuladen, oder \"PDF herunterladen\", um eine druckfertige Zahlungsübersicht zu erstellen.",
        "tip": "Klicken Sie auf die Statistikkarten Ausstehend oder Verdient im [Dashboard](/app), um schnell nach Veröffentlichungen mit diesem Zahlungsstatus zu filtern.",
        "mockup": "payment-track-fees"
      }
    ]
  },
  {
    "id": "distribution-tracker",
    "title": "Distributions-Tracker",
    "category": "releases",
    "summary": "Verfolgen Sie, wo Ihre Veröffentlichung eingereicht wurde, überwachen Sie den Status auf verschiedenen Plattformen und erhalten Sie eine Benachrichtigung, wenn sie auf Spotify live geht.",
    "tags": [
      "distribution",
      "tracker",
      "spotify",
      "apple music",
      "platform",
      "status",
      "live",
      "submitted"
    ],
    "updatedAt": "2026-03-14",
    "content": [
      {
        "heading": "Plattformen zu einer Veröffentlichung hinzufügen",
        "body": "Öffnen Sie eine beliebige Veröffentlichung und scrollen Sie nach unten zum Distributions-Tracker-Panel unterhalb der Trackliste. Klicken Sie auf \"+ Plattform hinzufügen\", um eine Streaming-Plattform hinzuzufügen. Wählen Sie aus Spotify, Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud oder Bandcamp. Jede Plattform erscheint als Zeile mit ihrem offiziellen Logo, einem Statusindikator und einem Distributor-Tag. Sie können auch \"Als eingereicht markieren\" verwenden, um mehrere Plattformen gleichzeitig hinzuzufügen: Wählen Sie einen Distributor (DistroKid, TuneCore, CD Baby, LANDR, Ditto, AWAL, UnitedMasters, Amuse, RouteNote oder Selbstveröffentlicht), markieren Sie die Plattformen, bei denen Sie eingereicht haben, und klicken Sie auf Einreichen.",
        "mockup": "distribution-add-platform"
      },
      {
        "heading": "Statuswerte",
        "body": "Jeder Plattformeintrag hat einen Status, der verfolgt, wo er sich in der Veröffentlichungs-Pipeline befindet. Die sechs Statuswerte sind: Nicht eingereicht (grau, Standard für neu hinzugefügte Plattformen), Eingereicht (blau, Sie haben die Veröffentlichung an Ihren Distributor gesendet), In Bearbeitung (orange, der Distributor prüft oder verarbeitet), Live (grün, die Veröffentlichung ist auf der Plattform verfügbar), Abgelehnt (rot, die Plattform oder der Distributor hat die Veröffentlichung abgelehnt) und Entfernt (rot, die Veröffentlichung war zuvor live, wurde aber entfernt). Klicken Sie auf den Statusindikator in einer Plattformzeile, um ihn zu ändern. Statusänderungen werden im Plattformverlauf protokolliert, sodass Sie sehen können, wann jeder Übergang stattgefunden hat.",
        "mockup": "distribution-status"
      },
      {
        "heading": "Automatische Spotify-Erkennung",
        "body": "Spotify wird oben im Distributions-Tracker mit dem Label \"Aktualisiert automatisch\" angezeigt. Sobald Sie Spotify als Eingereicht markieren, überprüft Mix Architect regelmäßig den Spotify-Katalog auf Ihre Veröffentlichung anhand des ISRC-Codes (aus dem Delivery-Tab des Tracks) oder des Veröffentlichungstitels und Künstlernamens. Wenn Ihre Veröffentlichung auf Spotify gefunden wird, ändert sich der Status automatisch auf Live, die Spotify-URL wird gespeichert und Sie erhalten eine Benachrichtigung. Sie können auch auf \"Jetzt prüfen\" klicken, um eine sofortige Überprüfung auszulösen. Die automatische Erkennung läuft täglich für alle eingereichten Spotify-Einträge.",
        "tip": "Tragen Sie den ISRC-Code im Delivery-Tab Ihres Tracks ein, bevor Sie einreichen. Die ISRC-basierte Erkennung ist zuverlässiger als der Abgleich nach Titel/Künstler, insbesondere bei häufig vorkommenden Namen.",
        "mockup": "distribution-spotify"
      },
      {
        "heading": "Status aktualisieren und Links hinzufügen",
        "body": "Um den Status einer Plattform zu ändern, klicken Sie auf den Statusindikator in der Plattformzeile. Eine Reihe von Status-Badges erscheint, in der Sie den neuen Status auswählen können. Um einen Link zur Veröffentlichung auf dieser Plattform hinzuzufügen, klicken Sie auf \"Link hinzufügen\" neben dem Plattformnamen. Geben Sie die URL ein (zum Beispiel den Spotify-Album-Link oder die Apple Music-Seite) und klicken Sie auf Speichern. Das Link-Symbol wird zu einem anklickbaren externen Link, der die Veröffentlichungsseite auf dieser Plattform öffnet. Verwenden Sie das Drei-Punkte-Menü in jeder Plattformzeile für weitere Optionen: Details bearbeiten, Plattform entfernen oder den Statusänderungsverlauf anzeigen.",
        "mockup": "distribution-edit"
      },
      {
        "heading": "Sammeleinreichung und Aktualisierung",
        "body": "\"Als eingereicht markieren\" ermöglicht es Ihnen, eine Sammeleinreichung bei Ihrem Distributor zu erfassen. Wählen Sie den Distributor aus dem Dropdown-Menü, markieren Sie die Plattformen, bei denen Sie eingereicht haben, und klicken Sie auf Einreichen. Alle ausgewählten Plattformen werden mit dem Status Eingereicht und dem Distributor-Tag hinzugefügt. \"Jetzt prüfen\" erscheint bei Spotify-Einträgen, die eingereicht wurden. Ein Klick darauf löst eine sofortige Spotify-Katalogsuche aus. Wenn die Veröffentlichung gefunden wird, aktualisiert sich der Status auf Live und die URL wird automatisch gespeichert. Für alle anderen Plattformen (Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud, Bandcamp) aktualisieren Sie den Status manuell, sobald Sie bestätigen, dass die Veröffentlichung live ist.",
        "mockup": "distribution-bulk"
      },
      {
        "heading": "Distributor-Tags",
        "body": "Jeder Plattformeintrag kann ein Distributor-Tag haben, das anzeigt, welchen Dienst Sie für die Einreichung verwendet haben (DistroKid, TuneCore, CD Baby usw.). Dieses erscheint als kleines Badge neben dem Statusindikator. Distributor-Tags werden automatisch gesetzt, wenn Sie \"Als eingereicht markieren\" verwenden, oder Sie können sie einzeln beim Bearbeiten eines Plattformeintrags festlegen. So behalten Sie den Überblick, welcher Distributor welche Plattform betreut hat, insbesondere wenn Sie verschiedene Distributoren für verschiedene Gebiete oder Plattformen nutzen.",
        "warning": "Die Analysen spiegeln nur Daten wider, die Sie in Mix Architect erfasst haben. Wenn Sie über das Dashboard eines Distributors einreichen, denken Sie daran, den Status hier zu aktualisieren, damit Ihr Tracker korrekt bleibt.",
        "mockup": "distribution-distributor"
      }
    ]
  },
  {
    "id": "user-analytics",
    "title": "Benutzeranalysen",
    "category": "releases",
    "summary": "Sehen Sie Ihre abgeschlossenen Veröffentlichungen, durchschnittliche Bearbeitungszeit, Gesamtumsatz und eine Aufschlüsselung pro Kunde im Analytics-Dashboard.",
    "tags": [
      "analytics",
      "dashboard",
      "revenue",
      "turnaround",
      "velocity",
      "clients",
      "charts"
    ],
    "updatedAt": "2026-03-14",
    "content": [
      {
        "heading": "Was die Analytics-Seite zeigt",
        "body": "Rufen Sie die Seite [Analysen](/app/analytics) über die Seitenleiste auf. Das Dashboard zeigt oben vier Zusammenfassungskarten: Abgeschlossene Veröffentlichungen (Gesamtanzahl fertiger Projekte mit monatlichem Durchschnitt), Durchschnittliche Bearbeitungszeit (Tage von der Erstellung bis zum Abschluss, mit Aufschlüsselung nach schnellstem und langsamstem Wert), Gesamtumsatz (Summe aller erfassten Honorare mit ausstehendem Saldo) und Kunden (Anzahl einzigartiger Kunden mit Gesamtanzahl der Veröffentlichungen). Unterhalb der Zusammenfassungskarten visualisieren drei Diagramme Ihre Daten im Zeitverlauf, und eine Kundenaufschlüsselungstabelle zeigt Statistiken pro Kunde.",
        "mockup": "analytics-overview"
      },
      {
        "heading": "Veröffentlichungsgeschwindigkeit und Bearbeitungszeit",
        "body": "Das Diagramm Veröffentlichungsgeschwindigkeit ist ein Balkendiagramm, das zeigt, wie viele Veröffentlichungen Sie pro Monat im ausgewählten Zeitraum abgeschlossen haben. Höhere Balken bedeuten produktivere Monate. Nutzen Sie es, um Trends in Ihrer Leistung zu erkennen und arbeitsreiche oder ruhige Phasen zu identifizieren. Das Diagramm Bearbeitungszeit zeigt die durchschnittliche Anzahl der Tage von der Erstellung bis zum Abschluss der Veröffentlichung pro Monat. Niedrigere Balken bedeuten schnellere Lieferung. Zusammen helfen Ihnen diese Diagramme, Ihre Kapazität zu verstehen und festzustellen, ob Ihr Workflow schneller oder langsamer wird.",
        "mockup": "analytics-velocity"
      },
      {
        "heading": "Umsatzdiagramm",
        "body": "Das Umsatzdiagramm ist ein Flächendiagramm, das die monatlich verdienten Gesamthonorare anzeigt. Es erfasst die bei Ihren Veröffentlichungen aufgezeichneten Zahlungsbeträge und spiegelt wider, was Kunden tatsächlich bezahlt haben. Nutzen Sie es, um Einkommenstrends zu erkennen, Ihre umsatzstärksten Monate zu identifizieren und ruhigere Phasen zu planen. Die Umsatzdaten stammen aus der Zahlungsverfolgungsfunktion bei jeder Veröffentlichung. Stellen Sie daher sicher, dass Honorare und Zahlungsstatus für eine genaue Berichterstattung aktuell sind.",
        "mockup": "analytics-revenue"
      },
      {
        "heading": "Kundenaufschlüsselung",
        "body": "Die Kundenaufschlüsselungstabelle am unteren Rand der Analytics-Seite listet jeden Kunden mit seinen wichtigsten Kennzahlen auf: Anzahl der Veröffentlichungen, Gesamtumsatz, bezahlter Betrag und durchschnittliche Bearbeitungszeit. So können Sie erkennen, welche Kunden die meiste Arbeit und den meisten Umsatz bringen, wer pünktlich zahlt und wo Ihre Zeit aufgewendet wird. Klicken Sie auf eine Kundenzeile, um deren Veröffentlichungen anzuzeigen. Die Tabelle ist standardmäßig nach Umsatz sortiert.",
        "mockup": "analytics-clients"
      },
      {
        "heading": "Datumsbereichsauswahl",
        "body": "Verwenden Sie die Datumsbereichsauswahl in der oberen rechten Ecke, um festzulegen, welchen Zeitraum die Analysen abdecken. Voreingestellte Bereiche umfassen Letzte 7 Tage, Letzte 30 Tage, Letzte 90 Tage und Letzte 365 Tage. Sie können auch einen benutzerdefinierten Datumsbereich festlegen, indem Sie ein bestimmtes Start- und Enddatum auswählen. Alle vier Zusammenfassungskarten und alle drei Diagramme werden aktualisiert, um den ausgewählten Zeitraum widerzuspiegeln. Die Datumsbereichsauswahl funktioniert im gesamten Analytics-Dashboard auf die gleiche Weise.",
        "tip": "Verwenden Sie den 365-Tage-Bereich für Jahresrückblicke und die Steuervorbereitung. Der 30-Tage-Bereich ist nützlich für monatliche Überprüfungen Ihrer Geschäftsentwicklung.",
        "mockup": "analytics-date-range"
      }
    ]
  },
  {
    "id": "release-settings",
    "title": "Veröffentlichungs-Einstellungen",
    "category": "releases",
    "summary": "Konfigurieren Sie Veröffentlichungsdetails, Kundeninformationen, Vertriebsmetadaten, Zahlungsverfolgung und Teammitglieder für jede Veröffentlichung.",
    "tags": ["release", "settings", "client", "distribution", "payment", "team", "collaborators", "metadata", "UPC", "copyright"],
    "updatedAt": "2026-03-15",
    "content": [
      {
        "heading": "Veröffentlichungs-Einstellungen öffnen",
        "body": "Klicken Sie in einer beliebigen Veröffentlichung auf das Zahnradsymbol in der Veröffentlichungs-Werkzeugleiste oder wählen Sie \"Einstellungen\" aus dem Drei-Punkte-Menü. Die Einstellungsseite hat fünf Abschnitte: Veröffentlichungsdetails, Kundeninformationen, Vertrieb, Zahlung und Teamverwaltung. Ein Zurück-Pfeil oben bringt Sie zurück zur Veröffentlichungsansicht. Änderungen werden gespeichert, wenn Sie auf die Schaltfläche Speichern am unteren Rand des Formulars klicken.",
        "mockup": "release-settings-overview"
      },
      {
        "heading": "Veröffentlichungsdetails",
        "body": "Der Abschnitt Veröffentlichungsdetails enthält die Kernmetadaten Ihres Projekts. Laden Sie ein Cover hoch oder ändern Sie es, indem Sie auf den Bildbereich klicken. Legen Sie den Veröffentlichungstitel und den Künstlernamen in Textfeldern fest. Wählen Sie den Veröffentlichungstyp (Single, EP oder Album) und das Format (Stereo, Dolby Atmos oder Stereo + Atmos) über Pill-Schaltflächen. Setzen Sie den Status (Entwurf, In Bearbeitung oder Fertig) auf die gleiche Weise. Fügen Sie Genre-Tags über die Tag-Eingabe mit Autovervollständigung hinzu (Rock, Pop, Hip-Hop, Electronic usw.). Legen Sie ein Zieldatum für Ihre Veröffentlichungsfrist fest, das auch in das Kalender-Abonnement einfließt.",
        "mockup": "release-settings-details"
      },
      {
        "heading": "Kundeninformationen",
        "body": "Der Abschnitt Kundeninformationen speichert Kontaktdaten für den mit dieser Veröffentlichung verbundenen Kunden. Die Felder umfassen Kundenname, Kunden-E-Mail, Kundentelefon und Lieferhinweise. Der Kundenname erscheint in der Analytics-Kundenaufschlüsselung und in Zahlungsberichten. Lieferhinweise ist ein Freitextbereich für besondere Anweisungen wie bevorzugte Dateinamenskonventionen oder Lieferplattformen.",
        "mockup": "release-settings-client"
      },
      {
        "heading": "Vertriebsmetadaten",
        "body": "Der Abschnitt Vertrieb erfasst die für den digitalen Vertrieb benötigten Metadaten. Die Felder umfassen Vertriebspartner (z.B. DistroKid, TuneCore), Plattenlabel, UPC/EAN-Barcode, Katalognummer, Copyright-Inhaber, Copyright-Jahr und Phonographisches Copyright (die P-Zeile). Diese Werte werden vom Vertriebstracker verwendet und erscheinen in Ihrem Datenexport.",
        "mockup": "release-settings-distribution"
      },
      {
        "heading": "Zahlungseinstellungen",
        "body": "Der Abschnitt Zahlung ist nur sichtbar, wenn die Zahlungsverfolgung in Ihren Benutzereinstellungen aktiviert ist. Er zeigt den Zahlungsstatus über Pill-Schaltflächen (Kein Honorar, Unbezahlt, Teilweise, Bezahlt), ein Projekthonorar-Feld mit Währungsauswahl, den Bezahlten Betrag und den berechneten Restbetrag. Ein Zahlungsnotizen-Textbereich ermöglicht die Erfassung von Zahlungsbedingungen oder Rechnungsreferenzen. Der Zahlungsstatus und die Beträge erscheinen auf Dashboard-Karten und in den Analytics-Umsatzdiagrammen.",
        "mockup": "release-settings-payment",
        "tip": "Setzen Sie den Zahlungsstatus auf \"Teilweise\", wenn eine Anzahlung eingegangen ist. Der Restbetrag wird automatisch aus dem Projekthonorar abzüglich des bezahlten Betrags berechnet."
      },
      {
        "heading": "Teamverwaltung",
        "body": "Der Abschnitt Teamverwaltung ermöglicht es Ihnen, Mitarbeiter und Kunden zur Veröffentlichung einzuladen. Geben Sie eine E-Mail-Adresse ein, wählen Sie eine Rolle (Mitarbeiter oder Kunde) und klicken Sie auf Einladen. Ausstehende Einladungen zeigen ein \"Eingeladen\"-Badge mit einer Erneut-senden-Schaltfläche. Akzeptierte Mitglieder zeigen ihren Anzeigenamen, ihre Rolle und eine Option zum Entfernen. Der Veröffentlichungseigentümer wird immer aufgelistet und kann nicht entfernt werden. Mitarbeiter können Tracks bearbeiten und Kommentare hinterlassen; Kunden haben schreibgeschützten Zugriff sowie die Möglichkeit, Tracks über das Kundenportal freizugeben.",
        "mockup": "release-settings-team",
        "warning": "Das Entfernen eines Teammitglieds widerruft dessen Zugriff sofort. Die Person kann die Veröffentlichung und deren Tracks nicht mehr einsehen."
      }
    ]
  },
  {
    "id": "upload-audio-tracks",
    "title": "Audio hochladen und verwalten",
    "category": "audio",
    "summary": "So laden Sie Audiodateien hoch, verwalten Versionen und verwenden den Wellenform-Player.",
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
        "heading": "Audio hochladen",
        "body": "Öffnen Sie einen beliebigen Track und gehen Sie zum Audio-Tab. Klicken Sie auf den Upload-Bereich oder ziehen Sie eine Datei direkt hinein. Unterstützte Formate: WAV, AIFF, FLAC, MP3, AAC und M4A, bis zu 500 MB pro Datei. Die Datei wird in einen sicheren Cloud-Speicher hochgeladen, und eine Wellenformvisualisierung wird automatisch generiert. Dateimetadaten (Format, Abtastrate, Bittiefe, Dauer) werden erfasst und unter den Versionsinformationen angezeigt, zum Beispiel: \"Typical Wonderful 2025-10-10 MGO.wav, WAV, 48kHz, 24-bit\".",
        "mockup": "audio-upload"
      },
      {
        "heading": "Track-Versionen",
        "body": "Jedes Mal, wenn Sie eine neue Datei zum selben Track hochladen, wird sie zur nächsten Version. Der Versionsauswähler über der Wellenform zeigt nummerierte Schaltflächen (v1, v2, v3 usw.) sowie eine +-Schaltfläche zum Hochladen einer weiteren Version. Klicken Sie auf eine Version, um zu ihr zu wechseln. Jede Version zeigt ihre Versionsnummer, das Uploaddatum, die Kommentaranzahl und ein Download-Symbol zum Herunterladen der Originaldatei. Frühere Versionen bleiben vollständig mit ihren eigenen Kommentaren und Wellenformen erhalten.",
        "tip": "Laden Sie überarbeitete Mixe zum selben Track hoch, anstatt einen neuen Track zu erstellen. So bleibt Ihr Versionsverlauf übersichtlich, Kommentare zu älteren Versionen bleiben erhalten, und Sie können Mixe im Zeitverlauf vergleichen.",
        "mockup": "track-versions"
      },
      {
        "heading": "Wellenform-Player",
        "body": "Jede hochgeladene Version zeigt eine interaktive Wellenform. Klicken Sie irgendwo auf die Wellenform, um zu dieser Position zu springen. Die Transportsteuerung unterhalb der Wellenform umfasst: aktuelle Zeit, Schleifen-Umschalter, Rückwärtsspringen, Play/Pause, Vorwärtsspringen, Wiederholen-Umschalter und Gesamtdauer. Der Player zeigt auch eine integrierte LUFS-Lautheitsmessung (z. B. \"-14,8 LUFS\") neben den Dateimetadaten, farbcodiert anhand von Lautheitszielwerten, damit Sie die Pegel auf einen Blick beurteilen können. Wenn es zeitgestempelte Kommentare zur aktuellen Version gibt, erscheinen kleine Markierungssymbole auf der Wellenform an ihren Positionen.",
        "mockup": "track-tab-audio"
      }
    ]
  },
  {
    "id": "audio-converter",
    "title": "Auslieferungsformate und Konvertierung",
    "category": "audio",
    "summary": "Richten Sie Auslieferungsformate ein, konvertieren Sie Audio und betten Sie automatisch Metadaten-Tags wie Künstler, Cover, ISRC und Songtexte ein.",
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
        "heading": "Auslieferungsformate festlegen",
        "body": "Öffnen Sie einen beliebigen Track und gehen Sie zum Brief-Tab. Scrollen Sie zum Bereich Auslieferung. Hier wählen Sie die benötigten Ausgabeformate für Ihr Projekt aus, indem Sie auf die Format-Chips klicken. Verfügbare konvertierbare Formate: WAV, AIFF, FLAC, MP3, AAC, OGG und ALAC. Ausgewählte Formate erscheinen grün hervorgehoben mit einem Häkchen-Symbol. Zusätzliche nicht-konvertierbare Formate (DDP, ADM BWF/Atmos, MQA) können als Referenz aktiviert werden; sie zeigen einen Info-Tooltip, der erklärt, dass keine automatische Konvertierung verfügbar ist. Sie können auch einen benutzerdefinierten Formatnamen im Eingabefeld \"Benutzerdefiniertes Format...\" eingeben und auf \"+ Hinzufügen\" klicken, wenn ein Format nicht aufgelistet ist. Verwenden Sie das \"Exportieren von\"-Dropdown, um auszuwählen, von welcher Audioversion konvertiert werden soll, z. B. \"v3 - dateiname.wav (aktuellste)\".",
        "mockup": "format-convert"
      },
      {
        "heading": "Konvertieren und Herunterladen",
        "body": "Wählen Sie die verfügbaren Formate aus, indem Sie auf die Format-Chips im Bereich Auslieferung klicken: Konvertierbare Formate sind WAV, AIFF, FLAC, MP3, AAC, OGG und ALAC. Ausgewählte Formate erscheinen grün hervorgehoben mit einem Häkchen. Klicken Sie auf das Download-Pfeil-Symbol neben einem ausgewählten konvertierbaren Format, um eine Konvertierung zu starten. Das Symbol zeigt einen Spinner an, während die Konvertierung im Hintergrund verarbeitet wird. Nach Abschluss der Konvertierung wird die Datei automatisch in Ihren Browser heruntergeladen. Jede Konvertierung verwendet die Audioversion, die Sie im \"Exportieren von\"-Dropdown ausgewählt haben, und konvertiert von der hochgeladenen Originaldatei, um maximale Audioqualität zu erhalten. Verlustfreie Formate (WAV, AIFF, FLAC, ALAC) behalten die Abtastrate und Bittiefe der Quelldatei bei. Verlustbehaftete Formate verwenden optimierte Presets: MP3 exportiert bei 44.1 kHz / 320 kbps, AAC bei 44.1 kHz / 256 kbps und OGG bei 44.1 kHz / Qualität 8.",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Automatische Metadaten-Einbettung",
        "body": "Wenn Sie in MP3, FLAC, AAC, OGG oder ALAC konvertieren, schreibt Mix Architect automatisch branchenübliche Metadaten-Tags in die Ausgabedatei. Dies umfasst: Künstler, Titel, Album, Tracknummer, Genre, Erscheinungsjahr, Copyright, ISRC, UPC/Barcode, Songtexte, Cover und ReplayGain. ReplayGain ist ein Lautheits-Tag, der kompatiblen Playern mitteilt, wie stark die Lautstärke angepasst werden soll, damit Tracks auf einem einheitlichen Pegel ohne Clipping wiedergegeben werden. Mix Architect berechnet ihn aus dem gemessenen LUFS-Wert Ihres Audios nach dem ReplayGain 2.0 Standard (Referenzpegel von -18 LUFS). MP3-Dateien erhalten ID3v2-Tags, FLAC und OGG verwenden Vorbis-Kommentare, und AAC/ALAC verwenden iTunes-style MP4-Atoms. Alle Metadaten werden aus Ihren Veröffentlichungs- und Trackdetails übernommen (einschließlich des Delivery-Tabs für ISRC und Songtexte sowie des Veröffentlichungs-Covers). WAV- und AIFF-Exporte enthalten keine Metadaten-Tags. Nach Abschluss einer Konvertierung können Sie mit dem Mauszeiger über das Tag-Symbol neben dem Format-Chip fahren, um genau zu sehen, welche Tags eingebettet wurden.",
        "tip": "Füllen Sie Ihren Delivery-Tab (ISRC, Songtexte) aus und laden Sie Ihr Cover hoch, bevor Sie exportieren. Je mehr Metadaten Sie bereitstellen, desto vollständiger werden Ihre exportierten Dateien für die Distribution."
      },
      {
        "heading": "Unterstützte Formate: Referenz",
        "body": "Verlustfreie Formate bewahren die Quellqualität: WAV (PCM, Quellrate/-tiefe), AIFF (PCM, Quellrate/-tiefe), FLAC (Quellrate), ALAC (Quellrate). Verlustbehaftete Formate verwenden feste, für die Distribution optimierte Presets: MP3 (44.1 kHz, 320 kbps, Stereo), AAC (44.1 kHz, 256 kbps, Stereo), OGG Vorbis (44.1 kHz, Qualität 8, Stereo). Nicht-konvertierbare Formate (nur Tag, keine automatische Konvertierung): DDP, ADM BWF (Atmos), MQA. Die Technischen Einstellungen (Abtastrate und Bittiefe) oben im Brief-Tab sind Referenz-Metadaten, die das Quell-Audio beschreiben; sie steuern nicht die Konvertierungsausgabe. Das Textfeld Besondere Anforderungen unterhalb der Auslieferungsformate ermöglicht es Ihnen, Hinweise zu Auslieferungsanweisungen hinzuzufügen.",
        "warning": "Die Konvertierung von einem verlustbehafteten Format (MP3, AAC, OGG) in ein verlustfreies Format (WAV, FLAC) verbessert nicht die Audioqualität. Die ursprünglichen Kompressionsartefakte bleiben erhalten. Laden Sie immer Ihre Quelldatei in höchster Qualität hoch.",
        "mockup": "supported-formats"
      }
    ]
  },
  {
    "id": "audio-review-comments",
    "title": "Zeitgestempelte Kommentare hinterlassen",
    "category": "audio",
    "summary": "Fügen Sie zeitcodiertes Feedback direkt auf der Wellenform hinzu, damit Mitarbeiter genau wissen, wo sie hinhören sollen.",
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
        "heading": "Einen Kommentar hinzufügen",
        "body": "Öffnen Sie einen Track und gehen Sie zum Audio-Tab. Doppelklicken Sie auf die Wellenform an der genauen Stelle, die Sie referenzieren möchten. Im Feedback-Bereich unterhalb der Wellenform erscheint ein Texteingabefeld, in dem Sie Ihren Kommentar eingeben können. Der Kommentar wird an diesen Timecode und diese Version angeheftet. Im Feedback-Bereich zeigt jeder Kommentar den Namen des Autors, ein farbiges Zeitstempel-Badge (z. B. \"0:07\" oder \"1:22\"), das relative Datum und den Nachrichtentext. Kommentarmarkierungen erscheinen auch als kleine Symbole direkt auf der Wellenform an ihren Positionen. Klicken Sie auf einen Zeitstempel, um den Wiedergabekopf zu diesem Moment zu springen.",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "Portal-Kommentare",
        "body": "Kunden, die über das Portal Überprüfungen durchführen, können ebenfalls zeitgestempelte Kommentare auf der Wellenform hinterlassen. Ihre Kommentare erscheinen im selben Feedback-Bereich neben den Teamkommentaren, sind aber durch ein \"Kunde\"-Badge visuell hervorgehoben, damit Sie externes Feedback schnell identifizieren können. So bleibt das gesamte Feedback, intern und extern, an einem Ort unter der jeweiligen Audioversion organisiert.",
        "mockup": "portal-comments"
      },
      {
        "heading": "Notizen vs. Audio-Kommentare",
        "body": "Der Audio-Tab ist für zeitgestempeltes Feedback, das an bestimmte Momente in der Wellenform gebunden ist: \"Gesang bei 1:22 lauter machen\" oder \"die Snare ist hier zu laut\". Der Notizen-Tab ist für allgemeine Diskussionen und Revisionsnotizen, die nicht an einen Timecode gebunden sind: \"insgesamt braucht der Mix mehr Tiefbass\" oder \"der Kunde möchte einen aggressiveren Ansatz\". Audio-Kommentare sind versionsspezifisch (gebunden an v1, v2 usw.), während Notizen für den gesamten Track gelten. Verwenden Sie den Intention-Tab, um die gesamte kreative Vision, emotionale Tags und Referenztracks zu dokumentieren.",
        "tip": "Für ein vollständiges Bild des Feedbacks zu einem Track prüfen Sie sowohl den Feedback-Bereich des Audio-Tabs (für zeitspezifische Anmerkungen) als auch den Notizen-Tab (für allgemeine Diskussionen). Kunden-Feedback kann an beiden Stellen erscheinen.",
        "mockup": "resolve-feedback"
      }
    ]
  },
  {
    "id": "timeline-overview",
    "title": "Die Zeitachsenansicht verwenden",
    "category": "timeline",
    "summary": "Wechseln Sie zur Zeitachsenansicht in Ihrem Dashboard, um Veröffentlichungszeitpläne zu visualisieren und bis zum Veröffentlichungsdatum herunterzuzählen.",
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
        "heading": "Zur Zeitachsenansicht wechseln",
        "body": "Suchen Sie im [Dashboard](/app) die zwei Ansichtsumschalter im Kopfbereich (unter den Zahlungsstatistiken). Klicken Sie auf das Zeitachsen-Symbol (die zweite Schaltfläche), um von der Rasteransicht zur Zeitachsenansicht zu wechseln. Die Zeitachse zeigt Ihre Veröffentlichungen chronologisch nach ihren geplanten Veröffentlichungsterminen an. Veröffentlichungen ohne Zieldatum erscheinen in einem separaten Bereich \"Ungeplant\" am unteren Ende. Ihre Ansichtseinstellung wird automatisch gespeichert, sodass das Dashboard Ihre Wahl beim nächsten Besuch beibehält.",
        "mockup": "timeline-full"
      },
      {
        "heading": "Die Zeitachse lesen",
        "body": "Jede Veröffentlichung erscheint als Karte, die nach ihrem geplanten Veröffentlichungsdatum positioniert ist. Die Zeitachse zeigt einen Countdown: \"X Tage bis zur Veröffentlichung\" für bevorstehende Termine oder \"Vor X Tagen veröffentlicht\" für vergangene Termine. Veröffentlichungskarten zeigen dieselben Informationen wie in der Rasteransicht (Titel, Künstler, Status, Format, Track-Anzahl) plus den Planungskontext. Statuspunkte sind farbcodiert: Orange für Entwurf, Blau für In Bearbeitung und Grün für Fertig. Angeheftete Veröffentlichungen erscheinen oben in der Zeitachse.",
        "mockup": "timeline-navigate"
      },
      {
        "heading": "Zieltermine festlegen",
        "body": "Um eine Veröffentlichung zur Zeitachse hinzuzufügen, legen Sie ein geplantes Veröffentlichungsdatum fest, entweder bei der Erstellung der Veröffentlichung oder in den Veröffentlichungseinstellungen (Zahnrad-Symbol auf der Veröffentlichungsseite). Das Feld Geplantes Veröffentlichungsdatum verwendet einen Datumsauswähler. Die Zeitachse wird automatisch aktualisiert, wenn Sie Termine anpassen. Dies hilft Ihnen, Ihren Zeitplan zu visualisieren und überlappende Veröffentlichungsfenster über mehrere Projekte hinweg zu vermeiden.",
        "tip": "Verwenden Sie die Zeitachsenansicht während der Planung, um Ihre Veröffentlichungen zeitlich zu verteilen. Eine klare Übersicht über bevorstehende Fristen hilft, Engpässe in Ihrem Mixing-, Mastering- oder Distributions-Workflow zu vermeiden.",
        "mockup": "timeline-dates"
      }
    ]
  },
  {
    "id": "export-data",
    "title": "Ihre Kontodaten exportieren",
    "category": "account",
    "summary": "Laden Sie einen vollständigen ZIP-Export Ihrer Veröffentlichungen, Tracks, Audiodateien und Zahlungsunterlagen herunter.",
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
        "heading": "Was enthalten ist",
        "body": "Der Datenexport ist eine ZIP-Datei, die alle Ihre Veröffentlichungsmetadaten, Trackdetails, Audiodateien (alle Versionen) und Zahlungsunterlagen enthält. Vor dem Herunterladen zeigt die App eine Schätzung der Exportgröße zusammen mit Zählungen: Anzahl der enthaltenen Veröffentlichungen, Tracks und Audiodateien. So erhalten Sie ein vollständiges Backup aller Daten in Ihrem Konto.",
        "mockup": "export-contents"
      },
      {
        "heading": "Einen Export starten",
        "body": "Gehen Sie zu [Einstellungen](/app/settings) und scrollen Sie zum Bereich \"Ihre Daten\". Klicken Sie auf \"Meine Daten exportieren\", um zu beginnen. Die App berechnet zunächst eine Schätzung mit der ungefähren Dateigröße und Zählungen (z. B. \"3 Veröffentlichungen, 12 Tracks, 8 Audiodateien\"). Überprüfen Sie die Schätzung und klicken Sie dann auf \"Herunterladen\", um den Export zu starten. Ein Fortschrittsbalken zeigt den Download-Status. Bei großen Konten mit vielen Audiodateien kann der Export einige Zeit dauern. Die ZIP-Datei wird nach Abschluss automatisch in Ihren Browser heruntergeladen. Sie können auf \"Abbrechen\" klicken, um ohne Download zurückzukehren.",
        "mockup": "export-progress"
      },
      {
        "heading": "Datenschutz",
        "body": "Ihr Export enthält ausschließlich Daten, die Sie besitzen oder erstellt haben. Beiträge von Mitarbeitern (wie Kommentare zu Ihren Veröffentlichungen) sind enthalten, aber private Daten anderer Benutzer nicht. Der Export wird bei Bedarf generiert und nach dem Download nicht auf unseren Servern gespeichert.",
        "tip": "Führen Sie regelmäßig einen Datenexport als Backup Ihrer Projekte und Audiodateien durch. Dies ist besonders nützlich, bevor Sie größere Änderungen an Ihrem Konto vornehmen.",
        "mockup": "export-privacy"
      }
    ]
  },
  {
    "id": "user-settings",
    "title": "Benutzereinstellungen",
    "category": "account",
    "summary": "Konfigurieren Sie Ihr Profil, Erscheinungsbild, E-Mail-Benachrichtigungen, Mix-Standardwerte und mehr.",
    "tags": ["settings", "profile", "email", "notifications", "preferences", "theme", "appearance", "defaults", "persona", "calendar", "export"],
    "updatedAt": "2026-03-15",
    "content": [
      {
        "heading": "Einstellungen im Überblick",
        "body": "Öffnen Sie die [Benutzereinstellungen](/app/settings) über die Seitenleiste oder das Kontomenü in der oberen Leiste. Die Einstellungen sind in Bereiche unterteilt: Profil, Abonnement, Region & Währung, Erscheinungsbild, Persona, Zahlungsverfolgung, E-Mail-Einstellungen, Mix-Standardwerte, Kalender und Ihre Daten. Änderungen werden sofort gespeichert, wenn Sie mit den einzelnen Bereichen interagieren.",
        "mockup": "settings-overview"
      },
      {
        "heading": "Profil",
        "body": "Der Bereich Profil ist der erste Abschnitt auf der Seite. Er enthält drei Felder: Anzeigename (wird bei Kommentaren, Benachrichtigungen und E-Mails an Mitarbeiter angezeigt), Firmenname (optional, für Ihr Branding) und E-Mail (schreibgeschützt, wird über Ihren Authentifizierungsanbieter verwaltet). Geben Sie Ihren Namen ein und klicken Sie auf Speichern. Eine personalisierte Begrüßung mit Ihrem Vornamen erscheint in der oberen Leiste.",
        "mockup": "settings-profile"
      },
      {
        "heading": "Abonnement",
        "body": "Der Bereich Abonnement zeigt Ihren aktuellen Tarif an. Pro-Konten zeigen ein grünes \"PRO\"-Badge, den Monatspreis und eine Schaltfläche \"Abrechnung verwalten\", die das Stripe-Portal öffnet, um Zahlungsmethoden zu aktualisieren, Rechnungen einzusehen und Belege herunterzuladen. Kostenlose Konten sehen stattdessen eine Schaltfläche \"Auf Pro upgraden\". Pro schaltet unbegrenzte Veröffentlichungen, Audio-Formatkonvertierung und Prioritäts-Support frei.",
        "mockup": "settings-subscription"
      },
      {
        "heading": "Region und Währung",
        "body": "Der Bereich Region & Währung enthält zwei Dropdowns. Das Gebietsschema-Dropdown legt Ihre Sprache und Ihr Datumsformat fest, mit einem Flaggen-Emoji neben jeder Option. Eine Änderung des Gebietsschemas aktualisiert auch automatisch die Standardwährung. Das Währungs-Dropdown ermöglicht es Ihnen, die für die Zahlungsverfolgung verwendete Währung zu überschreiben. Eine Formatvorschau unten zeigt, wie Beträge dargestellt werden (z.B. \"1.234,56 $\").",
        "mockup": "settings-region"
      },
      {
        "heading": "Erscheinungsbild",
        "body": "Der Bereich Erscheinungsbild ermöglicht den Wechsel zwischen Hell, Dunkel und System über drei gestaltete Schaltflächen. Das aktive Thema wird mit Ihrer Akzentfarbe hervorgehoben. Der Systemmodus folgt der Einstellung Ihres Betriebssystems. Ihre Theme-Auswahl wird in Ihrem Konto gespeichert und gilt auf allen Geräten.",
        "mockup": "settings-appearance"
      },
      {
        "heading": "Persona",
        "body": "Der Bereich Persona fragt, wie Sie Mix Architect verwenden. Wählen Sie zwischen Künstler, Ingenieur, Beides oder Anderes über Radiobuttons. Ihre Auswahl passt das Erlebnis an: Die Auswahl von Ingenieur oder Beides aktiviert automatisch die Zahlungsverfolgung, während Künstler sie standardmäßig deaktiviert lässt. Sie können die Zahlungsverfolgung jederzeit unabhängig überschreiben. Ein Hinweis unter den Optionen erklärt, wie die Persona die Standardeinstellungen beeinflusst.",
        "mockup": "settings-persona"
      },
      {
        "heading": "Zahlungsverfolgung",
        "body": "Der Bereich Zahlungsverfolgung enthält einen einzelnen Umschalter. Wenn aktiviert, zeigen Veröffentlichungskarten im Dashboard Zahlungsstatistiken (Ausstehend, Verdient, Gesamthonorare), und jede Veröffentlichung erhält einen Zahlungsbereich in ihren Einstellungen. Wenn deaktiviert, werden alle zahlungsbezogenen Elemente ausgeblendet. Der Umschalter speichert sofort und aktualisiert die Seite.",
        "mockup": "settings-payment-tracking",
        "tip": "Die Zahlungsverfolgung wird automatisch aktiviert, wenn Sie Ingenieur oder Beides als Persona auswählen, und für Künstler deaktiviert. Sie können dies jederzeit manuell überschreiben."
      },
      {
        "heading": "E-Mail-Benachrichtigungen",
        "body": "Der Bereich E-Mail-Einstellungen steuert, welche transaktionalen E-Mails Sie von Mix Architect erhalten. Jede Kategorie hat einen Ein/Aus-Schalter. Die Kategorien umfassen: Veröffentlichungs-Live-Benachrichtigungen (wenn eine Veröffentlichung auf einer Plattform live geht), Neue Kommentar-Benachrichtigungen (wenn jemand Ihre Veröffentlichung kommentiert), Wöchentliche Zusammenfassung (eine Übersicht der Aktivitäten über alle Veröffentlichungen), Zahlungserinnerungen (wenn eine Abonnementzahlung fehlschlägt), Zahlungsbestätigungen (wenn eine Zahlung verarbeitet wird), Abonnementbestätigungen (wenn Ihr Tarif aktiviert wird) Kündigungsbenachrichtigungen (wenn Ihr Tarif gekündigt wird) und Kunden-Feedback (wenn ein Kunde genehmigt oder Änderungen anfordert). Alle Kategorien sind standardmäßig aktiviert. Jede E-Mail enthält einen Abmeldelink am Ende.",
        "mockup": "settings-email-prefs",
        "tip": "Sie können sich auch von einer bestimmten E-Mail-Kategorie abmelden, indem Sie auf den Abmeldelink am Ende einer Benachrichtigungs-E-Mail klicken. Keine Anmeldung erforderlich."
      },
      {
        "heading": "Mix-Standardwerte",
        "body": "Der Bereich Mix-Standardwerte legt Ihre bevorzugten Startwerte für neue Veröffentlichungen fest. Wählen Sie ein Standardformat (Stereo, Dolby Atmos oder Stereo + Atmos) über Pill-Schaltflächen. Wählen Sie eine Standard-Abtastrate (44,1 kHz, 48 kHz oder 96 kHz) und Bittiefe (16-Bit, 24-Bit oder 32-Bit Float) aus Dropdowns. Sie können auch eine Standard-Elementliste über das Tag-Eingabefeld definieren (z.B. Gesang, Bass, Drums). Diese Standardwerte werden automatisch angewendet, wenn Sie neue Veröffentlichungen erstellen, und sparen wiederkehrende Einrichtung. Klicken Sie auf Speichern, um Ihre Auswahl zu sichern.",
        "mockup": "settings-mix-defaults"
      },
      {
        "heading": "Kalender",
        "body": "Der Bereich Kalender bietet einen iCal-Abonnement-Feed für Ihre Veröffentlichungsfristen. Ein schreibgeschütztes URL-Feld zeigt Ihre persönliche Feed-Adresse mit einer Kopieren-Schaltfläche, um sie in die Zwischenablage zu kopieren. Darunter erklären Einrichtungshinweise, wie Sie den Feed zu Google Kalender, Apple Kalender oder Outlook hinzufügen. Eine Regenerieren-Schaltfläche erstellt eine neue Feed-URL, falls Sie den Zugang zur alten widerrufen müssen.",
        "mockup": "settings-calendar",
        "warning": "Das Regenerieren Ihrer Kalender-Feed-URL macht den alten Link ungültig. Alle Kalender, die die vorherige URL abonniert haben, erhalten keine Updates mehr."
      },
      {
        "heading": "Ihre Daten",
        "body": "Der Bereich Ihre Daten ermöglicht den Export aller Ihrer Mix Architect-Daten. Er zeigt eine geschätzte Exportgröße und bietet eine Download-Schaltfläche. Der Export umfasst alle Veröffentlichungen, Tracks, Audio-Datei-Metadaten, Notizen, Kommentare, Mitarbeiterlisten und Einstellungen. Nutzen Sie dies für Backups oder wenn Sie eine lokale Kopie Ihrer Arbeit wünschen.",
        "mockup": "settings-data"
      }
    ]
  },
  {
    "id": "manage-subscription",
    "title": "Ihr Pro-Abonnement verwalten",
    "category": "billing",
    "summary": "Zeigen Sie Ihren Tarif an, aktualisieren Sie Zahlungsdetails und verwalten Sie Ihr Pro-Abonnement über Stripe.",
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
        "heading": "Ihren Tarif anzeigen",
        "body": "Gehen Sie zu [Einstellungen](/app/settings) und scrollen Sie zum Bereich Abonnement am unteren Ende. Der Bereich lautet \"Verwalten Sie Ihren Mix Architect-Tarif.\" Sie sehen Ihren aktuellen Tarif: Pro-Konten zeigen \"14 $/Monat, Unbegrenzte Veröffentlichungen\" mit einem grünen \"PRO\"-Badge und einer Schaltfläche \"Abrechnung verwalten\". Kostenlose Konten zeigen stattdessen eine Schaltfläche \"Auf Pro upgraden\".",
        "mockup": "plan-current"
      },
      {
        "heading": "Auf Pro upgraden",
        "body": "Klicken Sie auf der Seite [Einstellungen](/app/settings) im Bereich Abonnement auf \"Auf Pro upgraden\". Sie werden zu einer sicheren Stripe-Checkout-Seite weitergeleitet. Nach Bestätigung der Zahlung wird Ihr Konto sofort aktualisiert und Sie erhalten Zugang zu allen Pro-Funktionen, einschließlich unbegrenzter Veröffentlichungen und Audio-Konvertierung. Das Pro-Badge erscheint neben Ihren Tarifinformationen.",
        "mockup": "upgrade-pro"
      },
      {
        "heading": "Zahlung verwalten",
        "body": "Klicken Sie auf \"Abrechnung verwalten\" im Bereich Abonnement der [Einstellungen](/app/settings), um das Stripe-Abrechnungsportal zu öffnen. Von dort aus können Sie Ihre Zahlungsmethode aktualisieren, Rechnungen einsehen und Belege herunterladen. Die gesamte Zahlungsabwicklung wird sicher über Stripe abgewickelt.",
        "mockup": "manage-payment"
      }
    ]
  },
  {
    "id": "cancel-resubscribe",
    "title": "Kündigung und erneutes Abonnieren",
    "category": "billing",
    "summary": "So kündigen Sie Ihr Pro-Abonnement und was mit Ihren Daten passiert.",
    "tags": [
      "cancel",
      "resubscribe",
      "downgrade",
      "billing"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Ihr Abonnement kündigen",
        "body": "Klicken Sie auf \"Abrechnung verwalten\" im Bereich Abonnement der [Einstellungen](/app/settings), um das Stripe-Portal zu öffnen, und klicken Sie dann auf \"Tarif kündigen\". Ihr Pro-Zugang bleibt bis zum Ende Ihres aktuellen Abrechnungszeitraums bestehen. Ein Hinweis in den [Einstellungen](/app/settings) zeigt an, wann Ihr Pro-Tarif abläuft, damit Sie genau wissen, wie lange Ihr Zugang noch besteht.",
        "mockup": "cancel-subscription"
      },
      {
        "heading": "Was mit Ihren Daten passiert",
        "body": "Alle Ihre Veröffentlichungen, Tracks, Audiodateien, Kommentare und Zahlungsunterlagen bleiben vollständig erhalten. Sie verlieren nichts beim Downgrade. Allerdings werden Pro-Funktionen (wie unbegrenzte Veröffentlichungen und Audio-Konvertierung) nicht mehr verfügbar sein, bis Sie erneut abonnieren. Ihre bestehenden Veröffentlichungen bleiben zugänglich.",
        "warning": "Kostenlose Konten sind auf eine aktive Veröffentlichung beschränkt. Wenn Sie mehr als eine Veröffentlichung haben, wenn Ihr Pro-Tarif abläuft, bleiben Ihre bestehenden Veröffentlichungen erhalten, aber Sie können keine neuen Veröffentlichungen erstellen, bis Sie erneut abonnieren oder auf eine Veröffentlichung reduzieren.",
        "mockup": "data-after-cancel"
      },
      {
        "heading": "Erneut abonnieren",
        "body": "Um Pro zu reaktivieren, gehen Sie zum Bereich Abonnement in den [Einstellungen](/app/settings) und klicken Sie erneut auf \"Auf Pro upgraden\", oder verwenden Sie \"Abrechnung verwalten\", um über das Stripe-Portal erneut zu abonnieren. Ihre bisherigen Daten, Einstellungen, Vorlagen und Teamkonfigurationen sind vollständig intakt und sofort verfügbar.",
        "mockup": "resubscribe"
      }
    ]
  }
];
