import type { HelpArticle } from "./types";

export const articles: HelpArticle[] = [
  {
    "id": "getting-started-overview",
    "title": "Bem-vindo ao Mix Architect",
    "category": "getting-started",
    "summary": "Um tour rápido pela plataforma: seu dashboard, lançamentos, faixas e ferramentas de colaboração.",
    "tags": [
      "overview",
      "intro",
      "dashboard",
      "getting started"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Seu Dashboard",
        "body": "Após fazer login, você chega ao [Dashboard](/app). Ele mostra todos os seus lançamentos em uma grade responsiva, ordenados por atividade mais recente. Cada cartão de lançamento exibe a capa, título, nome do artista, ponto de status (código de cores para Rascunho, Em Progresso ou Pronto), tipo de lançamento (Single, EP ou Álbum), formato (Estéreo, Dolby Atmos ou Estéreo + Atmos) e um contador de conclusão de faixas como \"1 de 6 faixas briefadas\". Se o [rastreamento de pagamentos](/app/settings) estiver ativado, você também verá estatísticas de resumo de pagamentos no topo: Pendente, Recebido e Total de taxas em todos os lançamentos, com um link \"Ver tudo\" para a página de [Pagamentos](/app/payments). Use o ícone de fixar em qualquer cartão de lançamento para fixá-lo no topo do seu dashboard, e o menu de três pontos para ações rápidas. O menu suspenso de ordenação permite organizar lançamentos por Última Modificação, Título ou Data de Criação.",
        "mockup": "dashboard"
      },
      {
        "heading": "Visualização Grade vs Timeline",
        "body": "O cabeçalho do dashboard tem dois botões de alternância de visualização: Grade e Timeline. A visualização em Grade (padrão) exibe seus lançamentos como cartões em uma grade responsiva. A visualização Timeline organiza os lançamentos cronologicamente com base nas datas de lançamento planejadas, mostrando contagens regressivas e informações de programação. Sua preferência de visualização é salva automaticamente. Saiba mais em [Usando a Visualização Timeline](/app/help?article=timeline-overview)."
      },
      {
        "heading": "Navegando no App",
        "body": "A barra lateral (desktop) ou barra inferior (mobile) oferece acesso rápido a todas as seções do app: [Dashboard](/app) para seus lançamentos, Pesquisar (ou Cmd+K / Ctrl+K) para pular instantaneamente para qualquer lançamento ou faixa, [Templates](/app/templates) para presets de lançamento reutilizáveis, [Pagamentos](/app/payments) para rastreamento de taxas (se ativado), [Configurações](/app/settings) para seu perfil, padrões e assinatura, e [Ajuda](/app/help) para documentação. A barra lateral também inclui Notificações para atualizações de atividade, Auto para recursos de automação e Sair. A alternância de tema entre os modos Claro, Escuro e Sistema está disponível em [Configurações](/app/settings) em Aparência.",
        "tip": "Pressione Cmd+K (Mac) ou Ctrl+K (Windows) de qualquer lugar no app para pesquisar instantaneamente e pular para qualquer lançamento ou faixa.",
        "mockup": "nav-rail"
      },
      {
        "heading": "Conceitos Principais",
        "body": "Lançamentos são seus projetos de nível superior (álbuns, EPs ou singles). Cada lançamento contém uma ou mais faixas. No desktop, a página de detalhes do lançamento tem um layout de duas colunas: a lista de faixas à esquerda e uma barra lateral do inspetor à direita mostrando a capa, Informações do Lançamento (artista, tipo, formato, status, data planejada, gênero), Direção Global de Mix, Referências Globais e status de Pagamento. Cada faixa tem seis abas: Intenção, Especificações, Áudio, Distribuição, Portal e Notas. Clique no ícone de engrenagem de configurações no cabeçalho do lançamento para abrir as Configurações do Lançamento, onde você pode editar todos os metadados, gerenciar sua equipe e configurar pagamento. O cabeçalho também tem botões para o alternador do Portal (com um link para abrir o portal), Salvar como Template e a engrenagem de configurações.",
        "mockup": "key-concepts"
      }
    ]
  },
  {
    "id": "create-first-release",
    "title": "Criando Seu Primeiro Lançamento",
    "category": "getting-started",
    "summary": "Guia passo a passo para criar um lançamento, adicionar capa, fazer upload de faixas e definir seu status.",
    "tags": [
      "create",
      "release",
      "new project",
      "setup"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Criar um Novo Lançamento",
        "body": "Do [Dashboard](/app), clique no botão \"+ Novo Lançamento\" no canto superior direito. Se você tem [templates](/app/templates) salvos, um seletor de template é mostrado primeiro onde você pode selecionar um template ou clicar em \"Começar do zero\". O formulário de criação solicita um título, um nome de artista/cliente opcional, tipo de lançamento (Single, EP ou Álbum), formato (Estéreo, Dolby Atmos ou Estéreo + Atmos), tags de gênero (escolha das sugestões como Rock, Pop, Hip-Hop, Eletrônico, etc. ou adicione suas próprias) e uma data de lançamento planejada.",
        "tip": "Quando você cria um Single, uma faixa é criada automaticamente com o título do lançamento e suas especificações padrão das [Configurações](/app/settings) aplicadas.",
        "mockup": "create-release"
      },
      {
        "heading": "A Página de Detalhes do Lançamento",
        "body": "Após a criação, você vai para a página de detalhes do lançamento. No desktop, esta tem um layout de duas colunas: a lista de faixas à esquerda com um botão \"Fluxo\" e botão \"+ Adicionar Faixa\", e uma barra lateral do inspetor à direita. A barra lateral do inspetor mostra a capa, Informações do Lançamento (Artista, Tipo, Formato, Status, Data Planejada, Gênero), Direção Global de Mix (clique no ícone do lápis para atualizar) e Referências Globais (clique em \"+ Adicionar\" para pesquisar e adicionar faixas de referência). Se o rastreamento de pagamentos estiver ativado, a seção Pagamento aparece na parte inferior da barra lateral. Para adicionar ou alterar a capa, clique no ícone do lápis na arte da barra lateral. Isso revela opções abaixo da imagem: um botão Upload para escolher um arquivo, um botão Remover (se a arte já existe) e um campo \"Ou colar URL\" para vincular uma imagem diretamente. Novos lançamentos mostram uma área de upload tracejada com \"Clique para fazer upload\" (JPEG ou PNG, mín. 1400x1400). Para editar outros metadados do lançamento, clique no ícone da engrenagem no cabeçalho para abrir as Configurações do Lançamento.",
        "mockup": "cover-art-upload"
      },
      {
        "heading": "Adicionar Faixas",
        "body": "Na visualização de detalhes do lançamento, clique em \"+ Adicionar Faixa\" no cabeçalho ao lado do botão Fluxo. Dê um título à sua faixa e ela será criada com suas especificações padrão das [Configurações](/app/settings) aplicadas. Cada faixa aparece na lista com um número, título, preview da intenção, ponto de status e distintivo de aprovação. Você pode arrastar faixas para reordená-las usando a alça de arrastar à esquerda, ou usar os botões mover para cima/baixo. Exclua faixas com o ícone da lixeira à direita. Clique em qualquer faixa para abri-la e começar a trabalhar em suas seis abas.",
        "mockup": "track-upload"
      },
      {
        "heading": "Definir Status do Lançamento",
        "body": "Cada lançamento tem um status: Rascunho, Em Progresso ou Pronto. Você pode alterar o status na barra lateral do inspetor clicando no distintivo de status ao lado de \"Status\" na seção Informações do Lançamento, ou nas Configurações do Lançamento (ícone da engrenagem). Um lançamento muda automaticamente para Em Progresso quando o trabalho é iniciado (por exemplo, fazendo upload de áudio ou adicionando faixas). A cor do distintivo de status aparece nos cartões de lançamento do [Dashboard](/app) (laranja para Rascunho, azul para Em Progresso, verde para Pronto) e é visível para todos os colaboradores e no portal do cliente.",
        "mockup": "release-status"
      }
    ]
  },
  {
    "id": "invite-collaborators",
    "title": "Convidando Colaboradores para um Lançamento",
    "category": "getting-started",
    "summary": "Compartilhe seu lançamento com membros da equipe e clientes externos usando papéis e o portal.",
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
        "heading": "Enviando Convites",
        "body": "Abra um lançamento e clique no ícone da engrenagem de configurações no cabeçalho para ir às Configurações do Lançamento. Role para baixo após os metadados do lançamento até a seção Equipe na parte inferior. Digite o endereço de email da pessoa que você quer convidar, selecione seu papel no menu suspenso (Colaborador ou Cliente) e clique em \"Convidar\". Eles receberão um email com um link para se juntar ao lançamento. Membros ativos da equipe aparecem abaixo do formulário de convite com seu email, distintivo de papel, status e um botão excluir para removê-los.",
        "mockup": "invite-collaborator"
      },
      {
        "heading": "Papéis Colaborador vs Cliente",
        "body": "Há dois papéis. Colaboradores têm acesso total para visualizar e editar todo o conteúdo do lançamento: faixas, intenção, especificações, áudio, notas, metadados de distribuição e configurações do lançamento. Clientes têm acesso somente leitura através do portal do cliente e podem fornecer feedback através de comentários, aprovar ou solicitar mudanças em faixas individuais e baixar arquivos de áudio se permitido. O distintivo de papel é exibido ao lado do email de cada membro da equipe na seção Equipe.",
        "mockup": "collaborator-roles"
      },
      {
        "heading": "Aceitando Convites",
        "body": "Quando alguém clica no link do convite e se junta ao lançamento, eles aparecem na lista da Equipe com seu distintivo de papel e status \"Ativo\". Você receberá uma notificação no app informando que eles se juntaram. Convidados que não têm uma conta Mix Architect serão solicitados a criar uma quando clicarem no link do convite.",
        "tip": "Você pode remover um membro da equipe a qualquer momento clicando no ícone da lixeira ao lado do nome deles na seção Equipe das Configurações do Lançamento.",
        "mockup": "accept-invitation"
      },
      {
        "heading": "Compartilhamento do Portal do Cliente",
        "body": "Para partes interessadas externas que precisam revisar sem fazer login, ative o portal do cliente no cabeçalho da página de detalhes do lançamento. Clique no alternador Portal para ligá-lo (o alternador fica verde quando ativo), então use o ícone de link ao lado do alternador para copiar a URL de compartilhamento única. O portal fornece acesso somente leitura ao brief do lançamento, lista de faixas, reprodução de áudio e comentários. Você pode configurar exatamente o que é visível usando as configurações do portal: direção de mix, especificações, referências, status de pagamento, informações de distribuição e letras. Para controle por faixa, use a aba Portal em cada faixa.",
        "mockup": "portal-sharing"
      }
    ]
  },
  {
    "id": "track-tabs",
    "title": "Detalhes da Faixa: Entendendo as Abas",
    "category": "releases",
    "summary": "Cada faixa tem seis abas para gerenciar todos os aspectos da sua mixagem: Intenção, Especificações, Áudio, Distribuição, Portal e Notas.",
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
        "heading": "Intenção",
        "body": "A aba Intenção é onde você descreve a visão criativa de uma faixa. No topo há uma área de texto livre sob \"Como esta faixa deve soar?\" onde você pode escrever a direção da mixagem (clique em \"Editar\" para modificar). Abaixo, a seção Qualidades Emocionais permite marcar a faixa com palavras descritivas: tags selecionadas aparecem como pílulas preenchidas (ex. espaçoso, quente, marcante, nostálgico), e sugestões disponíveis aparecem como pílulas em contorno que você pode clicar para adicionar (agressivo, íntimo, áspero, polido, escuro, brilhante, cru, exuberante, sonhador, lo-fi, cinemático, minimal, denso, etéreo, hipnótico, eufórico, melancólico, orgânico, sintético, caótico, suave, assombrado, brincalhão, hino, delicado, pesado, arejado). A seção Anti-Referências na parte inferior permite descrever sons ou abordagens que você quer evitar. Na barra lateral direita, a Visualização Rápida mostra o status da faixa, qualidade do áudio (taxa de amostragem / profundidade de bits) e formato rapidamente. Abaixo, a seção Referências permite pesquisar e adicionar faixas de referência (do Apple Music) com notas opcionais descrevendo o que referenciar sobre cada uma.",
        "mockup": "track-tab-intent"
      },
      {
        "heading": "Especificações",
        "body": "A aba Especificações contém as especificações técnicas da sua faixa. A seção Configurações Técnicas tem três menus suspensos: Formato (Estéreo, Dolby Atmos ou Estéreo + Atmos), Taxa de Amostragem (44.1kHz, 48kHz, 88.2kHz, 96kHz) e Profundidade de Bits (16-bit, 24-bit, 32-bit float). Esses valores são metadados de referência descrevendo o áudio fonte e são usados como padrões para novas faixas criadas a partir de templates, eles não são usados para controlar a saída de conversão. Abaixo, a seção Entrega gerencia seus formatos de saída. Selecione quais formatos devem estar disponíveis clicando nos chips de formato: formatos conversíveis incluem WAV, AIFF, FLAC, MP3, AAC, OGG e ALAC. Formatos não conversíveis (DDP, ADM BWF/Atmos, MQA) podem ser selecionados para referência mas mostram uma dica explicando que não podem ser auto-convertidos. Formatos selecionados aparecem destacados em verde com uma marca de verificação. Use o menu suspenso \"Exportar de\" para escolher de qual versão de áudio converter (ex. \"v3 - Typical Wonderful 2025-10-10 MGO.wav (mais recente)\"). Clique no ícone da seta de download ao lado de qualquer formato conversível selecionado para iniciar uma conversão. Você também pode digitar um nome de formato personalizado no campo \"Formato personalizado...\" e clicar em \"+ Adicionar\". Na parte inferior, a área de texto Requisitos Especiais permite anotar instruções específicas de entrega.",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Áudio",
        "body": "A aba Áudio é onde você faz upload de arquivos, gerencia versões e reproduz áudio. O cabeçalho mostra o nome do lançamento e da faixa com a capa do álbum. O seletor de versão (v1, v2, v3, etc.) permite alternar entre revisões, clique no botão + para fazer upload de uma nova versão. Cada versão exibe seu número de versão, data de upload, contagem de comentários e um botão de download. A visualização da forma de onda mostra o áudio com reprodução interativa: clique em qualquer lugar para buscar, e use os controles de transporte abaixo (loop, pular para trás, reproduzir/pausar, pular para frente, repetir). A medição de volume LUFS é exibida ao lado dos metadados do arquivo (formato, taxa de amostragem, profundidade de bits), com código de cores contra alvos de volume. A seção Feedback abaixo da forma de onda mostra todos os comentários com marca de tempo para a versão atual. Clique duas vezes em qualquer lugar na forma de onda para adicionar um novo comentário naquele timecode. Marcadores de comentários aparecem como pequenos ícones na forma de onda em suas respectivas posições.",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "Análise de Volume (LUFS)",
        "body": "Quando você faz upload de áudio, o Mix Architect automaticamente mede o volume integrado em LUFS (Loudness Units Full Scale). Clique na leitura LUFS ao lado dos metadados da versão para expandir o painel de Análise de Volume. Isso mostra como cada grande serviço de streaming, padrão de transmissão e plataforma social ajustará sua faixa durante a reprodução. Cada linha exibe o nome da plataforma, seu volume alvo (ex. Spotify tem como alvo -14 LUFS) e a mudança de ganho que seria aplicada ao seu arquivo. Um valor positivo significa que o serviço aumentará sua faixa, um valor negativo (mostrado em laranja) significa que será diminuído. Por exemplo, se sua mixagem mede -14.9 LUFS, o Spotify aplicaria +0.9 dB enquanto o Apple Music (alvo -16) aplicaria -1.1 dB. O painel é agrupado em Streaming (Spotify, Apple Music, YouTube, Tidal, Amazon Music, Deezer, Qobuz, Pandora), Transmissão (EBU R128, ATSC A/85, ITU-R BS.1770) e Social (Instagram/Reels, TikTok, Facebook). Use isso para verificar se seu master será significativamente alterado em qualquer plataforma antes da entrega.",
        "mockup": "track-tab-lufs"
      },
      {
        "heading": "Distribuição",
        "body": "A aba Distribuição captura todos os metadados necessários para distribuição digital. Inclui três seções divididas, cada uma com botões \"+ Adicionar Pessoa\": Divisão de Composição (nome da pessoa, porcentagem, afiliação PRO como ASCAP/BMI, número da Conta de Membro e número IPI do Compositor), Divisão de Publicação (nome da editora, porcentagem, ID de Membro da Editora e IPI da Editora) e Divisão de Gravação Master (nome da entidade e porcentagem). O total corrente para cada seção de divisão é mostrado em verde quando é igual a 100% ou laranja quando não é. Abaixo das divisões: Códigos e Identificadores (campos ISRC e ISWC), Créditos (nomes do produtor e compositor/compositor), Propriedades da Faixa (artista convidado, seletor de idioma, alternadores para letras explícitas, instrumental e cover), Copyright (número de registro e data de copyright) e Letras (área de texto das letras completas).",
        "mockup": "track-tab-distribution"
      },
      {
        "heading": "Portal",
        "body": "A aba Portal controla como os clientes interagem com esta faixa específica. No topo, a seção Aprovação do Cliente mostra o status de aprovação atual (ex. \"Aprovado\" em verde) junto com um histórico com marca de tempo de todos os eventos de aprovação: aprovado, mudanças solicitadas (com a nota do cliente), reaberto para revisão e re-aprovado, cada um com datas. Abaixo, a Visibilidade do Portal da Faixa permite alternar se esta faixa é visível no portal, se downloads estão habilitados e quais versões de áudio específicas (Versão 1, Versão 2, Versão 3, etc.) o cliente pode acessar, cada uma com seu próprio alternador. Uma nota na parte inferior lembra que a ativação do portal e o link de compartilhamento podem ser encontrados no cabeçalho da página do lançamento.",
        "mockup": "track-tab-portal"
      },
      {
        "heading": "Notas",
        "body": "A aba Notas é um espaço de uso geral para notas de revisão e discussão que não está vinculado a um timecode específico. No topo há uma área de texto com placeholder \"Adicione uma nota...\" e um botão \"Postar\". As notas aparecem abaixo em ordem cronológica reversa. Cada nota mostra o nome do autor, uma data ou tempo relativo e a mensagem. Notas de clientes são visualmente distinguidas com um distintivo verde \"Cliente\" para que você possa distinguir feedback interno de externo rapidamente. Use esta aba para direções gerais de revisão, itens de tarefas e discussão que não precisa referenciar um momento específico no áudio. Para feedback específico de tempo, use os comentários da forma de onda da aba Áudio em vez disso.",
        "mockup": "track-tab-notes"
      }
    ]
  },
  {
    "id": "client-portal",
    "title": "Portal do Cliente e Aprovações",
    "category": "releases",
    "summary": "Compartilhe seu lançamento com clientes via link único, controle o que eles veem e rastreie aprovações por faixa.",
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
        "heading": "Ativando o Portal",
        "body": "Na página de detalhes do lançamento, procure pelo alternador Portal na área do cabeçalho (canto superior direito). Clique no alternador para ativá-lo (fica verde quando ativo). Uma vez ativo, clique no ícone de link ao lado do alternador para copiar a URL de compartilhamento única. Envie este link para seu cliente para acesso de revisão sem exigir uma conta Mix Architect. O portal mostra o brief do lançamento, lista de faixas, players de áudio e um sistema de comentários. Use as configurações do portal para controlar quais seções de nível de lançamento são visíveis para clientes: direção de mix, especificações, referências, status de pagamento, metadados de distribuição e letras.",
        "mockup": "portal-settings"
      },
      {
        "heading": "Visibilidade por Faixa",
        "body": "Para cada faixa, vá à aba Portal para controlar o que seu cliente pode ver. A seção Visibilidade do Portal da Faixa tem alternadores para: \"Visível no portal\" (mostrar ou ocultar toda a faixa), \"Habilitar download\" (permitir ou bloquear downloads de áudio) e alternadores de versões individuais (Versão 1, Versão 2, Versão 3, etc.) para controlar quais revisões de áudio o cliente pode acessar. Isso oferece controle detalhado para que você possa ocultar trabalhos em progresso e compartilhar apenas mixagens finalizadas. Todos os alternadores são independentes, então você pode tornar uma faixa visível mas desabilitar downloads, ou mostrar apenas a versão mais recente.",
        "mockup": "portal-track-visibility"
      },
      {
        "heading": "Aprovações de Faixas",
        "body": "Clientes podem aprovar ou solicitar mudanças em faixas individuais através do portal. O status de aprovação é rastreado na seção Aprovação do Cliente da aba Portal de cada faixa. O status mostra um distintivo colorido (ex. \"Aprovado\" em verde) com um histórico completo com marca de tempo de cada evento de aprovação: quando o cliente aprovou, quando solicitou mudanças (incluindo sua nota, como \"Vocais muito baixos\"), quando a faixa foi reaberta para revisão e quando foi re-aprovada. Isso oferece uma trilha de auditoria clara de todas as decisões do cliente. Distintivos de aprovação também aparecem na lista de faixas na página de detalhes do lançamento, então você pode ver rapidamente quais faixas estão aprovadas.",
        "mockup": "portal-approval"
      }
    ]
  },
  {
    "id": "templates",
    "title": "Usando Templates de Lançamento",
    "category": "releases",
    "summary": "Economize tempo criando lançamentos a partir de templates reutilizáveis com especificações e configurações pré-configuradas.",
    "tags": [
      "templates",
      "reuse",
      "workflow",
      "presets"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "O que os Templates Incluem",
        "body": "Um template captura um conjunto abrangente de padrões de lançamento em seis seções recolhíveis. Básicos: nome do template, descrição, caixa de seleção \"Definir como template padrão\" (auto-selecionado para novos lançamentos) e nome e email do artista/cliente. Configurações do Lançamento: tipo de lançamento (Single, EP ou Álbum), formato (Estéreo, Dolby Atmos ou Estéreo + Atmos) e tags de gênero. Especificações Técnicas: taxa de amostragem, profundidade de bits, seleções de formato de entrega (WAV, AIFF, FLAC, MP3, AAC, OGG, DDP, ADM BWF/Atmos, MQA, ALAC) e requisitos especiais. Padrões de Intenção: tags de qualidade emocional pré-selecionadas para novas faixas. Metadados de Distribuição: distribuidor, gravadora, detentor de direitos autorais, idioma, gênero primário e contatos de direitos e publicação. Padrões de Pagamento: status de pagamento, moeda e notas de pagamento. Quando você cria um lançamento a partir de um template, todos esses padrões são aplicados automaticamente.",
        "mockup": "template-contents"
      },
      {
        "heading": "Criando e Gerenciando Templates",
        "body": "Há duas maneiras de criar um template. De qualquer página de detalhes do lançamento, clique no botão \"Salvar como Template\" no cabeçalho (ao lado da engrenagem de configurações) para capturar a configuração atual daquele lançamento. Ou vá à página [Templates](/app/templates) e clique em \"+ Novo Template\" para construir um do zero usando o formulário completo de template. Cada cartão de template na página [Templates](/app/templates) mostra seu nome, descrição e uma linha de resumo como \"Single, Estéreo + Atmos, 96 kHz / 24-bit, 4 formatos de entrega\". Use o menu de três pontos em qualquer cartão de template para opções como editar ou excluir. Dê nomes descritivos aos templates como \"Master Estéreo\" ou \"EP Atmos\" para mantê-los organizados.",
        "mockup": "template-create"
      },
      {
        "heading": "Criando um Lançamento de um Template",
        "body": "Ao criar um novo lançamento do [Dashboard](/app), se você tem templates salvos, um seletor \"Começar de um template\" é mostrado como primeiro passo. Ele diz \"Pré-preencha as configurações do seu lançamento, ou comece do zero.\" Selecione um cartão de template e clique em \"Usar Template\" para pré-preencher o formulário de novo lançamento com essas configurações, ou clique em \"Começar do zero\" para pular. O formulário de criar lançamento também tem um link \"Alterar template\" na parte inferior se você quiser trocar. Quaisquer configurações do template podem ser personalizadas após o lançamento ser criado.",
        "tip": "Marque seu template mais usado como padrão (caixa de seleção \"Definir como template padrão\") para que seja auto-selecionado sempre que você criar um novo lançamento.",
        "mockup": "template-use"
      }
    ]
  },
  {
    "id": "payment-tracking",
    "title": "Rastreamento de Pagamentos",
    "category": "releases",
    "summary": "Rastreie taxas, pagamentos e saldos pendentes em seus lançamentos.",
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
        "heading": "Habilitando Rastreamento de Pagamentos",
        "body": "Vá às [Configurações](/app/settings) e encontre a seção Rastreamento de Pagamentos. A seção diz: \"Rastreie taxas e status de pagamento em lançamentos e faixas. Desligue isso se você estiver mixando seus próprios projetos.\" Ative \"Habilitar rastreamento de pagamentos\". Uma vez habilitado, recursos relacionados a pagamento aparecem por todo o app: estatísticas de taxas no [Dashboard](/app) (Pendente, Recebido, Total de Taxas), uma seção Pagamento na barra lateral do inspetor em cada lançamento e a página [Pagamentos](/app/payments) na navegação da barra lateral.",
        "mockup": "payment-dashboard"
      },
      {
        "heading": "Definindo Taxas de Lançamento",
        "body": "Abra as Configurações do Lançamento (clique no ícone da engrenagem em qualquer lançamento). Role para baixo até a seção Pagamento. Defina o Status do Pagamento: Sem Taxa, Não Pago, Parcial ou Pago. Use a área de texto Notas de Pagamento para registrar termos, informações de depósito ou datas de vencimento. O valor da taxa e informações de pagamento também são visíveis na barra lateral do inspetor na página de detalhes do lançamento sob o título Pagamento, onde você pode clicar no status para alterá-lo rapidamente.",
        "mockup": "payment-release-fees"
      },
      {
        "heading": "Dashboard de Pagamentos",
        "body": "Acesse a página [Pagamentos](/app/payments) da barra lateral. No topo, três cartões de resumo mostram Pendente (total não pago), Recebido (total pago) e Total de Taxas em todos os lançamentos, cada um com uma contagem de lançamentos. Abaixo, uma tabela lista cada lançamento com dados de pagamento: nome do Lançamento, Data, Artista, Taxa, Pago, Saldo e Status (com distintivos coloridos como \"Parcial\" em laranja). Uma linha Total na parte inferior soma todas as taxas. Use o botão \"Exportar CSV\" para baixar dados de pagamento como planilha, ou \"Baixar PDF\" para gerar um resumo de pagamento pronto para impressão.",
        "tip": "Clique nos cartões de estatísticas Pendente ou Recebido no [Dashboard](/app) para filtrar rapidamente lançamentos que correspondem a esse status de pagamento.",
        "mockup": "payment-track-fees"
      }
    ]
  },
  {
    "id": "distribution-tracker",
    "title": "Rastreador de Distribuição",
    "category": "releases",
    "summary": "Acompanhe onde seu lançamento foi enviado, monitore o status em todas as plataformas e receba notificações quando ele ficar disponível no Spotify.",
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
        "heading": "Adicionando Plataformas a um Lançamento",
        "body": "Abra qualquer lançamento e role para baixo até o painel Rastreador de Distribuição abaixo da lista de faixas. Clique em \"+ Adicionar Plataforma\" para adicionar uma plataforma de streaming. Escolha entre Spotify, Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud ou Bandcamp. Cada plataforma aparece como uma linha com seu logotipo oficial, um indicador de status e uma tag de distribuidor. Você também pode usar \"Marcar como Enviado\" para adicionar várias plataformas de uma vez: selecione um distribuidor (DistroKid, TuneCore, CD Baby, LANDR, Ditto, AWAL, UnitedMasters, Amuse, RouteNote ou Self-released), marque as plataformas para as quais você enviou e clique em Enviar.",
        "mockup": "distribution-add-platform"
      },
      {
        "heading": "Estados de Status",
        "body": "Cada entrada de plataforma tem um status que rastreia onde ela está no pipeline de lançamento. Os seis estados são: Não Enviado (cinza, padrão para plataformas recém-adicionadas), Enviado (azul, você enviou o lançamento para seu distribuidor), Processando (laranja, o distribuidor está revisando ou processando), Disponível (verde, o lançamento está disponível na plataforma), Rejeitado (vermelho, a plataforma ou distribuidor rejeitou o lançamento) e Removido (vermelho, o lançamento estava disponível anteriormente, mas foi removido). Clique no indicador de status em qualquer linha de plataforma para alterá-lo. As mudanças de status são registradas no histórico da plataforma para que você possa ver quando cada transição aconteceu.",
        "mockup": "distribution-status"
      },
      {
        "heading": "Detecção Automática do Spotify",
        "body": "O Spotify é listado no topo do Rastreador de Distribuição com um rótulo \"Atualiza automaticamente\". Depois que você marcar o Spotify como Enviado, o Mix Architect verifica periodicamente o catálogo do Spotify em busca do seu lançamento usando o código ISRC (da aba Distribuição da faixa) ou o título do lançamento e nome do artista. Quando seu lançamento é encontrado no Spotify, o status muda automaticamente para Disponível, a URL do Spotify é salva e você recebe uma notificação. Você também pode clicar em \"Verificar Agora\" para acionar uma verificação imediata. A detecção automática é executada diariamente para todas as entradas do Spotify marcadas como enviadas.",
        "tip": "Preencha o código ISRC na aba Distribuição da sua faixa antes de enviar. A detecção baseada em ISRC é mais confiável do que a correspondência por título/artista, especialmente para nomes comuns.",
        "mockup": "distribution-spotify"
      },
      {
        "heading": "Atualizando Status e Adicionando Links",
        "body": "Para alterar o status de uma plataforma, clique no indicador de status na linha da plataforma. Uma fileira de pills de status aparece onde você pode selecionar o novo estado. Para adicionar um link ao lançamento nessa plataforma, clique em \"Adicionar link\" ao lado do nome da plataforma. Digite a URL (por exemplo, o link do álbum no Spotify ou a página no Apple Music) e clique em Salvar. O ícone de link se transforma em um link externo clicável que abre a página do lançamento nessa plataforma. Use o menu de três pontos em qualquer linha de plataforma para opções adicionais: editar detalhes, remover a plataforma ou visualizar o histórico de alterações de status.",
        "mockup": "distribution-edit"
      },
      {
        "heading": "Envio em Lote e Atualização",
        "body": "\"Marcar como Enviado\" permite que você registre um envio em lote para seu distribuidor. Selecione o distribuidor no menu suspenso, marque as plataformas para as quais você enviou e clique em Enviar. Todas as plataformas selecionadas são adicionadas com o status Enviado e a tag do distribuidor. \"Verificar Agora\" aparece nas entradas do Spotify que foram marcadas como enviadas. Clicar nele aciona uma busca imediata no catálogo do Spotify. Se encontrado, o status é atualizado para Disponível e a URL é salva automaticamente. Para todas as outras plataformas (Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud, Bandcamp), atualize o status manualmente quando confirmar que o lançamento está disponível.",
        "mockup": "distribution-bulk"
      },
      {
        "heading": "Tags de Distribuidor",
        "body": "Cada entrada de plataforma pode ter uma tag de distribuidor mostrando qual serviço você usou para enviar (DistroKid, TuneCore, CD Baby, etc.). Ela aparece como uma pequena pill ao lado do indicador de status. As tags de distribuidor são definidas automaticamente quando você usa \"Marcar como Enviado\", ou você pode defini-las individualmente ao editar uma entrada de plataforma. Isso ajuda a rastrear qual distribuidor cuidou de qual plataforma, especialmente se você usa distribuidores diferentes para diferentes territórios ou plataformas.",
        "warning": "As análises refletem apenas os dados que você rastreou no Mix Architect. Se você enviar pelo painel do distribuidor, lembre-se de atualizar o status aqui para que seu rastreador fique preciso.",
        "mockup": "distribution-distributor"
      }
    ]
  },
  {
    "id": "user-analytics",
    "title": "Análises do Usuário",
    "category": "releases",
    "summary": "Visualize seus lançamentos concluídos, tempo médio de entrega, receita total e detalhamento por cliente no painel de Análises.",
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
        "heading": "O que a Página de Análises Mostra",
        "body": "Acesse a página de [Análises](/app/analytics) pela barra lateral. O painel exibe quatro cartões de resumo no topo: Lançamentos Concluídos (total de projetos finalizados com média mensal), Tempo Médio de Entrega (dias da criação à conclusão, com detalhamento do mais rápido e mais lento), Receita Total (soma de todas as taxas rastreadas com saldo pendente) e Clientes (contagem de clientes únicos com total de lançamentos). Abaixo dos cartões de resumo, três gráficos visualizam seus dados ao longo do tempo, e uma tabela de detalhamento por cliente mostra estatísticas individuais.",
        "mockup": "analytics-overview"
      },
      {
        "heading": "Velocidade de Lançamento e Tempo de Entrega",
        "body": "O gráfico de Velocidade de Lançamento é um gráfico de barras mostrando quantos lançamentos você concluiu a cada mês dentro do período selecionado. Barras mais altas significam meses mais produtivos. Use isso para identificar tendências na sua produção e identificar períodos movimentados ou tranquilos. O gráfico de Tempo de Entrega mostra a média de dias da criação do lançamento à conclusão por mês. Barras mais baixas significam entrega mais rápida. Juntos, esses gráficos ajudam você a entender sua capacidade e se seu fluxo de trabalho está ficando mais rápido ou mais lento ao longo do tempo.",
        "mockup": "analytics-velocity"
      },
      {
        "heading": "Gráfico de Receita",
        "body": "O gráfico de Receita é um gráfico de área mostrando o total de taxas recebidas por mês. Ele rastreia os valores de pagamento registrados nos seus lançamentos, então reflete o que os clientes realmente pagaram. Use isso para ver tendências de receita, identificar seus meses de maior faturamento e planejar para períodos mais tranquilos. Os dados de receita vêm do recurso de rastreamento de pagamentos em cada lançamento, então certifique-se de que as taxas e os status de pagamento estejam atualizados para relatórios precisos.",
        "mockup": "analytics-revenue"
      },
      {
        "heading": "Detalhamento por Cliente",
        "body": "A tabela de Detalhamento por Cliente na parte inferior da página de Análises lista cada cliente com suas métricas principais: número de lançamentos, receita total, valor pago e tempo médio de entrega. Isso ajuda você a identificar quais clientes geram mais trabalho e receita, quem paga em dia e onde seu tempo é gasto. Clique em qualquer linha de cliente para ver seus lançamentos. A tabela é ordenada por receita por padrão.",
        "mockup": "analytics-clients"
      },
      {
        "heading": "Seletor de Período",
        "body": "Use o seletor de período no canto superior direito para controlar qual período as análises cobrem. Os períodos predefinidos incluem Últimos 7 Dias, Últimos 30 Dias, Últimos 90 Dias e Últimos 365 Dias. Você também pode definir um período personalizado selecionando datas de início e fim específicas. Todos os quatro cartões de resumo e os três gráficos são atualizados para refletir o período selecionado. O seletor de período funciona da mesma forma em todo o painel de análises.",
        "tip": "Use o período de 365 dias para revisões anuais e preparação de impostos. O período de 30 dias é útil para verificações mensais da saúde do seu negócio.",
        "mockup": "analytics-date-range"
      }
    ]
  },
  {
    "id": "upload-audio-tracks",
    "title": "Fazendo Upload e Gerenciando Áudio",
    "category": "audio",
    "summary": "Como fazer upload de arquivos de áudio, gerenciar versões e usar o player de forma de onda.",
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
        "heading": "Fazendo Upload de Áudio",
        "body": "Abra qualquer faixa e vá à aba Áudio. Clique na área de upload ou arraste e solte um arquivo diretamente nela. Formatos suportados: WAV, AIFF, FLAC, MP3, AAC e M4A, até 500 MB por arquivo. O arquivo é enviado para armazenamento seguro na nuvem, e uma visualização de forma de onda é gerada automaticamente. Metadados do arquivo (formato, taxa de amostragem, profundidade de bits, duração) são capturados e exibidos abaixo das informações da versão, por exemplo: \"Typical Wonderful 2025-10-10 MGO.wav, WAV, 48kHz, 24-bit\".",
        "mockup": "audio-upload"
      },
      {
        "heading": "Versões de Faixa",
        "body": "Cada vez que você faz upload de um novo arquivo para a mesma faixa, ele se torna a próxima versão. O seletor de versão acima da forma de onda mostra botões numerados (v1, v2, v3, etc.) mais um botão + para fazer upload de outra versão. Clique em qualquer versão para alternar para ela. Cada versão exibe seu número de versão, data de upload, contagem de comentários e um ícone de download para baixar o arquivo original. Versões anteriores são totalmente preservadas com seus próprios comentários e forma de onda.",
        "tip": "Faça upload de mixagens revisadas para a mesma faixa em vez de criar uma nova faixa. Isso mantém seu histórico de versões limpo, preserva comentários em versões antigas e permite comparar mixagens ao longo do tempo.",
        "mockup": "track-versions"
      },
      {
        "heading": "Player de Forma de Onda",
        "body": "Cada versão enviada exibe uma forma de onda interativa. Clique em qualquer lugar na forma de onda para buscar essa posição. Os controles de transporte abaixo da forma de onda incluem: tempo atual, alternador de loop, pular para trás, reproduzir/pausar, pular para frente, alternador de repetir e duração total. O player também mostra uma medição de volume LUFS integrado (ex. \"-14.8 LUFS\") ao lado dos metadados do arquivo, com código de cores contra alvos de volume para que você possa avaliar níveis rapidamente. Se há comentários com marca de tempo na versão atual, pequenos ícones marcadores aparecem na forma de onda em suas posições.",
        "mockup": "track-tab-audio"
      }
    ]
  },
  {
    "id": "audio-converter",
    "title": "Formatos de Entrega e Conversão",
    "category": "audio",
    "summary": "Configure formatos de entrega, converta áudio e incorpore automaticamente tags de metadados como artista, capa, ISRC e letras.",
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
        "heading": "Definindo Formatos de Entrega",
        "body": "Abra qualquer faixa e vá à aba Especificações. Role até a seção Entrega. Aqui você seleciona quais formatos de saída seu projeto precisa clicando nos chips de formato. Formatos conversíveis disponíveis: WAV, AIFF, FLAC, MP3, AAC, OGG e ALAC. Formatos selecionados aparecem destacados em verde com um ícone de marca de verificação. Formatos não conversíveis adicionais (DDP, ADM BWF/Atmos, MQA) podem ser ativados para referência, eles exibem uma dica explicando que conversão automática não está disponível. Você também pode digitar um nome de formato personalizado no campo de entrada \"Formato personalizado...\" e clicar em \"+ Adicionar\" para qualquer formato não listado. Use o menu suspenso \"Exportar de\" para escolher de qual versão de áudio converter, como \"v3 - filename.wav (mais recente)\".",
        "mockup": "format-convert"
      },
      {
        "heading": "Convertendo e Baixando",
        "body": "Selecione quais formatos devem estar disponíveis clicando nos chips de formato na seção Entrega: formatos conversíveis incluem WAV, AIFF, FLAC, MP3, AAC, OGG e ALAC. Formatos selecionados aparecem destacados em verde com uma marca de verificação. Clique no ícone da seta de download ao lado de qualquer formato conversível selecionado para iniciar uma conversão. O ícone mostra um spinner enquanto a conversão está processando em segundo plano. Quando a conversão termina, o arquivo baixa automaticamente para seu navegador. Cada conversão usa a versão de áudio que você selecionou no menu suspenso \"Exportar de\", convertendo do arquivo original enviado para preservar máxima qualidade de áudio. Formatos sem perda (WAV, AIFF, FLAC, ALAC) preservam a taxa de amostragem e profundidade de bits do arquivo fonte. Formatos com perda usam presets otimizados: MP3 exporta a 44.1 kHz / 320 kbps, AAC a 44.1 kHz / 256 kbps e OGG a 44.1 kHz / Qualidade 8.",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Incorporação Automática de Metadados",
        "body": "Quando você converte para MP3, FLAC, AAC, OGG ou ALAC, o Mix Architect automaticamente escreve tags de metadados padrão da indústria no arquivo de saída. Isso inclui: artista, título, álbum, número da faixa, gênero, ano de lançamento, copyright, ISRC, UPC/código de barras, letras, capa e ReplayGain. ReplayGain é uma tag de volume que informa players compatíveis quanto ajustar o volume para que faixas sejam reproduzidas em um nível consistente sem distorção. O Mix Architect calcula isso a partir do LUFS medido do seu áudio usando o padrão ReplayGain 2.0 (nível de referência de -18 LUFS). Arquivos MP3 recebem tags ID3v2, FLAC e OGG usam comentários Vorbis, e AAC/ALAC usam átomos MP4 estilo iTunes. Todos os metadados são extraídos dos detalhes do seu lançamento e faixa (incluindo a aba Distribuição para ISRC e letras, e a capa do lançamento). Exportações WAV e AIFF não incluem tags de metadados. Após uma conversão terminar, passe o mouse sobre o ícone de tag ao lado do chip de formato para ver exatamente quais tags foram incorporadas.",
        "tip": "Preencha sua aba Distribuição (ISRC, letras) e envie a capa antes de exportar. Quanto mais metadados você fornecer, mais completos seus arquivos exportados serão para distribuição."
      },
      {
        "heading": "Referência de Formatos Suportados",
        "body": "Formatos sem perda preservam qualidade da fonte: WAV (PCM, taxa/profundidade da fonte), AIFF (PCM, taxa/profundidade da fonte), FLAC (taxa da fonte), ALAC (taxa da fonte). Formatos com perda usam presets fixos otimizados para distribuição: MP3 (44.1 kHz, 320 kbps, estéreo), AAC (44.1 kHz, 256 kbps, estéreo), OGG Vorbis (44.1 kHz, qualidade 8, estéreo). Formatos não conversíveis (apenas tag, sem auto-conversão): DDP, ADM BWF (Atmos), MQA. As Configurações Técnicas (taxa de amostragem e profundidade de bits) no topo da aba Especificações são metadados de referência descrevendo o áudio fonte, eles não controlam saída de conversão. A área de texto Requisitos Especiais abaixo dos formatos de entrega permite adicionar notas sobre instruções de entrega.",
        "warning": "Converter de um formato com perda (MP3, AAC, OGG) para um formato sem perda (WAV, FLAC) não melhora a qualidade do áudio. Os artefatos de compressão original permanecem. Sempre envie seu arquivo fonte de maior qualidade.",
        "mockup": "supported-formats"
      }
    ]
  },
  {
    "id": "audio-review-comments",
    "title": "Deixando Comentários com Marca de Tempo",
    "category": "audio",
    "summary": "Adicione feedback com código de tempo diretamente na forma de onda para que colaboradores saibam exatamente onde ouvir.",
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
        "heading": "Adicionando um Comentário",
        "body": "Abra uma faixa e vá à aba Áudio. Clique duas vezes na forma de onda no ponto exato que você quer referenciar. Um campo de entrada de texto aparece na seção Feedback abaixo da forma de onda onde você pode digitar seu comentário. O comentário é ancorado naquele timecode e versão. Na seção Feedback, cada comentário mostra o nome do autor, um distintivo de timestamp colorido (ex. \"0:07\" ou \"1:22\"), a data relativa e o texto da mensagem. Marcadores de comentários também aparecem como pequenos ícones diretamente na forma de onda em suas posições. Clique em qualquer timestamp para pular a cabeça de reprodução para aquele momento.",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "Comentários do Portal",
        "body": "Clientes revisando através do portal também podem deixar comentários com marca de tempo na forma de onda. Seus comentários aparecem na mesma seção Feedback junto com comentários da equipe mas são visualmente distinguidos com um distintivo \"Cliente\" para que você possa identificar rapidamente feedback externo. Isso mantém todo o feedback, interno e externo, organizado em um lugar sob a versão de áudio relevante.",
        "mockup": "portal-comments"
      },
      {
        "heading": "Notas vs Comentários de Áudio",
        "body": "A aba Áudio é para feedback com marca de tempo vinculado a momentos específicos na forma de onda: \"aumentar os vocais em 1:22\" ou \"a caixa está muito alta aqui\". A aba Notas é para discussão geral e notas de revisão que não estão vinculadas a um timecode: \"no geral a mixagem precisa de mais graves\" ou \"cliente quer uma abordagem mais agressiva\". Comentários de áudio são específicos da versão (vinculados à v1, v2, etc.), enquanto Notas se aplicam à faixa como um todo. Use a aba Intenção para documentar a visão criativa geral, tags emocionais e faixas de referência.",
        "tip": "Para um panorama completo do feedback em uma faixa, verifique tanto a seção Feedback da aba Áudio (para notas específicas de tempo) quanto a aba Notas (para discussão geral). Feedback do cliente pode aparecer em qualquer lugar.",
        "mockup": "resolve-feedback"
      }
    ]
  },
  {
    "id": "timeline-overview",
    "title": "Usando a Visualização Timeline",
    "category": "timeline",
    "summary": "Alterne para a visualização timeline no seu dashboard para visualizar cronogramas de lançamentos e contagem regressiva para datas de lançamento.",
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
        "heading": "Alternando para Visualização Timeline",
        "body": "No [Dashboard](/app), procure pelos dois botões de alternância de visualização na área do cabeçalho (abaixo das estatísticas de pagamento). Clique no ícone da timeline (o segundo botão) para alternar da visualização em grade para a visualização timeline. A timeline exibe seus lançamentos cronologicamente com base em suas datas de lançamento planejadas. Lançamentos sem uma data planejada aparecem em uma seção separada \"Não Programados\" na parte inferior. Sua preferência de visualização é salva automaticamente, então o dashboard lembrará sua escolha na próxima vez que visitar.",
        "mockup": "timeline-full"
      },
      {
        "heading": "Lendo a Timeline",
        "body": "Cada lançamento aparece como um cartão posicionado por sua data de lançamento planejada. A timeline mostra uma contagem regressiva: \"X dias até o lançamento\" para datas futuras ou \"Lançado há X dias\" para datas passadas. Cartões de lançamento exibem as mesmas informações da visualização em grade (título, artista, status, formato, contagem de faixas) mais o contexto de programação. Pontos de status são codificados por cor: laranja para Rascunho, azul para Em Progresso e verde para Pronto. Lançamentos fixados aparecem no topo da timeline.",
        "mockup": "timeline-navigate"
      },
      {
        "heading": "Definindo Datas Planejadas",
        "body": "Para adicionar um lançamento à timeline, defina uma data de lançamento planejada ao criar o lançamento ou nas Configurações do Lançamento (ícone da engrenagem na página do lançamento). O campo Data de Lançamento Planejada usa um seletor de data. A timeline atualiza automaticamente conforme você ajusta datas. Isso ajuda você a visualizar seu cronograma e evitar janelas de lançamento sobrepostas em múltiplos projetos.",
        "tip": "Use a visualização timeline durante o planejamento para espaçar seus lançamentos. Ter visibilidade clara dos prazos futuros ajuda a prevenir gargalos no seu fluxo de trabalho de mixagem, masterização ou distribuição.",
        "mockup": "timeline-dates"
      }
    ]
  },
  {
    "id": "export-data",
    "title": "Exportando os Dados da Sua Conta",
    "category": "account",
    "summary": "Baixe uma exportação ZIP completa dos seus lançamentos, faixas, arquivos de áudio e registros de pagamento.",
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
        "heading": "O que Está Incluído",
        "body": "A exportação de dados é um arquivo ZIP contendo todos os metadados dos seus lançamentos, detalhes das faixas, arquivos de áudio (todas as versões) e registros de pagamento. Antes de baixar, o app mostra uma estimativa do tamanho da exportação junto com contagens: número de lançamentos, faixas e arquivos de áudio incluídos. Isso oferece um backup completo de tudo na sua conta.",
        "mockup": "export-contents"
      },
      {
        "heading": "Iniciando uma Exportação",
        "body": "Vá às [Configurações](/app/settings) e role até a seção \"Seus Dados\". Clique em \"Exportar Meus Dados\" para começar. O app primeiro calcula uma estimativa mostrando o tamanho aproximado do arquivo e contagens (ex. \"3 lançamentos, 12 faixas, 8 arquivos de áudio\"). Revise a estimativa, então clique em \"Baixar\" para iniciar a exportação. Uma barra de progresso mostra o status do download. Para contas grandes com muitos arquivos de áudio, a exportação pode demorar. O arquivo ZIP baixa para seu navegador automaticamente quando completo. Você pode clicar em \"Cancelar\" para voltar sem baixar.",
        "mockup": "export-progress"
      },
      {
        "heading": "Privacidade de Dados",
        "body": "Sua exportação contém apenas dados que você possui ou criou. Contribuições de colaboradores (como comentários nos seus lançamentos) estão incluídas, mas dados privados de outros usuários não estão. A exportação é gerada sob demanda e não é armazenada em nossos servidores após o download.",
        "tip": "Execute uma exportação de dados periodicamente como backup dos seus projetos e arquivos de áudio. Isso é especialmente útil antes de fazer grandes mudanças na sua conta.",
        "mockup": "export-privacy"
      }
    ]
  },
  {
    "id": "user-settings",
    "title": "Configurações do Usuário",
    "category": "account",
    "summary":
      "Configure seu perfil, aparência, notificações por e-mail, padrões de mixagem e mais.",
    "tags": ["settings", "profile", "email", "notifications", "preferences", "theme", "appearance", "defaults"],
    "updatedAt": "2026-03-14",
    "content": [
      {
        "heading": "Visão Geral das Configurações",
        "body": "Abra [Configurações do Usuário](/app/settings) pela barra lateral ou pelo menu de conta na barra superior. As configurações são organizadas em painéis: Perfil, Assinatura, Aparência, Região e Moeda, Persona, Acompanhamento de Pagamentos, Preferências de E-mail, Integrações, Padrões de Mixagem, Calendário e Dados. As alterações são salvas instantaneamente conforme você interage com cada painel.",
        "mockup": "settings-overview"
      },
      {
        "heading": "Perfil",
        "body": "O painel de Perfil permite definir seu nome de exibição, que aparece em comentários, notificações e alertas por e-mail enviados a colaboradores. Seu endereço de e-mail é exibido, mas gerenciado pelo seu provedor de autenticação. Uma saudação personalizada usando seu primeiro nome aparece na barra superior."
      },
      {
        "heading": "Notificações por E-mail",
        "body": "O painel de Preferências de E-mail controla quais e-mails transacionais você recebe do Mix Architect. Cada categoria possui um botão liga/desliga. As categorias incluem: Alertas de Lançamento ao Vivo (quando um lançamento entra no ar em uma plataforma), Alertas de Novos Comentários (quando alguém comenta no seu lançamento), Resumo Semanal (um resumo de atividades em todos os seus lançamentos), Lembretes de Pagamento (quando um pagamento de assinatura falha), Confirmações de Pagamento (quando um pagamento é processado), Confirmações de Assinatura (quando seu plano é ativado) e Avisos de Cancelamento (quando seu plano é cancelado). Todas as categorias são habilitadas por padrão. Cada e-mail inclui um link de cancelamento de inscrição na parte inferior.",
        "mockup": "settings-email-prefs",
        "tip": "Você também pode cancelar a inscrição de uma categoria específica de e-mail clicando no link de cancelamento na parte inferior de qualquer e-mail de notificação. Não é necessário fazer login."
      },
      {
        "heading": "Padrões de Mixagem",
        "body": "Defina seu formato padrão (Estéreo, Dolby Atmos ou Estéreo + Atmos), taxa de amostragem e profundidade de bits. Esses padrões são aplicados automaticamente quando você cria novos lançamentos, economizando tempo em configurações repetitivas. Você sempre pode alterá-los em lançamentos individuais."
      },
      {
        "heading": "Aparência e Região",
        "body": "Aparência permite alternar entre os temas Claro, Escuro e Sistema. Região e Moeda define sua moeda preferida para acompanhamento de pagamentos. Ambas as preferências são salvas na sua conta e aplicadas em todos os dispositivos."
      }
    ]
  },
  {
    "id": "manage-subscription",
    "title": "Gerenciando Sua Assinatura Pro",
    "category": "billing",
    "summary": "Visualize seu plano, atualize detalhes de pagamento e gerencie sua assinatura Pro através do Stripe.",
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
        "heading": "Visualizando Seu Plano",
        "body": "Vá às [Configurações](/app/settings) e role até a seção Assinatura na parte inferior. A seção diz \"Gerencie seu plano Mix Architect.\" Você verá seu plano atual: contas Pro exibem \"$14/mês, Lançamentos ilimitados\" com um distintivo verde \"PRO\" e um botão \"Gerenciar Cobrança\". Contas gratuitas mostram um botão \"Fazer Upgrade para Pro\" em vez disso.",
        "mockup": "plan-current"
      },
      {
        "heading": "Fazendo Upgrade para Pro",
        "body": "Da página [Configurações](/app/settings), clique em \"Fazer Upgrade para Pro\" na seção Assinatura. Você será levado a uma página de checkout segura do Stripe. Uma vez que o pagamento é confirmado, sua conta é atualizada imediatamente e você ganha acesso a todos os recursos Pro, incluindo lançamentos ilimitados e conversão de áudio. O distintivo Pro aparece ao lado das informações do seu plano.",
        "mockup": "upgrade-pro"
      },
      {
        "heading": "Gerenciando Pagamento",
        "body": "Clique em \"Gerenciar Cobrança\" na seção Assinatura das [Configurações](/app/settings) para abrir o portal de cobrança do Stripe. De lá você pode atualizar seu método de pagamento, visualizar faturas e baixar recibos. Todo processamento de pagamento é tratado de forma segura pelo Stripe.",
        "mockup": "manage-payment"
      }
    ]
  },
  {
    "id": "cancel-resubscribe",
    "title": "Cancelando e Renovando Assinatura",
    "category": "billing",
    "summary": "Como cancelar sua assinatura Pro e o que acontece com seus dados.",
    "tags": [
      "cancel",
      "resubscribe",
      "downgrade",
      "billing"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Cancelando Sua Assinatura",
        "body": "Clique em \"Gerenciar Cobrança\" na seção Assinatura das [Configurações](/app/settings) para abrir o portal do Stripe, então clique em \"Cancelar plano\". Seu acesso Pro continua até o final do seu período de cobrança atual. Um aviso nas [Configurações](/app/settings) mostrará quando seu plano Pro expira para que você saiba exatamente quanto tempo seu acesso dura.",
        "mockup": "cancel-subscription"
      },
      {
        "heading": "O que Acontece com Seus Dados",
        "body": "Todos os seus lançamentos, faixas, arquivos de áudio, comentários e registros de pagamento são totalmente preservados. Você não perde nada ao fazer downgrade. No entanto, recursos Pro (como lançamentos ilimitados e conversão de áudio) ficarão indisponíveis até você renovar a assinatura. Seus lançamentos existentes permanecem acessíveis.",
        "warning": "Contas gratuitas são limitadas a um lançamento ativo. Se você tem mais de um lançamento quando seu plano Pro expira, seus lançamentos existentes são preservados mas você não poderá criar novos lançamentos até renovar a assinatura ou reduzir para um lançamento.",
        "mockup": "data-after-cancel"
      },
      {
        "heading": "Renovando Assinatura",
        "body": "Para reativar Pro, vá à seção Assinatura nas [Configurações](/app/settings) e clique em \"Fazer Upgrade para Pro\" novamente, ou use \"Gerenciar Cobrança\" para renovar através do portal do Stripe. Seus dados anteriores, configurações, templates e configurações de equipe estão todos intactos e imediatamente disponíveis.",
        "mockup": "resubscribe"
      }
    ]
  }
];
