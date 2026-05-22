# Prompt à coller dans Claude Code (en local)

## Étape 1 — Installer Claude Code

Sur Mac :
```bash
brew install anthropic/claude/claude
```

Sur Windows / Linux : https://docs.claude.com/en/docs/claude-code/quickstart

## Étape 2 — Ouvrir un terminal dans ce dossier

```bash
cd chemin/vers/fete-mamans-kit
claude
```

## Étape 3 — Coller ce prompt tel quel dans Claude Code

```
J'ai un PowerPoint `fete_mamans.pptx` (6 slides sur 3 idées de cadeaux fête des
mères pour mes filles). Je veux que tu remplaces les illustrations dessinées
par 3 vraies photos trouvées sur le web.

Étapes :

1. Utilise WebSearch pour trouver 3 photos (Pinterest, blogs DIY, Pexels,
   Unsplash...) qui correspondent à :
   - Photo 1 : porte-clé en pâte à sel avec empreinte de doigt, peint
   - Photo 2 : vide-poche / coupelle en pâte à sel avec empreinte de main d'enfant
   - Photo 3 : carnet de bons faits main pour la fête des mères (cartes
     "bon pour un câlin" etc.)

   Choisis des images mignonnes, lumineuses, format carré ou paysage,
   résolution >= 600px.

2. Télécharge-les avec WebFetch ou curl en `photo1.jpg`, `photo2.jpg`,
   `photo3.jpg` dans le dossier courant.

3. Installe les dépendances : `pip install python-pptx Pillow`

4. Exécute : `python embed_photos.py photo1.jpg photo2.jpg photo3.jpg`

5. Vérifie que `fete_mamans_avec_photos.pptx` est bien créé et ouvre-le pour
   me confirmer que les photos remplacent bien les illustrations sur les
   slides 2, 3 et 5.

Si une photo ne se télécharge pas (403, hotlink bloqué), trouve une alternative
sur un autre site. L'objectif est d'avoir 3 vraies photos dans le PPT à la fin.
```

## Étape 4 — Récupérer le fichier final

Le fichier `fete_mamans_avec_photos.pptx` sera créé à côté de l'original.
Tu l'ouvres dans PowerPoint / Keynote / Google Slides et c'est plié.

---

## Plan B si Claude Code local n'est pas une option

Tu uploades simplement 3 photos depuis Pinterest dans le chat web claude.ai
(celui où on a fait le PPT), je relance `embed_photos.py` côté serveur et je
te renvoie le PPT. Beaucoup plus rapide que d'installer.
