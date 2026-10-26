# Artes do portal e ícones do Studio

## Referências de imagem
A imagem de **pôster vertical (2:3)**, **banner horizontal (16:9)** e **thumbnail de episódio (16:9)** são campos independentes. As seções **Em destaque** e **Todas as séries** usam o pôster cadastrado na série. A abertura usa a imagem da campanha CMS quando disponível, ou o banner da série destacada. As seções de episódios usam as respectivas thumbnails.

Caso um arquivo não exista ou não esteja acessível, a apresentação tenta outra imagem da própria produção. Se nenhuma servir, exibe um espaço reservado neutro — não um retângulo vazio — e o Studio sinaliza a imagem quebrada no seletor.

## Como corrigir no Studio
1. **Séries → Imagens** em cada linha ou **Visão geral → Imagens** no cartão de produção.
2. **Pôster** e **Banner**: selecione imagem existente na Biblioteca ou faça upload direto no campo. Salve as alterações.
3. **Episódios → Editar**: gerencie a thumbnail da mesma forma.
4. **CMS da página inicial → Banners**: gerencie imagem desktop e mobile de cada campanha.
5. **CMS da página inicial → Imagens das séries** leva à listagem para vincular artes aos cards do portal.

Os arquivos de mídia continuam armazenados no volume persistente; as referências ficam no banco de dados. A atualização não preenche automaticamente campos vazios no banco, nem substitui imagens do usuário.

## Ícones
Os ícones utilizados pelo Studio foram normalizados para um conjunto coerente **estilo Lucide** com SVG inline, traço de 1,8 px, tamanho uniforme e cor herdada dos componentes existentes. Não exige CDN, font files ou API externa. A tipografia, cores, proporções e demais componentes do layout permanecem inalterados.

## Deploy
```bash
cd ~/homelab/apps/streaming
git checkout main && git pull --ff-only origin main
bash scripts/deploy-verify.sh
```
