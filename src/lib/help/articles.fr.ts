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
        "body": "Les sorties sont vos projets de niveau supérieur (albums, EP ou singles). Chaque sortie contient un ou plusieurs morceaux. Sur bureau, la page de détail de sortie a une mise en page à deux colonnes : la liste des morceaux à gauche et une barre latérale d'inspecteur à droite montrant la pochette, les Infos de sortie (artiste, type, format, statut, date cible, genre), la Direction de mix globale, les Références globales et le statut de Paiement. Chaque morceau a quatre onglets : Brief, Audio, Delivery et Notes. Cliquez sur l'icône d'engrenage dans l'en-tête de sortie pour ouvrir les Paramètres de sortie, où vous pouvez modifier toutes les métadonnées, gérer votre équipe et configurer le paiement. L'en-tête comporte également des boutons pour le basculement du Portail (avec un lien pour ouvrir le portail), Sauvegarder comme modèle et l'engrenage des paramètres.",
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
        "body": "Dans la vue de détail de sortie, cliquez sur « + Ajouter morceau » dans l'en-tête à côté du bouton Flow. Donnez un titre à votre morceau et il sera créé avec vos spécifications par défaut des [Paramètres](/app/settings) appliquées. Chaque morceau apparaît dans la liste avec un numéro, un titre, un aperçu d'intention, un point de statut et un badge d'approbation. Vous pouvez faire glisser les morceaux pour les réordonner en utilisant la poignée de préhension à gauche, ou utiliser les boutons monter/descendre. Supprimez les morceaux avec l'icône corbeille à droite. Cliquez sur n'importe quel morceau pour l'ouvrir et commencer à travailler dans ses quatre onglets.",
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
        "body": "Pour les parties prenantes externes qui ont besoin de réviser sans se connecter, activez le portail client depuis l'en-tête de la page de détail de sortie. Cliquez sur le basculement Portail pour l'activer (le basculement devient vert quand actif), puis utilisez l'icône lien à côté du basculement pour copier l'URL de partage unique. Le portail fournit un accès en lecture seule au brief de sortie, à la liste des morceaux, à la lecture audio et aux commentaires. Vous pouvez configurer exactement ce qui est visible en utilisant les paramètres du portail : direction de mix, spécifications, références, statut de paiement, infos de distribution et paroles. Pour le contrôle par morceau, utilisez l'onglet Delivery sur chaque morceau.",
        "mockup": "portal-sharing"
      }
    ]
  },
  {
    "id": "track-tabs",
    "title": "Détail du morceau : Comprendre les onglets",
    "category": "releases",
    "summary": "Chaque morceau a quatre onglets pour gérer tous les aspects de votre mix : Brief, Audio, Delivery et Notes.",
    "tags": [
      "tracks",
      "tabs",
      "intent",
      "specs",
      "audio",
      "distribution",
      "portal",
      "notes",
      "lufs",
      "true peak",
      "qualité",
      "volume"
    ],
    "updatedAt": "2026-04-15",
    "content": [
      {
        "heading": "Brief",
        "body": "L'onglet Brief est où vous décrivez la vision créative d'un morceau. En haut se trouve une zone de texte libre sous « À quoi ce morceau devrait-il ressembler ? » où vous pouvez écrire la direction de mix (cliquez sur « Modifier » pour changer). En dessous, la section Qualités émotionnelles vous permet de taguer le morceau avec des mots descriptifs : les tags sélectionnés apparaissent comme des pastilles pleines (ex. spacieux, chaud, percutant, nostalgique), et les suggestions disponibles apparaissent comme des pastilles contour que vous pouvez cliquer pour ajouter (agressif, intime, granuleux, poli, sombre, brillant, brut, luxuriant, rêveur, lo-fi, cinématique, minimal, dense, éthéré, hypnotique, euphorique, mélancolique, organique, synthétique, chaotique, lisse, hanté, ludique, hymne, délicat, lourd, aérien). La section Anti-références en bas vous permet de décrire les sons ou approches que vous voulez éviter. Dans la barre latérale droite, l'Aperçu rapide montre le statut du morceau, la qualité audio (fréquence d'échantillonnage / profondeur de bits) et le format en un coup d'œil. En dessous, la section Références vous permet de rechercher et d'ajouter des morceaux de référence (depuis Apple Music) avec des notes optionnelles décrivant ce qu'il faut référencer de chacun.",
        "mockup": "track-tab-intent"
      },
      {
        "heading": "Spécifications",
        "body": "L'onglet Brief contient les spécifications techniques de votre morceau. La section Paramètres techniques a trois menus déroulants : Format (Stéréo, Dolby Atmos ou Stéréo + Atmos), Fréquence d'échantillonnage (44,1kHz, 48kHz, 88,2kHz, 96kHz) et Profondeur de bits (16-bit, 24-bit, 32-bit float). Ces valeurs sont des métadonnées de référence décrivant l'audio source et sont utilisées comme défauts pour les nouveaux morceaux créés depuis des modèles, elles ne sont pas utilisées pour contrôler la sortie de conversion. En dessous, la section Livraison gère vos formats de sortie. Sélectionnez quels formats doivent être disponibles en cliquant sur les puces de format : les formats convertibles incluent WAV, AIFF, FLAC, MP3, AAC, OGG et ALAC. Les formats non-convertibles (DDP, ADM BWF/Atmos, MQA) peuvent être sélectionnés pour référence mais montrent une info-bulle expliquant qu'ils ne peuvent pas être auto-convertis. Les formats sélectionnés apparaissent surlignés en vert avec une coche. Utilisez le menu déroulant « Exporter depuis » pour choisir quelle version audio convertir (ex. « v3 - Typical Wonderful 2025-10-10 MGO.wav (dernière) »). Cliquez sur l'icône flèche de téléchargement à côté de tout format convertible sélectionné pour démarrer une conversion. Vous pouvez aussi taper un nom de format personnalisé dans le champ « Format personnalisé... » et cliquer sur « + Ajouter ». En bas, la zone de texte Exigences spéciales vous permet de noter toute instruction spécifique à la livraison.",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Audio",
        "body": "L'onglet Audio est où vous téléchargez des fichiers, gérez les versions et lisez l'audio. L'en-tête montre un petit fil d'Ariane (Artiste · Sortie), puis le titre du morceau avec des flèches chevron gauche et droite qui vous amènent au morceau précédent ou suivant de la sortie. Cliquer sur une flèche préserve l'onglet actif — passer d'Audio sur le morceau 1 vous amène à Audio sur le morceau 2 — vous pouvez ainsi parcourir un album onglet par onglet. Le sélecteur de version (v1, v2, v3, etc.) vous permet de basculer entre les révisions ; cliquez sur le bouton + pour télécharger une nouvelle version. Chaque version affiche son numéro, sa date de téléchargement, son nombre de commentaires et un bouton de téléchargement. La forme d'onde montre l'audio avec une lecture interactive : cliquez n'importe où pour naviguer, et utilisez les contrôles de transport en dessous (boucle, reculer, lecture/pause, avancer, répéter). Juste au-dessus de la forme d'onde, une rangée de pastilles de QC affiche les statistiques mesurées par le worker — LUFS, True Peak (dBTP) et un avertissement de Qualité conditionnel — chacune cliquable pour révéler une explication complète. Pendant que le worker analyse encore un nouveau téléchargement, un petit indicateur « Mesures en cours » montre où les pastilles apparaîtront. La section Retours sous la forme d'onde montre tous les commentaires horodatés pour la version actuelle. Double-cliquez sur la forme d'onde pour ajouter un commentaire à ce timecode.",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "Analyse de volume",
        "body": "Quand vous téléchargez de l'audio, Mix Architect mesure automatiquement le volume intégré en LUFS (Loudness Units Full Scale) côté serveur et le met en cache. Cliquez sur la pastille LUFS à côté des métadonnées de version pour développer le popover d'Analyse de volume. Celui-ci montre comment chaque service de streaming majeur, standard de diffusion et plateforme sociale ajustera votre morceau pendant la lecture. Chaque ligne affiche le nom de la plateforme, son volume cible (ex. Spotify cible -14 LUFS) et le changement de gain qui serait appliqué à votre fichier. Une valeur positive signifie que le service augmentera votre morceau, une valeur négative (montrée en orange) signifie qu'il sera baissé. Par exemple, si votre mix mesure -14,9 LUFS, Spotify appliquerait +0,9 dB alors qu'Apple Music (cible -16) appliquerait -1,1 dB. Survolez le nom d'une plateforme pour voir une courte explication de comment cette plateforme normalise l'audio. Le popover est groupé en Streaming (Spotify, Apple Music, YouTube, Tidal, Amazon Music, Deezer, Qobuz, Pandora), Diffusion (EBU R128, ATSC A/85, ITU-R BS.1770) et Social (Instagram/Reels, TikTok, Facebook). Cliquez en dehors du popover pour le fermer. Utilisez ceci pour vérifier si votre master sera significativement altéré sur une plateforme avant livraison.",
        "mockup": "track-tab-lufs"
      },
      {
        "heading": "True Peak",
        "body": "Le True Peak (dBTP) mesure les valeurs de crête inter-échantillons en utilisant un suréchantillonnage 4× selon ITU-R BS.1770-4. C'est différent de la crête brute d'échantillon car les codecs avec perte (MP3, AAC, Ogg Vorbis, Opus) peuvent introduire des dépassements entre les échantillons lors de l'encodage, causant un clipping audible même quand les échantillons sous-jacents n'atteignent jamais 0 dBFS. Cliquez sur la pastille True Peak pour voir comment votre true peak mesuré se compare au plafond de chaque plateforme. Contrairement au LUFS (où vous voulez atteindre la cible), le true peak est un plafond — rester à ou en dessous de la cible est toujours bien. Chaque ligne montre la plateforme, son plafond (la plupart sont à -1 dBTP ; le mode Loud de Spotify et Amazon Music sont à -2 dBTP), et soit « X.X dB de marge » (vert, vous êtes sous le plafond) soit « +X.X dB au-dessus » (orange ou rouge, vous êtes au-dessus). Le petit badge à côté de la lecture dBTP sur la ligne principale suit la même règle de couleur : vert en dessous de -1 dBTP, orange entre -1 et 0, rouge au-dessus de 0 (dépassements inter-échantillons qui cliperont les chaînes DSP). Survolez le nom d'une plateforme pour voir pourquoi ce plafond spécifique a été choisi.",
        "mockup": "track-tab-truepeak"
      },
      {
        "heading": "Contrôle Qualité",
        "body": "La pastille Contrôle Qualité est conditionnelle — elle n'apparaît que quand le worker détecte quelque chose qui mérite d'être signalé dans votre téléchargement. Les mixes propres ne montrent aucune pastille. Quand elle apparaît, elle est ambre pour un seul problème léger ou rouge pour plusieurs problèmes ou des problèmes sévères. Trois types de problèmes sont signalés aujourd'hui : Clipping (un nombre élevé d'échantillons à pleine échelle combiné avec la crête d'échantillon située à ou très près de 0 dBFS — la signature d'un plafond de limiteur sur lequel on s'assoit), Crête d'échantillon à pleine échelle (votre échantillon le plus fort est ≥ -0,1 dBFS, ne laissant aucune marge pour le DSP en aval ou l'encodage avec perte) et Décalage DC (une amplitude moyenne non nulle supérieure à 0,002, généralement due à un problème d'étage de gain ou de filtrage). Cliquer sur la pastille développe un popover avec chaque problème détecté, une courte explication technique et une correction actionnable — ex. « Réduisez le gain de sortie ou vérifiez le plafond de votre limiteur » pour le clipping, « Appliquez un filtre passe-haut à 20 Hz ou moins » pour le décalage DC.",
        "mockup": "track-tab-quality"
      },
      {
        "heading": "Distribution",
        "body": "L'onglet Delivery capture toutes les métadonnées nécessaires pour la distribution digitale. Il inclut trois sections divisées, chacune avec des boutons « + Ajouter personne » : Répartition d'écriture (nom de la personne, pourcentage, affiliation PRO comme ASCAP/BMI, numéro de compte membre et numéro IPI d'auteur), Répartition d'édition (nom de l'éditeur, pourcentage, ID membre éditeur et IPI éditeur), et Répartition d'enregistrement master (nom de l'entité et pourcentage). Le total courant pour chaque section de répartition est montré en vert quand il égale 100% ou orange quand ce n'est pas le cas. En dessous des répartitions : Codes et identifiants (champs ISRC et ISWC), Crédits (noms du producteur et compositeur/parolier), Propriétés du morceau (artiste en featuring, sélecteur de langue, bascules pour paroles explicites, instrumental et reprise), Copyright (numéro d'enregistrement et date de copyright), et Paroles (zone de texte paroles complètes).",
        "mockup": "track-tab-distribution"
      },
      {
        "heading": "Portail",
        "body": "L'onglet Delivery contrôle comment les clients interagissent avec ce morceau spécifique. En haut, la section Approbation client montre le statut d'approbation actuel (ex. « Approuvé » en vert) avec un historique horodaté de tous les événements d'approbation : approuvé, modifications demandées (avec la note du client), rouvert pour révision et re-approuvé, chacun avec des dates. En dessous, Visibilité du portail du morceau vous permet de basculer si ce morceau est visible sur le portail, si les téléchargements sont activés, et quelles versions audio spécifiques (Version 1, Version 2, Version 3, etc.) le client peut accéder, chacune avec sa propre bascule. Une note en bas vous rappelle que l'activation du portail et le lien de partage peuvent être trouvés dans l'en-tête de la page de sortie.",
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
        "body": "Pour chaque morceau, allez à l'onglet Delivery pour contrôler ce que votre client peut voir. La section Visibilité du portail du morceau a des bascules pour : « Visible sur le portail » (montrer ou cacher le morceau entier), « Activer le téléchargement » (autoriser ou bloquer les téléchargements audio), et des bascules de version individuelles (Version 1, Version 2, Version 3, etc.) pour contrôler quelles révisions audio le client peut accéder. Cela vous donne un contrôle fin pour que vous puissiez cacher les travaux en cours et ne partager que les mix finis. Toutes les bascules sont indépendantes, vous pouvez donc rendre un morceau visible mais désactiver les téléchargements, ou ne montrer que la dernière version.",
        "mockup": "portal-track-visibility"
      },
      {
        "heading": "Approbations de morceaux",
        "body": "Les clients peuvent approuver ou demander des modifications sur des morceaux individuels via le portail. Le statut d'approbation est suivi dans la section Approbation client de l'onglet Delivery de chaque morceau. Le statut montre un badge coloré (ex. vert « Approuvé ») avec un historique complet horodaté de chaque événement d'approbation : quand le client a approuvé, quand il a demandé des modifications (incluant sa note, comme « Voix trop basses »), quand le morceau a été rouvert pour révision, et quand il a été re-approuvé. Cela vous donne une trace d'audit claire de toutes les décisions client. Les badges d'approbation apparaissent aussi sur la liste des morceaux dans la page de détail de sortie, pour que vous puissiez voir en un coup d'œil quels morceaux sont approuvés.",
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
    "id": "distribution-tracker",
    "title": "Suivi de distribution",
    "category": "releases",
    "summary": "Suivez les plateformes sur lesquelles votre sortie a été soumise, surveillez le statut et recevez une notification lorsqu'elle est disponible sur Spotify.",
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
        "heading": "Ajouter des plateformes à une sortie",
        "body": "Ouvrez n'importe quelle sortie et faites défiler vers le bas jusqu'au panneau Suivi de distribution sous la liste des morceaux. Cliquez sur « + Ajouter une plateforme » pour ajouter une plateforme de streaming. Choisissez parmi Spotify, Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud ou Bandcamp. Chaque plateforme apparaît sous forme de ligne avec son logo officiel, un indicateur de statut et une étiquette de distributeur. Vous pouvez également utiliser « Marquer comme soumis » pour ajouter plusieurs plateformes en une fois : sélectionnez un distributeur (DistroKid, TuneCore, CD Baby, LANDR, Ditto, AWAL, UnitedMasters, Amuse, RouteNote ou Auto-distribué), cochez les plateformes auxquelles vous avez soumis, puis cliquez sur Soumettre.",
        "mockup": "distribution-add-platform"
      },
      {
        "heading": "États de statut",
        "body": "Chaque entrée de plateforme possède un statut qui indique où elle se trouve dans le processus de sortie. Les six états sont : Non soumis (gris, par défaut pour les plateformes nouvellement ajoutées), Soumis (bleu, vous avez envoyé la sortie à votre distributeur), En traitement (orange, le distributeur examine ou traite la sortie), En ligne (vert, la sortie est disponible sur la plateforme), Rejeté (rouge, la plateforme ou le distributeur a rejeté la sortie) et Retiré (rouge, la sortie était précédemment en ligne mais a été supprimée). Cliquez sur l'indicateur de statut de n'importe quelle ligne de plateforme pour le modifier. Les changements de statut sont enregistrés dans l'historique de la plateforme afin que vous puissiez voir quand chaque transition a eu lieu.",
        "mockup": "distribution-status"
      },
      {
        "heading": "Détection automatique Spotify",
        "body": "Spotify est affiché en haut du Suivi de distribution avec un libellé « Mise à jour automatique ». Une fois que vous marquez Spotify comme Soumis, Mix Architect vérifie périodiquement le catalogue Spotify pour votre sortie en utilisant le code ISRC (depuis l'onglet Delivery du morceau) ou le titre de la sortie et le nom de l'artiste. Lorsque votre sortie est trouvée sur Spotify, le statut passe automatiquement à En ligne, l'URL Spotify est enregistrée et vous recevez une notification. Vous pouvez également cliquer sur « Vérifier maintenant » pour déclencher une vérification immédiate. La détection automatique s'exécute quotidiennement pour toutes les entrées Spotify soumises.",
        "tip": "Renseignez le code ISRC dans l'onglet Delivery de votre morceau avant de soumettre. La détection basée sur l'ISRC est plus fiable que la correspondance par titre/artiste, surtout pour les noms courants.",
        "mockup": "distribution-spotify"
      },
      {
        "heading": "Mettre à jour le statut et ajouter des liens",
        "body": "Pour changer le statut d'une plateforme, cliquez sur l'indicateur de statut de la ligne de plateforme. Une rangée de pastilles de statut apparaît où vous pouvez sélectionner le nouvel état. Pour ajouter un lien vers la sortie sur cette plateforme, cliquez sur « Ajouter un lien » à côté du nom de la plateforme. Entrez l'URL (par exemple, le lien de l'album Spotify ou la page Apple Music) et cliquez sur Enregistrer. L'icône de lien se transforme en un lien externe cliquable qui ouvre la page de la sortie sur cette plateforme. Utilisez le menu trois points sur n'importe quelle ligne de plateforme pour des options supplémentaires : modifier les détails, supprimer la plateforme ou consulter l'historique des changements de statut.",
        "mockup": "distribution-edit"
      },
      {
        "heading": "Soumission groupée et actualisation",
        "body": "« Marquer comme soumis » vous permet d'enregistrer une soumission groupée à votre distributeur. Sélectionnez le distributeur dans le menu déroulant, cochez les plateformes auxquelles vous avez soumis et cliquez sur Soumettre. Toutes les plateformes sélectionnées sont ajoutées avec le statut Soumis et l'étiquette du distributeur. « Vérifier maintenant » apparaît sur les entrées Spotify qui ont été soumises. Cliquer dessus déclenche une recherche immédiate dans le catalogue Spotify. Si la sortie est trouvée, le statut passe à En ligne et l'URL est enregistrée automatiquement. Pour toutes les autres plateformes (Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud, Bandcamp), mettez à jour le statut manuellement lorsque vous confirmez que la sortie est en ligne.",
        "mockup": "distribution-bulk"
      },
      {
        "heading": "Étiquettes de distributeur",
        "body": "Chaque entrée de plateforme peut avoir une étiquette de distributeur indiquant quel service vous avez utilisé pour soumettre (DistroKid, TuneCore, CD Baby, etc.). Celle-ci apparaît sous forme de petite pastille à côté de l'indicateur de statut. Les étiquettes de distributeur sont définies automatiquement lorsque vous utilisez « Marquer comme soumis », ou vous pouvez les définir individuellement lors de la modification d'une entrée de plateforme. Cela vous aide à suivre quel distributeur a géré quelle plateforme, surtout si vous utilisez différents distributeurs pour différents territoires ou plateformes.",
        "warning": "Les analyses ne reflètent que les données que vous avez suivies dans Mix Architect. Si vous soumettez via le tableau de bord de votre distributeur, pensez à mettre à jour le statut ici pour que votre suivi reste précis.",
        "mockup": "distribution-distributor"
      }
    ]
  },
  {
    "id": "user-analytics",
    "title": "Analyses utilisateur",
    "category": "releases",
    "summary": "Consultez vos sorties terminées, le délai moyen de réalisation, le revenu total et la répartition par client dans le tableau de bord Analyses.",
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
        "heading": "Ce que la page Analyses affiche",
        "body": "Accédez à la page [Analyses](/app/analytics) depuis la barre latérale. Le tableau de bord affiche quatre cartes de résumé en haut : Sorties terminées (total des projets terminés avec la moyenne mensuelle), Délai moyen de réalisation (jours de la création à l'achèvement, avec le détail du plus rapide et du plus lent), Revenu total (somme de tous les honoraires suivis avec le solde impayé) et Clients (nombre de clients uniques avec le total des sorties). Sous les cartes de résumé, trois graphiques visualisent vos données dans le temps, et un tableau de répartition par client affiche les statistiques par client.",
        "mockup": "analytics-overview"
      },
      {
        "heading": "Cadence de sorties et délai de réalisation",
        "body": "Le graphique Cadence de sorties est un diagramme en barres montrant combien de sorties vous avez terminées chaque mois dans la plage de dates sélectionnée. Des barres plus hautes signifient des mois plus productifs. Utilisez-le pour repérer les tendances de votre production et identifier les périodes chargées ou calmes. Le graphique Délai de réalisation montre le nombre moyen de jours entre la création et l'achèvement d'une sortie par mois. Des barres plus basses signifient une livraison plus rapide. Ensemble, ces graphiques vous aident à comprendre votre capacité et si votre flux de travail s'accélère ou ralentit au fil du temps.",
        "mockup": "analytics-velocity"
      },
      {
        "heading": "Graphique des revenus",
        "body": "Le graphique des revenus est un graphique en aires montrant le total des honoraires perçus par mois. Il suit les montants de paiement enregistrés sur vos sorties et reflète donc ce que les clients ont effectivement payé. Utilisez-le pour voir les tendances de revenus, identifier vos mois les plus rentables et planifier les périodes plus calmes. Les données de revenus proviennent de la fonctionnalité de suivi des paiements sur chaque sortie. Assurez-vous que les honoraires et les statuts de paiement sont à jour pour un reporting précis.",
        "mockup": "analytics-revenue"
      },
      {
        "heading": "Répartition par client",
        "body": "Le tableau Répartition par client en bas de la page Analyses liste chaque client avec ses métriques clés : nombre de sorties, revenu total, montant payé et délai moyen de réalisation. Cela vous aide à identifier quels clients génèrent le plus de travail et de revenus, qui paie à temps et où votre temps est consacré. Cliquez sur n'importe quelle ligne de client pour voir ses sorties. Le tableau est trié par revenu par défaut.",
        "mockup": "analytics-clients"
      },
      {
        "heading": "Sélecteur de plage de dates",
        "body": "Utilisez le sélecteur de plage de dates en haut à droite pour contrôler la période couverte par les analyses. Les plages prédéfinies incluent les 7 derniers jours, les 30 derniers jours, les 90 derniers jours et les 365 derniers jours. Vous pouvez également définir une plage de dates personnalisée en sélectionnant des dates de début et de fin spécifiques. Les quatre cartes de résumé et les trois graphiques se mettent à jour pour refléter la période sélectionnée. Le sélecteur de plage de dates fonctionne de la même manière dans tout le tableau de bord d'analyses.",
        "tip": "Utilisez la plage de 365 jours pour les bilans annuels et la préparation fiscale. La plage de 30 jours est utile pour les points mensuels sur la santé de votre activité.",
        "mockup": "analytics-date-range"
      }
    ]
  },
  {
    "id": "release-settings",
    "title": "Paramètres de sortie",
    "category": "releases",
    "summary": "Configurez les détails de sortie, les informations client, les métadonnées de distribution, le suivi des paiements et les membres de l'équipe pour chaque sortie.",
    "tags": ["release", "settings", "client", "distribution", "payment", "team", "collaborators", "metadata", "UPC", "copyright"],
    "updatedAt": "2026-03-15",
    "content": [
      {
        "heading": "Ouvrir les paramètres de sortie",
        "body": "Depuis n'importe quelle sortie, cliquez sur l'icone d'engrenage dans la barre d'outils de la sortie ou sélectionnez \"Paramètres\" dans le menu trois points. La page des paramètres comporte cinq sections : Détails de la sortie, Informations client, Distribution, Paiement et Gestion d'équipe. Une flèche de retour en haut vous ramène a la vue de la sortie. Les modifications sont enregistrées lorsque vous cliquez sur le bouton Enregistrer en bas du formulaire.",
        "mockup": "release-settings-overview"
      },
      {
        "heading": "Détails de la sortie",
        "body": "La section Détails de la sortie contient les métadonnées principales de votre projet. Téléchargez ou modifiez la pochette en cliquant sur la zone d'image. Définissez le titre de la sortie et le nom de l'artiste dans les champs de texte. Choisissez le type de sortie (Single, EP ou Album) et le format (Stéréo, Dolby Atmos ou Stéréo + Atmos) a l'aide de sélecteurs en forme de pilule. Définissez le statut (Brouillon, En cours ou Pret) de la meme manière. Ajoutez des tags de genre a l'aide de la saisie de tags avec suggestions automatiques (Rock, Pop, Hip-Hop, Électronique, etc.). Définissez une date cible pour votre échéance de sortie, qui alimente également l'abonnement au calendrier.",
        "mockup": "release-settings-details"
      },
      {
        "heading": "Informations client",
        "body": "La section Informations client stocke les coordonnées du client associé a cette sortie. Les champs comprennent Nom du client, E-mail du client, Téléphone du client et Notes de livraison. Le nom du client apparait dans la répartition par client des Analyses et dans les rapports de paiement. Notes de livraison est une zone de texte libre pour les instructions spéciales comme les conventions de nommage de fichiers préférées ou les plateformes de livraison.",
        "mockup": "release-settings-client"
      },
      {
        "heading": "Métadonnées de distribution",
        "body": "La section Distribution capture les métadonnées nécessaires a la distribution numérique. Les champs comprennent Distributeur (par ex. DistroKid, TuneCore), Label, Code-barres UPC/EAN, Numéro de catalogue, Titulaire du copyright, Année de copyright et Copyright phonographique (la ligne P). Ces valeurs sont utilisées par le suivi de distribution et apparaissent dans votre export de données.",
        "mockup": "release-settings-distribution"
      },
      {
        "heading": "Paramètres de paiement",
        "body": "La section Paiement n'est visible que lorsque le suivi des paiements est activé dans vos Paramètres utilisateur. Elle affiche le statut de paiement a l'aide de sélecteurs en pilule (Pas d'honoraires, Impayé, Partiel, Payé), un champ Honoraires du projet avec sélecteur de devise, le Montant payé et le Solde du calculé. Une zone de texte Notes de paiement permet d'enregistrer les conditions de paiement ou les références de facture. Le statut de paiement et les montants apparaissent sur les cartes du tableau de bord et dans les graphiques de revenus des Analyses.",
        "mockup": "release-settings-payment",
        "tip": "Définissez le statut de paiement sur \"Partiel\" lorsqu'un acompte a été reçu. Le solde du est calculé automatiquement a partir des honoraires du projet moins le montant payé."
      },
      {
        "heading": "Gestion d'équipe",
        "body": "La section Gestion d'équipe vous permet d'inviter des collaborateurs et des clients a la sortie. Saisissez une adresse e-mail, choisissez un role (Collaborateur ou Client) et cliquez sur Inviter. Les invitations en attente affichent un badge \"Invité\" avec un bouton Renvoyer. Les membres acceptés affichent leur nom d'affichage, leur role et une option pour les supprimer. Le propriétaire de la sortie est toujours listé et ne peut pas etre supprimé. Les collaborateurs peuvent modifier les pistes et laisser des commentaires; les clients ont un accès en lecture seule ainsi que la possibilité d'approuver les pistes via le portail client.",
        "mockup": "release-settings-team",
        "warning": "Supprimer un membre de l'équipe révoque immédiatement son accès. Cette personne ne pourra plus voir la sortie ni aucune de ses pistes."
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
        "body": "Ouvrez n'importe quel morceau et allez à l'onglet Brief. Faites défiler jusqu'à la section Livraison. Ici vous sélectionnez quels formats de sortie votre projet nécessite en cliquant sur les puces de format. Formats convertibles disponibles : WAV, AIFF, FLAC, MP3, AAC, OGG et ALAC. Les formats sélectionnés apparaissent surlignés en vert avec une icône de coche. Des formats non-convertibles additionnels (DDP, ADM BWF/Atmos, MQA) peuvent être basculés pour référence, ils affichent une info-bulle expliquant que la conversion automatique n'est pas disponible. Vous pouvez aussi taper un nom de format personnalisé dans le champ d'entrée « Format personnalisé... » et cliquer sur « + Ajouter » pour tout format non listé. Utilisez le menu déroulant « Exporter depuis » pour choisir quelle version audio convertir, comme « v3 - filename.wav (dernière) ».",
        "mockup": "format-convert"
      },
      {
        "heading": "Convertir et télécharger",
        "body": "Sélectionnez quels formats doivent être disponibles en cliquant sur les puces de format dans la section Livraison : les formats convertibles incluent WAV, AIFF, FLAC, MP3, AAC, OGG et ALAC. Les formats sélectionnés apparaissent surlignés en vert avec une coche. Cliquez sur l'icône flèche de téléchargement à côté de tout format convertible sélectionné pour démarrer une conversion. L'icône montre un spinner pendant que la conversion est en traitement en arrière-plan. Quand la conversion se termine, le fichier se télécharge automatiquement vers votre navigateur. Chaque conversion utilise la version audio que vous avez sélectionnée dans le menu déroulant « Exporter depuis », convertissant depuis le fichier original téléchargé pour préserver la qualité audio maximale. Les formats sans perte (WAV, AIFF, FLAC, ALAC) préservent la fréquence d'échantillonnage et profondeur de bits du fichier source. Les formats avec perte utilisent des préréglages optimisés : MP3 exporte à 44,1 kHz / 320 kbps, AAC à 44,1 kHz / 256 kbps et OGG à 44,1 kHz / Qualité 8.",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Intégration automatique de métadonnées",
        "body": "Quand vous convertissez vers MP3, FLAC, AAC, OGG ou ALAC, Mix Architect écrit automatiquement des tags de métadonnées standard de l'industrie dans le fichier de sortie. Cela inclut : artiste, titre, album, numéro de piste, genre, année de sortie, copyright, ISRC, UPC/code-barres, paroles, pochette et ReplayGain. ReplayGain est un tag de volume qui indique aux lecteurs compatibles de combien ajuster le volume pour que les morceaux soient lus à un niveau cohérent sans écrêtage. Mix Architect le calcule depuis les LUFS mesurés de votre audio en utilisant le standard ReplayGain 2.0 (niveau de référence de -18 LUFS). Les fichiers MP3 obtiennent des tags ID3v2, FLAC et OGG utilisent les commentaires Vorbis, et AAC/ALAC utilisent les atomes MP4 style iTunes. Toutes les métadonnées sont tirées de vos détails de sortie et morceau (incluant l'onglet Delivery pour l'ISRC et les paroles, et la pochette de sortie). Les exports WAV et AIFF n'incluent pas de tags de métadonnées. Après qu'une conversion se termine, passez la souris sur l'icône tag à côté de la puce de format pour voir exactement quels tags ont été intégrés.",
        "tip": "Remplissez votre onglet Delivery (ISRC, paroles) et téléchargez une pochette avant d'exporter. Plus vous fournissez de métadonnées, plus vos fichiers exportés seront complets pour la distribution."
      },
      {
        "heading": "Référence des formats supportés",
        "body": "Les formats sans perte préservent la qualité source : WAV (PCM, fréquence/profondeur source), AIFF (PCM, fréquence/profondeur source), FLAC (fréquence source), ALAC (fréquence source). Les formats avec perte utilisent des préréglages fixes optimisés pour la distribution : MP3 (44,1 kHz, 320 kbps, stéréo), AAC (44,1 kHz, 256 kbps, stéréo), OGG Vorbis (44,1 kHz, qualité 8, stéréo). Formats non-convertibles (tag seulement, pas d'auto-conversion) : DDP, ADM BWF (Atmos), MQA. Les Paramètres techniques (fréquence d'échantillonnage et profondeur de bits) en haut de l'onglet Brief sont des métadonnées de référence décrivant l'audio source, elles ne contrôlent pas la sortie de conversion. La zone de texte Exigences spéciales sous les formats de livraison vous permet d'ajouter des notes sur les instructions de livraison.",
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
        "body": "L'onglet Audio est pour les retours horodatés liés à des moments spécifiques dans la forme d'onde : « monter les voix à 1:22 » ou « la caisse claire est trop forte ici ». L'onglet Notes est pour la discussion générale et les notes de révision qui ne sont pas liées à un timecode : « globalement le mix a besoin de plus de graves » ou « le client veut une approche plus agressive ». Les commentaires audio sont spécifiques à la version (liés à v1, v2, etc.), alors que les Notes s'appliquent au morceau dans son ensemble. Utilisez l'onglet Brief pour documenter la vision créative globale, les tags émotionnels et les morceaux de référence.",
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
    "id": "user-settings",
    "title": "Paramètres utilisateur",
    "category": "account",
    "summary": "Configurez votre profil, apparence, notifications par e-mail, paramètres de mix par défaut et plus encore.",
    "tags": ["settings", "profile", "email", "notifications", "preferences", "theme", "appearance", "defaults", "persona", "calendar", "export"],
    "updatedAt": "2026-03-15",
    "content": [
      {
        "heading": "Aperçu des paramètres",
        "body": "Ouvrez les [Paramètres utilisateur](/app/settings) depuis la barre latérale ou le menu du compte dans la barre supérieure. Les paramètres sont organisés en panneaux : Profil, Abonnement, Région et devise, Apparence, Persona, Suivi des paiements, Préférences e-mail, Paramètres de mix par défaut, Calendrier et Vos données. Les modifications sont enregistrées instantanément lorsque vous interagissez avec chaque panneau.",
        "mockup": "settings-overview"
      },
      {
        "heading": "Profil",
        "body": "Le panneau Profil est la première section de la page. Il contient trois champs : Nom d'affichage (affiché sur les commentaires, les notifications et les e-mails aux collaborateurs), Nom de l'entreprise (optionnel, pour votre image de marque) et E-mail (lecture seule, géré par votre fournisseur d'authentification). Saisissez votre nom et cliquez sur Enregistrer. Un message d'accueil personnalisé utilisant votre prénom apparait dans la barre supérieure.",
        "mockup": "settings-profile"
      },
      {
        "heading": "Abonnement",
        "body": "Le panneau Abonnement affiche votre plan actuel. Les comptes Pro affichent un badge vert \"PRO\", le prix mensuel et un bouton \"Gérer la facturation\" qui ouvre le portail Stripe pour mettre a jour les moyens de paiement, consulter les factures et télécharger les reçus. Les comptes gratuits voient un bouton \"Passer a Pro\" a la place. Pro débloque les sorties illimitées, la conversion de format audio et le support prioritaire.",
        "mockup": "settings-subscription"
      },
      {
        "heading": "Région et devise",
        "body": "Le panneau Région et devise contient deux menus déroulants. Le menu Langue définit votre langue et votre format de date, avec un emoji drapeau a coté de chaque option. Changer votre langue met également a jour automatiquement la devise par défaut. Le menu Devise vous permet de remplacer la devise utilisée pour le suivi des paiements. Un aperçu du format en bas montre comment les montants seront affichés (par ex. \"1 234,56 $\").",
        "mockup": "settings-region"
      },
      {
        "heading": "Apparence",
        "body": "Le panneau Apparence vous permet de basculer entre les thèmes Clair, Sombre et Système a l'aide de trois boutons stylisés. Le thème actif est mis en valeur avec votre couleur d'accentuation. Le mode Système suit les préférences de votre système d'exploitation. Votre choix de thème est enregistré dans votre compte et s'applique sur tous vos appareils.",
        "mockup": "settings-appearance"
      },
      {
        "heading": "Persona",
        "body": "Le panneau Persona demande comment vous utilisez Mix Architect. Choisissez entre Artiste, Ingénieur, Les deux ou Autre a l'aide de boutons radio. Votre sélection adapte l'expérience : choisir Ingénieur ou Les deux active automatiquement le suivi des paiements, tandis qu'Artiste le laisse désactivé par défaut. Vous pouvez toujours modifier le suivi des paiements indépendamment. Une note sous les options explique comment la persona affecte les paramètres par défaut.",
        "mockup": "settings-persona"
      },
      {
        "heading": "Suivi des paiements",
        "body": "Le panneau Suivi des paiements contient un seul interrupteur. Lorsqu'il est activé, les cartes de sortie sur le tableau de bord affichent des statistiques de paiement (Impayé, Perçu, Total des honoraires), et chaque sortie obtient une section Paiement dans ses paramètres. Lorsqu'il est désactivé, toute l'interface liée aux paiements est masquée. L'interrupteur enregistre instantanément et rafraichit la page.",
        "mockup": "settings-payment-tracking",
        "tip": "Le suivi des paiements est automatiquement activé lorsque vous sélectionnez Ingénieur ou Les deux comme persona, et désactivé pour Artiste. Vous pouvez modifier cela manuellement a tout moment."
      },
      {
        "heading": "Notifications par e-mail",
        "body": "Le panneau Préférences e-mail controle les e-mails transactionnels que vous recevez de Mix Architect. Chaque catégorie dispose d'un interrupteur. Les catégories comprennent : Alertes de mise en ligne (lorsqu'une sortie est publiée sur une plateforme), Alertes de nouveaux commentaires (lorsque quelqu'un commente votre sortie), Résumé hebdomadaire (un récapitulatif de l'activité de toutes vos sorties), Rappels de paiement (lorsqu'un paiement d'abonnement échoue), Confirmations de paiement (lorsqu'un paiement est traité), Confirmations d'abonnement (lorsque votre plan est activé) Avis d'annulation (lorsque votre plan est annulé) et Retour client (lorsqu'un client approuve ou demande des modifications). Toutes les catégories sont activées par défaut. Chaque e-mail inclut un lien de désabonnement en bas.",
        "mockup": "settings-email-prefs",
        "tip": "Vous pouvez également vous désabonner d'une catégorie d'e-mail spécifique en cliquant sur le lien de désabonnement en bas de n'importe quel e-mail de notification. Aucune connexion requise."
      },
      {
        "heading": "Paramètres de mix par défaut",
        "body": "Le panneau Paramètres de mix par défaut définit vos valeurs de départ préférées pour les nouvelles sorties. Choisissez un format par défaut (Stéréo, Dolby Atmos ou Stéréo + Atmos) a l'aide de boutons en forme de pilule. Sélectionnez une fréquence d'échantillonnage par défaut (44,1 kHz, 48 kHz ou 96 kHz) et une profondeur de bits (16 bits, 24 bits ou 32 bits float) dans les menus déroulants. Vous pouvez également définir une liste d'éléments par défaut a l'aide de la saisie de tags (par ex. Voix, Basse, Batterie). Ces valeurs par défaut sont appliquées automatiquement lorsque vous créez de nouvelles sorties, évitant les configurations répétitives. Cliquez sur Enregistrer pour conserver vos choix.",
        "mockup": "settings-mix-defaults"
      },
      {
        "heading": "Calendrier",
        "body": "Le panneau Calendrier fournit un flux d'abonnement iCal pour vos échéances de sortie. Un champ URL en lecture seule affiche l'adresse de votre flux personnel avec un bouton Copier pour le copier dans votre presse-papiers. En dessous, des instructions d'installation expliquent comment ajouter le flux a Google Agenda, Apple Calendrier ou Outlook. Un bouton Régénérer crée une nouvelle URL de flux si vous devez révoquer l'accès a l'ancienne.",
        "mockup": "settings-calendar",
        "warning": "Régénérer l'URL de votre flux de calendrier invalide l'ancien lien. Tous les calendriers abonnés a l'URL précédente cesseront de recevoir des mises a jour."
      },
      {
        "heading": "Vos données",
        "body": "Le panneau Vos données vous permet d'exporter toutes vos données Mix Architect. Il affiche une taille d'export estimée et fournit un bouton Télécharger. L'export comprend toutes les sorties, pistes, métadonnées de fichiers audio, notes, commentaires, listes de collaborateurs et paramètres. Utilisez-le pour des sauvegardes ou si vous souhaitez une copie locale de votre travail.",
        "mockup": "settings-data"
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
