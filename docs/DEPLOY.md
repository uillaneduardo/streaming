# Deploy inicial (somente protótipo estático)

```bash
git clone https://github.com/uillaneduardo/streaming.git
cd streaming
docker compose up -d --build
docker compose ps
```

Abrir `http://IP-DO-HOMELAB:8088`.

Atualizar: `git pull --ff-only && docker compose up -d --build`.

A implantação inicial contém apenas Nginx servindo o site demonstrativo; não há API, banco de dados ou autenticação implementados. Só configure Cloudflare Tunnel após revisar exposição e segurança. Para produção, implantar por tag testada e não por branch em andamento.
