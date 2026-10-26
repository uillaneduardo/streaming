# CenaLivre — Especificação do produto

## Visão
Streaming gratuito para séries independentes com portal público e Studio de gestão.

## MVP
- Portal: início, explorar, série, assistir, busca e filtro por categorias.
- Studio: dashboard, séries, temporadas, episódios, mídia, agenda editorial, campanhas, equipes e configurações.
- Capas, banners e thumbnails por produção, persistidos em armazenamento próprio.
- Grade como padrão nas seções da home, opção de lista; responsividade.
- Reprodução de YouTube **não listado** via embed, respeitando permissão de incorporação. Vídeo privado não funciona livremente em iframe.
- Agendamento de exibição (início/fim opcional), divulgação antes da estreia sem player.
- Equipes colaborativas e RBAC com direitos por recurso na API.
- Sem planos, pagamentos, assinaturas ou conteúdo premium.

## Regras fundamentais
1. A API verifica escopo da equipe, permissão, status editorial e janelas de disponibilidade.
2. Rascunhos nunca aparecem em endpoints públicos.
3. A URL direta de um vídeo não listado pode contornar a janela do portal; agendamento não é DRM.
4. Publicações agendadas usam UTC, timezone de apresentação e jobs idempotentes.
5. Cada mídia tem origem, tipo, dimensões e vínculo de propriedade.
6. Regras de negócio críticas nunca dependem do frontend.
7. Imagens ilustrativas do protótipo são locais e não acessam CDN.

## Não objetivos do MVP
Cobranças, uploads de vídeo para o homelab, DRM, live streaming e transcodificação.
