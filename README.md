Profile Gen
=============

Small TypeScript CLI that generates a fixed-format CV as an HTML file. The CV contains: Name + Photo + Intro + Main text.

Usage (after installing dependencies and building):

1. npm install
2. npm run build
3. node dist/index.js --name "Иван Иванов" --photo ./assets/photo.jpg --intro "Краткое введение" --main "Основная часть резюме" --out ./out/ivan.html

You can also run in dev mode with ts-node: npm run dev -- --name "..."
