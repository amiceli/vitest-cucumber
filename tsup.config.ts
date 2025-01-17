import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/module.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    outDir: 'dist',
    splitting: false, // Désactive le code-splitting pour des fichiers simples
    clean: true, // Nettoie le dossier de sortie avant la build
})

// import { defineConfig } from 'tsup';

// export default defineConfig([
//   // Configuration pour la bibliothèque (CommonJS + ESM)
//   {
//     entry: ['src/index.ts'],  // Fichier principal de la bibliothèque
//     format: ['cjs', 'esm'],   // Générer les deux formats
//     dts: true,                // Générer les définitions de types
//     outDir: 'dist/lib',       // Répertoire de sortie pour la bibliothèque
//     sourcemap: true,          // Générer les sourcemaps
//     clean: true,              // Nettoie avant la build
//   },
//   // Configuration pour le CLI (Node.js)
//   {
//     entry: ['src/cli.ts'],    // Fichier CLI
//     format: ['cjs'],          // Format CommonJS pour Node.js
//     target: 'node16',         // Cible Node.js
//     banner: {
//       js: '#!/usr/bin/env node', // Ajoute le shebang pour rendre le fichier exécutable
//     },
//     outDir: 'dist/cli',       // Répertoire de sortie pour le CLI
//     sourcemap: true,          // Générer les sourcemaps
//     splitting: false,         // Pas de code splitting pour un fichier unique
//     clean: false,             // Ne nettoie pas, car la bibliothèque est aussi dans dist
//     dts: false,               // Pas besoin de types pour le CLI
//   },
// ]);
