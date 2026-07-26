# Code-only export

This archive contains the source, config and documentation for
**Elder Deck & Sanctuary of Sovngarde**, with all credentials removed.

Binary assets were left out to keep the download small. The app **will not
build until you copy them back** from the original project folder.

## Restore before building

Copy these directories from your original project folder into this one:

| Path | Contents |
| --- | --- |
| `src/assets/images/` | 18 card artwork `.jpg` files (~21 MB) |
| `public/sounds/` | 5 tavern music `.mp3` files (~17 MB) |

```bash
cp -R /path/to/original/src/assets/images   src/assets/
cp -R /path/to/original/public/sounds       public/
```

Expected filenames:

**src/assets/images/**
archmage_cat_1784953718244.jpg, card_back_3d_1784953684442.jpg,
daedra_cat_1784591418782.jpg, dark_speaker_cat_1784591393303.jpg,
dragonborn_cat_1784953695507.jpg, frost_troll_cat_1784591410273.jpg,
greybeard_cat_1784591401650.jpg, medieval_card_back_1784590894037.jpg,
merchant_cat_1784591372857.jpg, nightingale_cat_1784591357293.jpg,
nightingale_cat_1784953707351.jpg, nirnroot_cat_1784591430148.jpg,
sentry_cat_1784591364459.jpg, sheogorath_cat_1784591380989.jpg,
sweetroll_cat_1784953729723.jpg, thief_cat_1784591329350.jpg,
warrior_cat_1784591310191.jpg, wizard_cat_1784591318541.jpg

**public/sounds/**
fiddles_mcginty.mp3, minstrel_guild.mp3, pippin_hunchback.mp3,
teller_tales.mp3, thatched_villagers.mp3

## Also omitted

- `bun.lock` — regenerate with `npm install` (or `bun install`)
- `docs/assets/`, `docs/index.html` — build output; regenerate with `npm run build:docs`
- `docs/sounds/` — byte-identical duplicate of `public/sounds/`
- `node_modules/`, `.env`, `.DS_Store`

## Credentials

No credentials are present in this archive. Copy `.env.example` to `.env` and
fill in your own values; see the Secrets Policy section of `README.md`.
