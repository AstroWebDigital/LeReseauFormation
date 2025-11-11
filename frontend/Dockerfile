# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app

# On n'utilise PAS package-lock.json ici pour éviter le bug npm/rollup sur musl
COPY package.json ./
RUN npm install

# On copie le reste du code
COPY . .

# Build Vite classique
RUN npm run build

# ---------- Run ----------
FROM node:20-alpine AS runtime
WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
