# Fluxo de desenvolvimento e release

1. Criar uma issue para mudança funcional/correção.
2. Branch a partir de `main`: `feat/<issue>-descricao`, `fix/<issue>-descricao` ou `chore/<descricao>`.
3. Commits convencionais (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
4. Abrir PR com resumo, issue associada, testes, risco e instruções de homologação.
5. Rodar CI (lint, testes e smoke test conforme evolução). Nunca fazer merge se checks obrigatórios falharem.
6. Homologar o frontend e o comportamento real no homelab antes da release.
7. Merge squash em `main`, tag semver `vX.Y.Z`, release com changelog.
8. Implantar por tag, com rollback por versão anterior.

### Política de branches
`main` = linha estável; branches curtas por issue. Não editar diretamente a main em implementação normal.

### Versão
`0.x` enquanto MVP. `0.1.0` = baseline navegável homologada; incrementos patches corretivos, minors novas funcionalidades.
