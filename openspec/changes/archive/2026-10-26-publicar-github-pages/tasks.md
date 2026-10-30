# Tasks

## 1. Repo público

- [x] 1.1 Crear `.gitignore` (node_modules, dist, verify-final-*.png, .impeccable local) y verificar `git status --porcelain` no lista esos paths tras `git init`
- [x] 1.2 Inicializar git (`main`), commit inicial del proyecto y verificar `git log --oneline` muestra el commit
- [x] 1.3 Crear repo público con `gh repo create azar-ruleta-foto-menu --public --source=. --push` y verificar `gh repo view` responde con la URL

## 2. Deploy automático a Pages

- [x] 2.1 Crear `.github/workflows/deploy-pages.yml` (build `npm ci && npm run build`, artifact `dist/`, `deploy-pages`) y verificar el workflow aparece en la pestaña Actions tras el push
- [x] 2.2 Habilitar Pages (Source: GitHub Actions) si el primer run lo exige y verificar el deploy publica en `https://rafaeldavidgg.github.io/azar-ruleta-foto-menu/`

## 3. Verificación post-deploy

- [x] 3.1 Abrir la URL de Pages en viewport 375px y verificar la ruleta renderiza, gira y el OCR carga `spa` sin 404 en la consola
- [x] 3.2 Confirmar que el Service Worker registra bajo el subpath y la PWA es instalable, y verificar recarga offline de la shell
