# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app

# On n'utilise PAS package-lock.json ici
COPY package.json ./

# 1) Installation des dépendances du projet
RUN echo "===> [STEP 1] npm install (deps du projet)" \
 && npm install \
 && echo "[OK] Dépendances du projet installées" \
 || (echo "[FAIL] npm install a échoué" && exit 1)

# 2) Vérification des dépendances clés (HeroUI + Tailwind v4)
RUN echo "===> [STEP 2] Vérification des dépendances clés" \
 && node -e "const p=require('./package.json'); const v=p.devDependencies?.tailwindcss||p.dependencies?.tailwindcss; if(!v){console.error('[FAIL] tailwindcss non installé'); process.exit(1);} console.log('[OK] tailwindcss installé :', v);" \
 && node -e "const p=require('./package.json'); const v=p.devDependencies?.['@tailwindcss/postcss']||p.dependencies?.['@tailwindcss/postcss']; if(!v){console.error('[FAIL] @tailwindcss/postcss non installé'); process.exit(1);} console.log('[OK] @tailwindcss/postcss installé :', v);" \
 && node -e "const p=require('./package.json'); const v=p.dependencies?.['@heroui/react']; if(!v){console.error('[FAIL] @heroui/react non installé'); process.exit(1);} console.log('[OK] @heroui/react installé :', v);" \
 && node -e "const p=require('./package.json'); const v=p.dependencies?.['framer-motion']; if(!v){console.error('[FAIL] framer-motion non installé'); process.exit(1);} console.log('[OK] framer-motion installé :', v);" \
 && node -e "const p=require('./package.json'); const v=p.dependencies?.['lucide-react']; if(!v){console.error('[FAIL] lucide-react non installé'); process.exit(1);} console.log('[OK] lucide-react installé :', v);" \
 && echo '===> [STEP 2] Vérification terminée (OK)'

# 3) On copie le reste du code
COPY . .

# 4) Injection des variables Vite (baked dans le bundle au build time)
ARG VITE_API_URL
ARG VITE_APP_BASE_URL
ARG VITE_STRIPE_PUBLIC_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_BASE_URL=$VITE_APP_BASE_URL
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY

# 5) Build Vite
RUN echo '===> [STEP 3] Build Vite' \
 && npm run build \
 && echo '[OK] Build Vite terminé' \
 || (echo '[FAIL] npm run build a échoué' && exit 1)

# ---------- Run ----------
FROM node:20-alpine AS runtime
WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
