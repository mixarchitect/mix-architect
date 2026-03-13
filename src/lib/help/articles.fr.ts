import type { HelpArticle } from "./types";

export const articles: HelpArticle[] = [
  {
    "id": "getting-started-overview",
    "title": "Bienvenue sur Mix Architect",
    "category": "getting-started",
    "summary": "Un aperçu rapide de la plateforme : votre tableau de bord, vos sorties, vos morceaux et vos outils de collaboration.",
    "tags": [
      "overview",
      "intro",
      "dashboard",
      "getting started"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Votre tableau de bord",
        "body": "Après connexion, vous arrivez sur le [Tableau de bord](/app). Il affiche toutes vos sorties dans une grille responsive, triées par activité la plus récente. Chaque carte de sortie affiche sa pochette, son titre, le nom de l'artiste, un point de statut (coloré pour Brouillon, En cours ou Prêt), une pastille de type de sortie (Single, EP ou Album), une pastille de format (Stéréo, Dolby Atmos ou Stéréo + Atmos) et un décompte de morceaux comme « 1 sur 6 morceaux briefés ». Si le [suivi des paiements](/app/settings) est activé, vous verrez également des statistiques de paiement en haut : Impayé, Perçu et Total des honoraires pour toutes les sorties, avec un lien « Tout voir » vers la page [Paiements](/app/payments). Utilisez l'icône épingle sur n'importe quelle carte de sortie pour l'épingler en haut de votre tableau de bord, et le menu trois points pour les actions rapides. Le menu déroulant de tri vous permet d'ordonner les sorties par Dernière modification, Titre ou Date de création.",
        "mockup": "dashboard"
      },
      {
        "heading": "Vue grille vs vue chronologique",
        "body": "L'en-tête du tableau de bord comporte deux boutons de basculement d'affichage : Grille et Chronologie. La vue Grille (par défaut) affiche vos sorties sous forme de cartes dans une grille responsive. La vue Chronologie organise les sorties chronologiquement selon leurs dates de sortie cibles, affichant les comptes à rebours et les informations de planification. Votre préférence d'affichage est sauvegardée automatiquement. En savoir plus dans [Utiliser la vue chronologique](/app/help?article=timeline-overview)."
      },
      {
        "heading": "Naviguer dans l'application",
        "body": "La barre latérale (bureau) ou la barre inférieure (mobile) vous donne un accès rapide à toutes les sections de l'application : [Tableau de bord](/app) pour vos sorties, Recherche (ou Cmd+K / Ctrl+K) pour accéder instantanément à n'importe quelle sortie ou morceau, [Modèles](/app/templates) pour les préréglages de sortie réutilisables, [Paiements](/app/payments) pour le suivi des honoraires (si activé), [Paramètres](/app/settings) pour votre profil, vos valeurs par défaut et votre abonnement, et [Aide](/app/help) pour la documentation. La barre latérale inclut également les Notifications pour les mises à jour d'activité, Auto pour les fonctionnalités d'automatisation et Déconnexion. Le changement de thème entre les modes Clair, Sombre et Système est disponible dans [Paramètres](/app/settings) sous Apparence.",
        "tip": "Appuyez sur Cmd+K (Mac) ou Ctrl+K (Windows) depuis n'importe où dans l'application pour rechercher instantanément et accéder à n'importe quelle sortie ou morceau.",
        "mockup": "nav-rail"
      },
      {
        "heading": "Concepts clés",
        "body": "Les sorties sont vos projets de niveau supérieur (albums, EP ou singles). Chaque sortie contient un ou plusieurs morceaux. Sur bureau, la page de détail de sortie a une mise en page à deux colonnes : la liste des morceaux à gauche et une barre latérale d'inspecteur à droite montrant la pochette, les Infos de sortie (artiste, type, format, statut, date cible, genre), la Direction de mix globale, les Références globales et le statut de Paiement. Chaque morceau a six onglets : Intention, Spécifications, Audio, Distribution, Portail et Notes. Cliquez sur l'icône d'engrenage dans l'en-tête de sortie pour ouvrir les Paramètres de sortie, où vous pouvez modifier toutes les métadonnées, gérer votre équipe et configurer le paiement. L'en-tête comporte également des boutons pour le basculement du Portail (avec un lien pour ouvrir le portail), Sauvegarder comme modèle et l'engrenage des paramètres.",
        "mockup": "key-concepts"
      }
    ]
  },
  {
    "id": "create-first-release",
    "title": "Créer votre première sortie",
    "category": "getting-started",
    "summary": "Guide étape par étape pour créer une sortie, ajouter une pochette, télécharger des morceaux et définir votre statut.",
    "tags": [
      "create",
      "release",
      "new project",
      "setup"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Créer une nouvelle sortie",
        "body": "Depuis le [Tableau de bord](/app), cliquez sur le bouton « + Nouvelle sortie » en haut à droite. Si vous avez sauvegardé des [modèles](/app/templates), un sélecteur de modèles s'affiche en premier où vous pouvez choisir un modèle ou cliquer sur « Commencer à zéro ». Le formulaire de création demande un titre, un nom d'artiste/client optionnel, un type de sortie (Single, EP ou Album), un format (Stéréo, Dolby Atmos ou Stéréo + Atmos), des étiquettes de genre (choisissez parmi les suggestions comme Rock, Pop, Hip-Hop, Electronic, etc. ou ajoutez les vôtres) et une date de sortie cible.",
        "tip": "Quand vous créez un Single, un morceau est automatiquement créé avec le titre de la sortie et vos spécifications par défaut des [Paramètres](/app/settings) appliquées.",
        "mockup": "create-release"
      },
      {
        "heading": "La page de détail de sortie",
        "body": "Après création, vous arrivez sur la page de détail de sortie. Sur bureau, elle a une mise en page à deux colonnes : la liste des morceaux à gauche avec un bouton « Flow » et un bouton « + Ajouter morceau », et une barre latérale d'inspecteur à droite. La barre latérale d'inspecteur montre la pochette, les Infos de sortie (Artiste, Type, Format, Statut, Date cible, Genre), la Direction de mix globale (cliquez sur l'icône crayon pour mettre à jour) et les Références globales (cliquez sur « + Ajouter » pour rechercher et ajouter des morceaux de référence). Si le suivi des paiements est activé, la section Paiement apparaît en bas de la barre latérale. Pour ajouter ou changer la pochette, cliquez sur l'icône crayon sur l'illustration dans la barre latérale. Cela révèle des options sous l'image : un bouton Télécharger pour choisir un fichier, un bouton Supprimer (si une illustration existe déjà) et un champ « Ou coller une URL » pour lier une image directement. Les nouvelles sorties montrent une zone de téléchargement en pointillés avec « Cliquer pour télécharger » (JPEG ou PNG, min 1400x1400). Pour modifier d'autres métadonnées de sortie, cliquez sur l'icône d'engrenage dans l'en-tête pour ouvrir les Paramètres de sortie.",
        "mockup": "cover-art-upload"
      },
      {
        "heading": "Ajouter des morceaux",
        "body": "Dans la vue de détail de sortie, cliquez sur « + Ajouter morceau » dans l'en-tête à côté du bouton Flow. Donnez un titre à votre morceau et il sera créé avec vos spécifications par défaut des [Paramètres](/app/settings) appliquées. Chaque morceau apparaît dans la liste avec un numéro, un titre, un aperçu d'intention, un point de statut et un badge d'approbation. Vous pouvez faire glisser les morceaux pour les réordonner en utilisant la poignée de préhension à gauche, ou utiliser les boutons monter/descendre. Supprimez les morceaux avec l'icône corbeille à droite. Cliquez sur n'importe quel morceau pour l'ouvrir et commencer à travailler dans ses six onglets.",
        "mockup": "track-upload"
      },
      {
        "heading": "Définir le statut de sortie",
        "body": "Chaque sortie a un statut : Brouillon, En cours ou Prêt. Vous pouvez changer le statut depuis la barre latérale d'inspecteur en cliquant sur le badge de statut à côté de « Statut » dans la section Infos de sortie, ou depuis les Paramètres de sortie (icône d'engrenage). Une sortie passe automatiquement à En cours une fois que le travail a commencé dessus (par exemple, téléchargement d'audio ou ajout de morceaux). La couleur du badge de statut apparaît sur vos cartes de sortie du [Tableau de bord](/app) (orange pour Brouillon, bleu pour En cours, vert pour Prêt) et est visible à tous les collaborateurs et dans le portail client.",
        "mockup": "release-status"
      }
    ]
  },
  {
    "id": "invite-collaborators",
    "title": "Inviter des collaborateurs à une sortie",
    "category": "getting-started",
    "summary": "Partagez votre sortie avec les membres de l'équipe et les clients externes en utilisant les rôles et le portail.",
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
        "heading": "Envoyer des invitations",
        "body": "Ouvrez une sortie et cliquez sur l'icône d'engrenage dans l'en-tête pour aller aux Paramètres de sortie. Faites défiler vers le bas après les métadonnées de sortie jusqu'à la section Équipe en bas. Saisissez l'adresse email de la personne que vous voulez inviter, sélectionnez son rôle dans le menu déroulant (Collaborateur ou Client), et cliquez sur « Inviter ». Elle recevra un email avec un lien pour rejoindre la sortie. Les membres actifs de l'équipe apparaissent sous le formulaire d'invitation avec leur email, badge de rôle, statut et un bouton de suppression pour les retirer.",
        "mockup": "invite-collaborator"
      },
      {
        "heading": "Rôles Collaborateur vs Client",
        "body": "Il y a deux rôles. Les Collaborateurs ont un accès complet pour voir et modifier tout le contenu de sortie : morceaux, intention, spécifications, audio, notes, métadonnées de distribution et paramètres de sortie. Les Clients ont un accès en lecture seule via le portail client et peuvent donner des retours via les commentaires, approuver ou demander des modifications sur des morceaux individuels, et télécharger des fichiers audio si autorisé. Le badge de rôle est affiché à côté de l'email de chaque membre de l'équipe dans la section Équipe.",
        "mockup": "collaborator-roles"
      },
      {
        "heading": "Accepter les invitations",
        "body": "Quand quelqu'un clique sur le lien d'invitation et rejoint la sortie, il apparaît dans la liste Équipe avec son badge de rôle et le statut « Actif ». Vous recevrez une notification dans l'application vous informant qu'il a rejoint. Les invités qui n'ont pas de compte Mix Architect seront invités à en créer un quand ils cliqueront sur le lien d'invitation.",
        "tip": "Vous pouvez retirer un membre de l'équipe à tout moment en cliquant sur l'icône corbeille à côté de son nom dans la section Équipe des Paramètres de sortie.",
        "mockup": "accept-invitation"
      },
      {
        "heading": "Partage du portail client",
        "body": "Pour les parties prenantes externes qui ont besoin de réviser sans se connecter, activez le portail client depuis l'en-tête de la page de détail de sortie. Cliquez sur le basculement Portail pour l'activer (le basculement devient vert quand actif), puis utilisez l'icône lien à côté du basculement pour copier l'URL de partage unique. Le portail fournit un accès en lecture seule au brief de sortie, à la liste des morceaux, à la lecture audio et aux commentaires. Vous pouvez configurer exactement ce qui est visible en utilisant les paramètres du portail : direction de mix, spécifications, références, statut de paiement, infos de distribution et paroles. Pour le contrôle par morceau, utilisez l'onglet Portail sur chaque morceau.",
        "mockup": "portal-sharing"
      }
    ]
  },
  {
    "id": "track-tabs",
    "title": "Détail du morceau : Comprendre les onglets",
    "category": "releases",
    "summary": "Chaque morceau a six onglets pour gérer tous les aspects de votre mix : Intention, Spécifications, Audio, Distribution, Portail et Notes.",
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
        "heading": "Intention",
        "body": "L'onglet Intention est où vous décrivez la vision créative d'un morceau. En haut se trouve une zone de texte libre sous « À quoi ce morceau devrait-il ressembler ? » où vous pouvez écrire la direction de mix (cliquez sur « Modifier » pour changer). En dessous, la section Qualités émotionnelles vous permet de taguer le morceau avec des mots descriptifs : les tags sélectionnés apparaissent comme des pastilles pleines (ex. spacieux, chaud, percutant, nostalgique), et les suggestions disponibles apparaissent comme des pastilles contour que vous pouvez cliquer pour ajouter (agressif, intime, granuleux, poli, sombre, brillant, brut, luxuriant, rêveur, lo-fi, cinématique, minimal, dense, éthéré, hypnotique, euphorique, mélancolique, organique, synthétique, chaotique, lisse, hanté, ludique, hymne, délicat, lourd, aérien). La section Anti-références en bas vous permet de décrire les sons ou approches que vous voulez éviter. Dans la barre latérale droite, l'Aperçu rapide montre le statut du morceau, la qualité audio (fréquence d'échantillonnage / profondeur de bits) et le format en un coup d'œil. En dessous, la section Références vous permet de rechercher et d'ajouter des morceaux de référence (depuis Apple Music) avec des notes optionnelles décrivant ce qu'il faut référencer de chacun.",
        "mockup": "track-tab-intent"
      },
      {
        "heading": "Spécifications",
        "body": "L'onglet Spécifications contient les spécifications techniques de votre morceau. La section Paramètres techniques a trois menus déroulants : Format (Stéréo, Dolby Atmos ou Stéréo + Atmos), Fréquence d'échantillonnage (44,1kHz, 48kHz, 88,2kHz, 96kHz) et Profondeur de bits (16-bit, 24-bit, 32-bit float). Ces valeurs sont des métadonnées de référence décrivant l'audio source et sont utilisées comme défauts pour les nouveaux morceaux créés depuis des modèles, elles ne sont pas utilisées pour contrôler la sortie de conversion. En dessous, la section Livraison gère vos formats de sortie. Sélectionnez quels formats doivent être disponibles en cliquant sur les puces de format : les formats convertibles incluent WAV, AIFF, FLAC, MP3, AAC, OGG et ALAC. Les formats non-convertibles (DDP, ADM BWF/Atmos, MQA) peuvent être sélectionnés pour référence mais montrent une info-bulle expliquant qu'ils ne peuvent pas être auto-convertis. Les formats sélectionnés apparaissent surlignés en vert avec une coche. Utilisez le menu déroulant « Exporter depuis » pour choisir quelle version audio convertir (ex. « v3 - Typical Wonderful 2025-10-10 MGO.wav (dernière) »). Cliquez sur l'icône flèche de téléchargement à côté de tout format convertible sélectionné pour démarrer une conversion. Vous pouvez aussi taper un nom de format personnalisé dans le champ « Format personnalisé... » et cliquer sur « + Ajouter ». En bas, la zone de texte Exigences spéciales vous permet de noter toute instruction spécifique à la livraison.",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Audio",
        "body": "L'onglet Audio est où vous téléchargez des fichiers, gérez les versions et lisez l'audio. L'en-tête montre le nom de la sortie et du morceau avec la pochette d'album. Le sélecteur de version (v1, v2, v3, etc.) vous permet de basculer entre les révisions, cliquez sur le bouton + pour télécharger une nouvelle version. Chaque version affiche son numéro de version, sa date de téléchargement, son nombre de commentaires et un bouton de téléchargement. La visualisation de forme d'onde montre l'audio avec une lecture interactive : cliquez n'importe où pour naviguer, et utilisez les contrôles de transport en dessous (boucle, reculer, lecture/pause, avancer, répéter). La mesure de volume LUFS est affichée à côté des métadonnées du fichier (format, fréquence d'échantillonnage, profondeur de bits), codée en couleur par rapport aux cibles de volume. La section Retours sous la forme d'onde montre tous les commentaires horodatés pour la version actuelle. Double-cliquez n'importe où sur la forme d'onde pour ajouter un nouveau commentaire à ce timecode. Les marqueurs de commentaire apparaissent comme de petites icônes sur la forme d'onde à leurs positions respectives.",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "Analyse de volume (LUFS)",
        "body": "Quand vous téléchargez de l'audio, Mix Architect mesure automatiquement le volume intégré en LUFS (Loudness Units Full Scale). Cliquez sur la lecture LUFS à côté des métadonnées de version pour développer le panneau d'Analyse de volume. Celui-ci montre comment chaque service de streaming majeur, standard de diffusion et plateforme sociale ajustera votre morceau pendant la lecture. Chaque ligne affiche le nom de la plateforme, son volume cible (ex. Spotify cible -14 LUFS) et le changement de gain qui serait appliqué à votre fichier. Une valeur positive signifie que le service augmentera votre morceau, une valeur négative (montrée en orange) signifie qu'il sera baissé. Par exemple, si votre mix mesure -14,9 LUFS, Spotify appliquerait +0,9 dB alors qu'Apple Music (cible -16) appliquerait -1,1 dB. Le panneau est groupé en Streaming (Spotify, Apple Music, YouTube, Tidal, Amazon Music, Deezer, Qobuz, Pandora), Diffusion (EBU R128, ATSC A/85, ITU-R BS.1770) et Social (Instagram/Reels, TikTok, Facebook). Utilisez ceci pour vérifier si votre master sera significativement altéré sur une plateforme avant livraison.",
        "mockup": "track-tab-lufs"
      },
      {
        "heading": "Distribution",
        "body": "L'onglet Distribution capture toutes les métadonnées nécessaires pour la distribution digitale. Il inclut trois sections divisées, chacune avec des boutons « + Ajouter personne » : Répartition d'écriture (nom de la personne, pourcentage, affiliation PRO comme ASCAP/BMI, numéro de compte membre et numéro IPI d'auteur), Répartition d'édition (nom de l'éditeur, pourcentage, ID membre éditeur et IPI éditeur), et Répartition d'enregistrement master (nom de l'entité et pourcentage). Le total courant pour chaque section de répartition est montré en vert quand il égale 100% ou orange quand ce n'est pas le cas. En dessous des répartitions : Codes et identifiants (champs ISRC et ISWC), Crédits (noms du producteur et compositeur/parolier), Propriétés du morceau (artiste en featuring, sélecteur de langue, bascules pour paroles explicites, instrumental et reprise), Copyright (numéro d'enregistrement et date de copyright), et Paroles (zone de texte paroles complètes).",
        "mockup": "track-tab-distribution"
      },
      {
        "heading": "Portail",
        "body": "L'onglet Portail contrôle comment les clients interagissent avec ce morceau spécifique. En haut, la section Approbation client montre le statut d'approbation actuel (ex. « Approuvé » en vert) avec un historique horodaté de tous les événements d'approbation : approuvé, modifications demandées (avec la note du client), rouvert pour révision et re-approuvé, chacun avec des dates. En dessous, Visibilité du portail du morceau vous permet de basculer si ce morceau est visible sur le portail, si les téléchargements sont activés, et quelles versions audio spécifiques (Version 1, Version 2, Version 3, etc.) le client peut accéder, chacune avec sa propre bascule. Une note en bas vous rappelle que l'activation du portail et le lien de partage peuvent être trouvés dans l'en-tête de la page de sortie.",
        "mockup": "track-tab-portal"
      },
      {
        "heading": "Notes",
        "body": "L'onglet Notes est un espace polyvalent pour les notes de révision et la discussion qui n'est pas liée à un timecode spécifique. En haut se trouve une zone de texte avec le placeholder « Ajouter une note... » et un bouton « Publier ». Les notes apparaissent en dessous en ordre chronologique inverse. Chaque note montre le nom de l'auteur, une date ou un temps relatif, et le message. Les notes client sont visuellement distinguées avec un badge vert « Client » pour que vous puissiez différencier les retours internes des retours externes en un coup d'œil. Utilisez cet onglet pour les directions de révision générales, les éléments à faire et la discussion qui n'a pas besoin de référencer un moment spécifique dans l'audio. Pour les retours spécifiques au temps, utilisez plutôt les commentaires de forme d'onde de l'onglet Audio.",
        "mockup": "track-tab-notes"
      }
    ]
  },
  {
    "id": "client-portal",
    "title": "Portail client et approbations",
    "category": "releases",
    "summary": "Partagez votre sortie avec les clients via un lien unique, contrôlez ce qu'ils voient et suivez les approbations par morceau.",
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
        "heading": "Activer le portail",
        "body": "Sur la page de détail de sortie, cherchez le basculement Portail dans la zone d'en-tête (en haut à droite). Cliquez sur le basculement pour l'activer (il devient vert quand actif). Une fois actif, cliquez sur l'icône lien à côté du basculement pour copier l'URL de partage unique. Envoyez ce lien à votre client pour un accès de révision sans nécessiter de compte Mix Architect. Le portail montre le brief de sortie, la liste des morceaux, les lecteurs audio et un système de commentaires. Utilisez les paramètres du portail pour contrôler quelles sections au niveau de la sortie sont visibles aux clients : direction de mix, spécifications, références, statut de paiement, métadonnées de distribution et paroles.",
        "mockup": "portal-settings"
      },
      {
        "heading": "Visibilité par morceau",
        "body": "Pour chaque morceau, allez à l'onglet Portail pour contrôler ce que votre client peut voir. La section Visibilité du portail du morceau a des bascules pour : « Visible sur le portail » (montrer ou cacher le morceau entier), « Activer le téléchargement » (autoriser ou bloquer les téléchargements audio), et des bascules de version individuelles (Version 1, Version 2, Version 3, etc.) pour contrôler quelles révisions audio le client peut accéder. Cela vous donne un contrôle fin pour que vous puissiez cacher les travaux en cours et ne partager que les mix finis. Toutes les bascules sont indépendantes, vous pouvez donc rendre un morceau visible mais désactiver les téléchargements, ou ne montrer que la dernière version.",
        "mockup": "portal-track-visibility"
      },
      {
        "heading": "Approbations de morceaux",
        "body": "Les clients peuvent approuver ou demander des modifications sur des morceaux individuels via le portail. Le statut d'approbation est suivi dans la section Approbation client de l'onglet Portail de chaque morceau. Le statut montre un badge coloré (ex. vert « Approuvé ») avec un historique complet horodaté de chaque événement d'approbation : quand le client a approuvé, quand il a demandé des modifications (incluant sa note, comme « Voix trop basses »), quand le morceau a été rouvert pour révision, et quand il a été re-approuvé. Cela vous donne une trace d'audit claire de toutes les décisions client. Les badges d'approbation apparaissent aussi sur la liste des morceaux dans la page de détail de sortie, pour que vous puissiez voir en un coup d'œil quels morceaux sont approuvés.",
        "mockup": "portal-approval"
      }
    ]
  },
  {
    "id": "templates",
    "title": "Utiliser les modèles de sortie",
    "category": "releases",
    "summary": "Gagnez du temps en créant des sorties depuis des modèles réutilisables avec des spécifications et paramètres pré-configurés.",
    "tags": [
      "templates",
      "reuse",
      "workflow",
      "presets"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Ce que les modèles incluent",
        "body": "Un modèle capture un ensemble complet de défauts de sortie à travers six sections repliables. Bases : nom du modèle, description, une case à cocher « Définir comme modèle par défaut » (auto-sélectionnée pour les nouvelles sorties), et nom et email d'artiste/client. Paramètres de sortie : type de sortie (Single, EP ou Album), format (Stéréo, Dolby Atmos ou Stéréo + Atmos) et étiquettes de genre. Spécifications techniques : fréquence d'échantillonnage, profondeur de bits, sélections de format de livraison (WAV, AIFF, FLAC, MP3, AAC, OGG, DDP, ADM BWF/Atmos, MQA, ALAC) et exigences spéciales. Défauts d'intention : tags de qualité émotionnelle pré-sélectionnés pour les nouveaux morceaux. Métadonnées de distribution : distributeur, label, détenteur de copyright, langue, genre principal et contacts droits et édition. Défauts de paiement : statut de paiement, devise et notes de paiement. Quand vous créez une sortie depuis un modèle, tous ces défauts sont appliqués automatiquement.",
        "mockup": "template-contents"
      },
      {
        "heading": "Créer et gérer les modèles",
        "body": "Il y a deux façons de créer un modèle. Depuis n'importe quelle page de détail de sortie, cliquez sur le bouton « Sauvegarder comme modèle » dans l'en-tête (à côté de l'engrenage des paramètres) pour capturer la configuration actuelle de cette sortie. Ou allez à la page [Modèles](/app/templates) et cliquez sur « + Nouveau modèle » pour en construire un à zéro en utilisant le formulaire de modèle complet. Chaque carte de modèle sur la page [Modèles](/app/templates) montre son nom, sa description et une ligne de résumé comme « Single, Stéréo + Atmos, 96 kHz / 24-bit, 4 formats de livraison ». Utilisez le menu trois points sur n'importe quelle carte de modèle pour des options comme éditer ou supprimer. Donnez aux modèles des noms descriptifs comme « Master Stéréo » ou « EP Atmos » pour les garder organisés.",
        "mockup": "template-create"
      },
      {
        "heading": "Créer une sortie depuis un modèle",
        "body": "Lors de la création d'une nouvelle sortie depuis le [Tableau de bord](/app), si vous avez des modèles sauvegardés, un sélecteur « Commencer depuis un modèle » est montré comme première étape. Il dit « Pré-remplir les paramètres de votre sortie, ou commencer à zéro. » Sélectionnez une carte de modèle et cliquez sur « Utiliser le modèle » pour pré-remplir le nouveau formulaire de sortie avec ces paramètres, ou cliquez sur « Commencer à zéro » pour passer. Le formulaire de création de sortie a aussi un lien « Changer de modèle » en bas si vous voulez changer. Tous les paramètres de modèle peuvent être personnalisés après que la sortie soit créée.",
        "tip": "Marquez votre modèle le plus utilisé comme défaut (case « Définir comme modèle par défaut ») pour qu'il soit auto-sélectionné chaque fois que vous créez une nouvelle sortie.",
        "mockup": "template-use"
      }
    ]
  },
  {
    "id": "payment-tracking",
    "title": "Suivi des paiements",
    "category": "releases",
    "summary": "Suivez les honoraires, paiements et soldes impayés à travers vos sorties.",
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
        "heading": "Activer le suivi des paiements",
        "body": "Allez aux [Paramètres](/app/settings) et trouvez la section Suivi des paiements. La section dit : « Suivre les honoraires et statut de paiement sur les sorties et morceaux. Désactivez ceci si vous mixez vos propres projets. » Basculez « Activer le suivi des paiements » sur activé. Une fois activé, les fonctionnalités liées au paiement apparaissent dans toute l'application : stats d'honoraires sur le [Tableau de bord](/app) (Impayé, Perçu, Total des honoraires), une section Paiement dans la barre latérale d'inspecteur sur chaque sortie, et la page [Paiements](/app/payments) dans la navigation de barre latérale.",
        "mockup": "payment-dashboard"
      },
      {
        "heading": "Définir les honoraires de sortie",
        "body": "Ouvrez les Paramètres de sortie (cliquez sur l'icône d'engrenage sur n'importe quelle sortie). Faites défiler vers le bas jusqu'à la section Paiement. Définissez le Statut de paiement : Pas d'honoraires, Impayé, Partiel ou Payé. Utilisez la zone de texte Notes de paiement pour enregistrer les termes, infos d'acompte ou dates d'échéance. Le montant des honoraires et les infos de paiement sont aussi visibles dans la barre latérale d'inspecteur sur la page de détail de sortie sous le titre Paiement, où vous pouvez cliquer sur le statut pour le changer rapidement.",
        "mockup": "payment-release-fees"
      },
      {
        "heading": "Tableau de bord des paiements",
        "body": "Accédez à la page [Paiements](/app/payments) depuis la barre latérale. En haut, trois cartes de résumé montrent Impayé (total impayé), Perçu (total payé) et Total des honoraires à travers toutes les sorties, chacune avec un compte de sorties. En dessous, un tableau liste chaque sortie avec des données de paiement : nom de Sortie, Date, Artiste, Honoraires, Payé, Solde et Statut (avec des badges colorés comme « Partiel » en orange). Une ligne Total en bas additionne tous les honoraires. Utilisez le bouton « Exporter CSV » pour télécharger les données de paiement comme feuille de calcul, ou « Télécharger PDF » pour générer un résumé de paiement prêt à imprimer.",
        "tip": "Cliquez sur les cartes de stats Impayé ou Perçu sur le [Tableau de bord](/app) pour filtrer rapidement vers les sorties correspondant à ce statut de paiement.",
        "mockup": "payment-track-fees"
      }
    ]
  },
  {
    "id": "upload-audio-tracks",
    "title": "Télécharger et gérer l'audio",
    "category": "audio",
    "summary": "Comment télécharger des fichiers audio, gérer les versions et utiliser le lecteur de forme d'onde.",
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
        "heading": "Télécharger de l'audio",
        "body": "Ouvrez n'importe quel morceau et allez à l'onglet Audio. Cliquez sur la zone de téléchargement ou glissez-déposez un fichier directement dessus. Formats supportés : WAV, AIFF, FLAC, MP3, AAC et M4A, jusqu'à 500 Mo par fichier. Le fichier est téléchargé vers un stockage cloud sécurisé, et une visualisation de forme d'onde est générée automatiquement. Les métadonnées du fichier (format, fréquence d'échantillonnage, profondeur de bits, durée) sont capturées et affichées sous les infos de version, par exemple : « Typical Wonderful 2025-10-10 MGO.wav, WAV, 48kHz, 24-bit ».",
        "mockup": "audio-upload"
      },
      {
        "heading": "Versions de morceau",
        "body": "Chaque fois que vous téléchargez un nouveau fichier sur le même morceau, il devient la version suivante. Le sélecteur de version au-dessus de la forme d'onde montre des boutons numérotés (v1, v2, v3, etc.) plus un bouton + pour télécharger une autre version. Cliquez sur n'importe quelle version pour basculer dessus. Chaque version affiche son numéro de version, sa date de téléchargement, son nombre de commentaires et une icône de téléchargement pour télécharger le fichier original. Les versions précédentes sont entièrement préservées avec leurs propres commentaires et forme d'onde.",
        "tip": "Téléchargez les mix révisés sur le même morceau plutôt que de créer un nouveau morceau. Cela garde votre historique de version propre, préserve les commentaires sur les anciennes versions et vous permet de comparer les mix dans le temps.",
        "mockup": "track-versions"
      },
      {
        "heading": "Lecteur de forme d'onde",
        "body": "Chaque version téléchargée affiche une forme d'onde interactive. Cliquez n'importe où sur la forme d'onde pour naviguer vers cette position. Les contrôles de transport sous la forme d'onde incluent : temps actuel, bascule de boucle, reculer, lecture/pause, avancer, bascule de répétition et durée totale. Le lecteur montre aussi une mesure de volume LUFS intégré (ex. « -14,8 LUFS ») à côté des métadonnées du fichier, codée en couleur par rapport aux cibles de volume pour que vous puissiez évaluer les niveaux en un coup d'œil. S'il y a des commentaires horodatés sur la version actuelle, de petites icônes de marqueur apparaissent sur la forme d'onde à leurs positions.",
        "mockup": "track-tab-audio"
      }
    ]
  },
  {
    "id": "audio-converter",
    "title": "Formats de livraison et conversion",
    "category": "audio",
    "summary": "Configurez les formats de livraison, convertissez l'audio et intégrez automatiquement les métadonnées comme l'artiste, la pochette, l'ISRC et les paroles.",
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
        "heading": "Définir les formats de livraison",
        "body": "Ouvrez n'importe quel morceau et allez à l'onglet Spécifications. Faites défiler jusqu'à la section Livraison. Ici vous sélectionnez quels formats de sortie votre projet nécessite en cliquant sur les puces de format. Formats convertibles disponibles : WAV, AIFF, FLAC, MP3, AAC, OGG et ALAC. Les formats sélectionnés apparaissent surlignés en vert avec une icône de coche. Des formats non-convertibles additionnels (DDP, ADM BWF/Atmos, MQA) peuvent être basculés pour référence, ils affichent une info-bulle expliquant que la conversion automatique n'est pas disponible. Vous pouvez aussi taper un nom de format personnalisé dans le champ d'entrée « Format personnalisé... » et cliquer sur « + Ajouter » pour tout format non listé. Utilisez le menu déroulant « Exporter depuis » pour choisir quelle version audio convertir, comme « v3 - filename.wav (dernière) ».",
        "mockup": "format-convert"
      },
      {
        "heading": "Convertir et télécharger",
        "body": "Sélectionnez quels formats doivent être disponibles en cliquant sur les puces de format dans la section Livraison : les formats convertibles incluent WAV, AIFF, FLAC, MP3, AAC, OGG et ALAC. Les formats sélectionnés apparaissent surlignés en vert avec une coche. Cliquez sur l'icône flèche de téléchargement à côté de tout format convertible sélectionné pour démarrer une conversion. L'icône montre un spinner pendant que la conversion est en traitement en arrière-plan. Quand la conversion se termine, le fichier se télécharge automatiquement vers votre navigateur. Chaque conversion utilise la version audio que vous avez sélectionnée dans le menu déroulant « Exporter depuis », convertissant depuis le fichier original téléchargé pour préserver la qualité audio maximale. Les formats sans perte (WAV, AIFF, FLAC, ALAC) préservent la fréquence d'échantillonnage et profondeur de bits du fichier source. Les formats avec perte utilisent des préréglages optimisés : MP3 exporte à 44,1 kHz / 320 kbps, AAC à 44,1 kHz / 256 kbps et OGG à 44,1 kHz / Qualité 8.",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Intégration automatique de métadonnées",
        "body": "Quand vous convertissez vers MP3, FLAC, AAC, OGG ou ALAC, Mix Architect écrit automatiquement des tags de métadonnées standard de l'industrie dans le fichier de sortie. Cela inclut : artiste, titre, album, numéro de piste, genre, année de sortie, copyright, ISRC, UPC/code-barres, paroles, pochette et ReplayGain. ReplayGain est un tag de volume qui indique aux lecteurs compatibles de combien ajuster le volume pour que les morceaux soient lus à un niveau cohérent sans écrêtage. Mix Architect le calcule depuis les LUFS mesurés de votre audio en utilisant le standard ReplayGain 2.0 (niveau de référence de -18 LUFS). Les fichiers MP3 obtiennent des tags ID3v2, FLAC et OGG utilisent les commentaires Vorbis, et AAC/ALAC utilisent les atomes MP4 style iTunes. Toutes les métadonnées sont tirées de vos détails de sortie et morceau (incluant l'onglet Distribution pour l'ISRC et les paroles, et la pochette de sortie). Les exports WAV et AIFF n'incluent pas de tags de métadonnées. Après qu'une conversion se termine, passez la souris sur l'icône tag à côté de la puce de format pour voir exactement quels tags ont été intégrés.",
        "tip": "Remplissez votre onglet Distribution (ISRC, paroles) et téléchargez une pochette avant d'exporter. Plus vous fournissez de métadonnées, plus vos fichiers exportés seront complets pour la distribution."
      },
      {
        "heading": "Référence des formats supportés",
        "body": "Les formats sans perte préservent la qualité source : WAV (PCM, fréquence/profondeur source), AIFF (PCM, fréquence/profondeur source), FLAC (fréquence source), ALAC (fréquence source). Les formats avec perte utilisent des préréglages fixes optimisés pour la distribution : MP3 (44,1 kHz, 320 kbps, stéréo), AAC (44,1 kHz, 256 kbps, stéréo), OGG Vorbis (44,1 kHz, qualité 8, stéréo). Formats non-convertibles (tag seulement, pas d'auto-conversion) : DDP, ADM BWF (Atmos), MQA. Les Paramètres techniques (fréquence d'échantillonnage et profondeur de bits) en haut de l'onglet Spécifications sont des métadonnées de référence décrivant l'audio source, elles ne contrôlent pas la sortie de conversion. La zone de texte Exigences spéciales sous les formats de livraison vous permet d'ajouter des notes sur les instructions de livraison.",
        "warning": "Convertir depuis un format avec perte (MP3, AAC, OGG) vers un format sans perte (WAV, FLAC) n'améliore pas la qualité audio. Les artefacts de compression originaux demeurent. Téléchargez toujours votre fichier source de plus haute qualité.",
        "mockup": "supported-formats"
      }
    ]
  },
  {
    "id": "audio-review-comments",
    "title": "Laisser des commentaires horodatés",
    "category": "audio",
    "summary": "Ajoutez des retours codés temporellement directement sur la forme d'onde pour que les collaborateurs sachent exactement où écouter.",
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
        "heading": "Ajouter un commentaire",
        "body": "Ouvrez un morceau et allez à l'onglet Audio. Double-cliquez sur la forme d'onde au point exact que vous voulez référencer. Une entrée de texte apparaît dans la section Retours sous la forme d'onde où vous pouvez taper votre commentaire. Le commentaire est ancré à ce timecode et cette version. Dans la section Retours, chaque commentaire montre le nom de l'auteur, un badge d'horodatage coloré (ex. « 0:07 » ou « 1:22 »), la date relative et le texte du message. Les marqueurs de commentaire apparaissent aussi comme de petites icônes directement sur la forme d'onde à leurs positions. Cliquez sur n'importe quel horodatage pour faire sauter la tête de lecture à ce moment.",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "Commentaires du portail",
        "body": "Les clients révisant via le portail peuvent aussi laisser des commentaires horodatés sur la forme d'onde. Leurs commentaires apparaissent dans la même section Retours à côté des commentaires d'équipe mais sont visuellement distingués avec un badge « Client » pour que vous puissiez rapidement identifier les retours externes. Cela garde tous les retours, internes et externes, organisés en un endroit sous la version audio pertinente.",
        "mockup": "portal-comments"
      },
      {
        "heading": "Notes vs commentaires audio",
        "body": "L'onglet Audio est pour les retours horodatés liés à des moments spécifiques dans la forme d'onde : « monter les voix à 1:22 » ou « la caisse claire est trop forte ici ». L'onglet Notes est pour la discussion générale et les notes de révision qui ne sont pas liées à un timecode : « globalement le mix a besoin de plus de graves » ou « le client veut une approche plus agressive ». Les commentaires audio sont spécifiques à la version (liés à v1, v2, etc.), alors que les Notes s'appliquent au morceau dans son ensemble. Utilisez l'onglet Intention pour documenter la vision créative globale, les tags émotionnels et les morceaux de référence.",
        "tip": "Pour une image complète des retours sur un morceau, vérifiez à la fois la section Retours de l'onglet Audio (pour les notes spécifiques au temps) et l'onglet Notes (pour la discussion générale). Les retours client peuvent apparaître dans les deux endroits.",
        "mockup": "resolve-feedback"
      }
    ]
  },
  {
    "id": "timeline-overview",
    "title": "Utiliser la vue chronologique",
    "category": "timeline",
    "summary": "Basculez vers la vue chronologique sur votre tableau de bord pour visualiser les plannings de sortie et le compte à rebours vers les dates de sortie.",
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
        "heading": "Basculer vers la vue chronologique",
        "body": "Sur le [Tableau de bord](/app), cherchez les deux boutons de basculement de vue dans la zone d'en-tête (sous les stats de paiement). Cliquez sur l'icône chronologique (le second bouton) pour basculer de la vue grille vers la vue chronologique. La chronologie affiche vos sorties chronologiquement selon leurs dates de sortie cibles. Les sorties sans date cible apparaissent dans une section « Non planifiées » séparée en bas. Votre préférence de vue est sauvegardée automatiquement, le tableau de bord se souviendra donc de votre choix la prochaine fois que vous visitez.",
        "mockup": "timeline-full"
      },
      {
        "heading": "Lire la chronologie",
        "body": "Chaque sortie apparaît comme une carte positionnée par sa date de sortie cible. La chronologie montre un compte à rebours : « X jours jusqu'à la sortie » pour les dates à venir ou « Sorti il y a X jours » pour les dates passées. Les cartes de sortie affichent les mêmes infos que la vue grille (titre, artiste, statut, format, nombre de morceaux) plus le contexte de planification. Les points de statut sont codés couleur : orange pour Brouillon, bleu pour En cours et vert pour Prêt. Les sorties épinglées apparaissent en haut de la chronologie.",
        "mockup": "timeline-navigate"
      },
      {
        "heading": "Définir les dates cibles",
        "body": "Pour ajouter une sortie à la chronologie, définissez une date de sortie cible soit lors de la création de la sortie soit dans les Paramètres de sortie (icône d'engrenage sur la page de sortie). Le champ Date de sortie cible utilise un sélecteur de date. La chronologie se met à jour automatiquement quand vous ajustez les dates. Cela vous aide à visualiser votre planning et éviter les fenêtres de sortie qui se chevauchent à travers plusieurs projets.",
        "tip": "Utilisez la vue chronologique pendant la planification pour espacer vos sorties. Avoir une visibilité claire des échéances à venir aide à prévenir les goulots d'étranglement dans votre workflow de mix, mastering ou distribution.",
        "mockup": "timeline-dates"
      }
    ]
  },
  {
    "id": "export-data",
    "title": "Exporter les données de votre compte",
    "category": "account",
    "summary": "Téléchargez un export ZIP complet de vos sorties, morceaux, fichiers audio et enregistrements de paiement.",
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
        "heading": "Ce qui est inclus",
        "body": "L'export de données est un fichier ZIP contenant toutes vos métadonnées de sortie, détails de morceau, fichiers audio (toutes versions) et enregistrements de paiement. Avant téléchargement, l'application montre une estimation de la taille d'export avec les comptes : nombre de sorties, morceaux et fichiers audio inclus. Cela vous donne une sauvegarde complète de tout dans votre compte.",
        "mockup": "export-contents"
      },
      {
        "heading": "Démarrer un export",
        "body": "Allez aux [Paramètres](/app/settings) et faites défiler vers la section « Vos données ». Cliquez sur « Exporter mes données » pour commencer. L'application calcule d'abord une estimation montrant la taille approximative du fichier et les comptes (ex. « 3 sorties, 12 morceaux, 8 fichiers audio »). Révisez l'estimation, puis cliquez sur « Télécharger » pour démarrer l'export. Une barre de progression montre le statut du téléchargement. Pour les gros comptes avec beaucoup de fichiers audio, l'export peut prendre du temps. Le fichier ZIP se télécharge automatiquement vers votre navigateur quand terminé. Vous pouvez cliquer sur « Annuler » pour revenir en arrière sans télécharger.",
        "mockup": "export-progress"
      },
      {
        "heading": "Confidentialité des données",
        "body": "Votre export contient seulement les données que vous possédez ou avez créées. Les contributions de collaborateurs (comme les commentaires sur vos sorties) sont incluses, mais les données privées des autres utilisateurs ne le sont pas. L'export est généré à la demande et n'est pas stocké sur nos serveurs après téléchargement.",
        "tip": "Lancez un export de données périodiquement comme sauvegarde de vos projets et fichiers audio. C'est particulièrement utile avant de faire des changements majeurs à votre compte.",
        "mockup": "export-privacy"
      }
    ]
  },
  {
    "id": "manage-subscription",
    "title": "Gérer votre abonnement Pro",
    "category": "billing",
    "summary": "Consultez votre plan, mettez à jour les détails de paiement et gérez votre abonnement Pro via Stripe.",
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
        "heading": "Voir votre plan",
        "body": "Allez aux [Paramètres](/app/settings) et faites défiler vers la section Abonnement en bas. La section dit « Gérez votre plan Mix Architect. » Vous verrez votre plan actuel : les comptes Pro affichent « 14$/mois, Sorties illimitées » avec un badge vert « PRO » et un bouton « Gérer la facturation ». Les comptes gratuits montrent un bouton « Passer à Pro » à la place.",
        "mockup": "plan-current"
      },
      {
        "heading": "Passer à Pro",
        "body": "Depuis la page [Paramètres](/app/settings), cliquez sur « Passer à Pro » dans la section Abonnement. Vous serez amené vers une page de paiement Stripe sécurisée. Une fois le paiement confirmé, votre compte est mis à niveau immédiatement et vous accédez à toutes les fonctionnalités Pro, incluant les sorties illimitées et la conversion audio. Le badge Pro apparaît à côté de vos infos de plan.",
        "mockup": "upgrade-pro"
      },
      {
        "heading": "Gérer le paiement",
        "body": "Cliquez sur « Gérer la facturation » dans la section Abonnement des [Paramètres](/app/settings) pour ouvrir le portail de facturation Stripe. De là vous pouvez mettre à jour votre méthode de paiement, voir les factures et télécharger les reçus. Tout le traitement de paiement est géré de manière sécurisée par Stripe.",
        "mockup": "manage-payment"
      }
    ]
  },
  {
    "id": "cancel-resubscribe",
    "title": "Annuler et se réabonner",
    "category": "billing",
    "summary": "Comment annuler votre abonnement Pro et ce qui arrive à vos données.",
    "tags": [
      "cancel",
      "resubscribe",
      "downgrade",
      "billing"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Annuler votre abonnement",
        "body": "Cliquez sur « Gérer la facturation » dans la section Abonnement des [Paramètres](/app/settings) pour ouvrir le portail Stripe, puis cliquez sur « Annuler le plan ». Votre accès Pro continue jusqu'à la fin de votre période de facturation actuelle. Un avis dans les [Paramètres](/app/settings) montrera quand votre plan Pro expire pour que vous sachiez exactement combien de temps dure votre accès.",
        "mockup": "cancel-subscription"
      },
      {
        "heading": "Ce qui arrive à vos données",
        "body": "Toutes vos sorties, morceaux, fichiers audio, commentaires et enregistrements de paiement sont entièrement préservés. Vous ne perdez rien en rétrogradant. Cependant, les fonctionnalités Pro (comme les sorties illimitées et la conversion audio) deviendront indisponibles jusqu'à ce que vous vous réabonniez. Vos sorties existantes restent accessibles.",
        "warning": "Les comptes gratuits sont limités à une sortie active. Si vous avez plus d'une sortie quand votre plan Pro expire, vos sorties existantes sont préservées mais vous ne pourrez pas créer de nouvelles sorties jusqu'à ce que vous vous réabonniez ou réduisiez à une sortie.",
        "mockup": "data-after-cancel"
      },
      {
        "heading": "Se réabonner",
        "body": "Pour réactiver Pro, allez à la section Abonnement dans les [Paramètres](/app/settings) et cliquez sur « Passer à Pro » à nouveau, ou utilisez « Gérer la facturation » pour vous réabonner via le portail Stripe. Vos données précédentes, paramètres, modèles et configurations d'équipe sont tous intacts et immédiatement disponibles.",
        "mockup": "resubscribe"
      }
    ]
  }
];
