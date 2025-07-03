# Dockerfile pour l'application NestJS
FROM node:18-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer TOUTES les dépendances (prod + dev) pour avoir nest CLI
RUN npm ci --legacy-peer-deps

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Compiler l'application
RUN npm run build

# Stage de production
FROM node:18-alpine AS production

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer seulement les dépendances de production
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Copier les fichiers compilés depuis le stage builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
# Copier le client Prisma généré
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Changer vers l'utilisateur non-root
USER nestjs

# Exposer le port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Commande de démarrage
CMD ["node", "dist/main"] 