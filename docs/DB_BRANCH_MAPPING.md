# Mapeo de base de datos por ambiente/rama

Regla aplicada en `Settings`:

- `main` / `production` -> `sqlite:///./data/AMROSAI.db`
- `staging` -> `sqlite:///./data/SAMROSAI.db`
- `dev` -> `sqlite:///./data/DAMROSAI.db`

Regla operativa obligatoria:

- `MAIN` -> `AMROSAI.db`
- `STAGING` -> `SAMROSAI.db`
- `DEV` -> `DAMROSAI.db`

Compatibilidad legacy:

- Si el archivo nuevo no existe pero existe el legacy, se clona automáticamente:
  - `amrosai.db` -> `AMROSAI.db`
  - `amrosai_staging.db` -> `SAMROSAI.db`
  - `amrosai_dev.db` -> `DAMROSAI.db`

Variables recomendadas por rama:

- `ENVIRONMENT=main` en `main` (`production` funciona como alias)
- `ENVIRONMENT=staging` en `staging`
- `ENVIRONMENT=dev` en `dev`
