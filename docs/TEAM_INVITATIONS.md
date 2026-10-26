# Convites e acesso às equipes (M1)

## Para gestores e administradores

No Studio, abra **Equipes e permissões → Convidar**. Escolha uma equipe, o e-mail e o papel do novo integrante.

O CenaLivre gera um **link de uso único, válido por 72 horas**. Use **Copiar link** e compartilhe-o diretamente com a pessoa convidada. Não há disparo automático de e-mail nesta fase, para não depender de um provedor SMTP.

A tabela de convites mostra o estado (Pendente, Aceito, Revogado ou Expirado). Convites pendentes podem ser revogados. Por segurança, o link completo aparece apenas na criação e não é recuperável pela listagem.

O gestor pode convidar editores, publicadores e visualizadores **somente de equipes sob sua gestão**. Convidar outro gestor requer administrador global.

## Para o convidado

- **Sem conta:** abra o link, confirme o e-mail e a equipe, informe nome e crie senha de no mínimo 12 caracteres. Após aceitar, faça login normalmente no Studio.
- **Já possui conta:** clique em **Entrar para aceitar** e use a conta cujo e-mail corresponde ao convite. A aceitação adiciona o vínculo à equipe existente e não cria uma conta duplicada.
- O convite não concede automaticamente grants em séries de outras equipes. Um gestor precisa definir as permissões da produção separadamente.

## Segurança

- Token aleatório de 256 bits; persistido exclusivamente em forma de hash SHA-256.
- Operações administrativas requerem sessão e proteção CSRF; o convite é válido apenas para o endereço de e-mail especificado.
- Aceitação é transacional, de uso único, com expiração e revogação.
- Token fica no fragmento da URL (`#/convite/TOKEN`) e o navegador envia o segredo apenas no corpo de uma requisição POST, não no path da API.
- Limite de 100 convites pendentes por equipe e controle de taxa na consulta/aceitação.
- Alterações de convites e vínculos deixam trilha de auditoria.
- Links não devem ser publicados em locais públicos. Qualquer pessoa com a URL e sem conta prévia poderia criar a conta do endereço convidado; confirme a identidade por um canal confiável ao compartilhar o link. Para contas já existentes, o login autenticado é obrigatório.

## Endpoints

- `GET /api/v1/studio/invitations` — listagem sob autorização.
- `POST /api/v1/studio/invitations` — criação, retorna o token uma vez.
- `DELETE /api/v1/studio/invitations/:id` — revogação.
- `POST /api/v1/invitations/lookup` — verificação de token.
- `POST /api/v1/invitations/accept` — criação ou vínculo de usuário.

## Deploy

O script padrão executa automaticamente a migração aditiva `007_team_invitations.sql` e não modifica dados anteriores:

```bash
cd ~/homelab/apps/streaming
git checkout main
git pull --ff-only origin main
bash scripts/deploy-verify.sh
```

## Homologação

Os testes de integração verificam expiração/uso único, revogação, criação e login de usuário, vínculo de conta existente, CSRF, controle de papel e isolamento entre equipes. O Chromium testa também o fluxo real de convite no Studio, cadastro via celular e revogação de link.
