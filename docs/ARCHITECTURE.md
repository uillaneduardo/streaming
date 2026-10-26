# Arquitetura planejada

```text
Cloudflare Tunnel
  |-- Web público (HTML/CSS/JS no protótipo; frontend independente no produto)
  |-- Studio (CMS)
  +-- API (Fastify / TypeScript; autenticação, domínio, autorização)
        |-- MariaDB (Prisma, migrations)
        |-- Redis (cache/fila)
        |-- Worker (agendamentos)
        +-- Assets locais/armazenamento abstraído
```

### Módulos de domínio
identity, teams, grants, productions, series, seasons, episodes, media, editorial, schedule, cms, audit.

### Tabelas principais
users, sessions, teams, team_members, roles, permissions, series, series_teams, series_grants, seasons, episodes, video_sources, media_assets, publication_windows, home_sections, campaigns, audit_logs.

### Permissões
`team.members.manage`, `series.create`, `series.read`, `series.edit`, `series.grant`, `season.edit`, `episode.edit`, `episode.publish`, `media.manage`, `cms.manage`, `admin.global`.

### Segurança
Sessões revogáveis; validação por servidor; tratamento de dados de entrada; CSRF quando autenticação por cookie; CORS restrito; logs sem segredos; limite de requisições e audit trail.
