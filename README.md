Profile Gen
=============

Small TypeScript project that can generate a fixed-format CV as an HTML file from inputs (name, photo, intro, main text). It supports:

- CLI mode (local) — generate HTML files
- HTTP API — POST form-data and get back an HTML CV
- Docker — containerized server via Dockerfile/docker-compose

Quick start (local)
-------------------

1. Install and build:

```bash
npm install
npm run build
```

2. CLI example:

```bash
node dist/index.js --name "Иван Иванов" --photo ./assets/photo.png --intro "Опытный разработчик" --main "Опыт: ..." --out ./out/ivan.html
```

Server (HTTP API)
------------------

The project exposes an API endpoint to generate CVs programmatically.

Start the server locally:

```bash
node dist/server.js
```

API endpoint

- URL: POST http://localhost:3000/api/generate
- Content-Type: multipart/form-data
- Fields:
	- `name` (string) — required
	- `position` (string) — optional (will prepend to `intro`)
	- `intro` (string) — intro text
	- `main` (string) — main CV body
	- `lang` (string) — `en` or `de` (default `en`)
	- `photo` (file) — image file (jpg/png)

Response: HTML (Content-Type: text/html). The returned HTML contains the photo embedded as a data URL so the response is self-contained.

Example curl request:

```bash
curl -X POST \
	-F "name=Иван Иванов" \
	-F "position=Senior Developer" \
	-F "intro=Краткая вводная" \
	-F "main=Опыт и навыки..." \
	-F "lang=en" \
	-F "photo=@assets/photo.png" \
	http://localhost:3000/api/generate -o out/generated_from_api.html
```

Docker
------

You can build and run the server in Docker. A `Dockerfile` and `docker-compose.yml` are included.

Build and run with Docker Compose:

```bash
docker compose up --build
```

This exposes the server on port 3000. The compose file mounts `./out` so generated files saved by examples will be visible on the host.

