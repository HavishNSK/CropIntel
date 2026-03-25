# Notes for Cursor / new contributors

- **Kaggle is optional.** Cloning the repo does not include `ml/models/` (gitignored). Without models, `/api/predict` fails.
- **Fix:** Set `CROPINTEL_MODELS_URL` to a direct HTTPS link to a `.zip` built from `ml/models/` (see `python3 -m ml.scripts.package_models`), then run `python3 -m ml.scripts.fetch_models`, or use **Docker Compose** with that env var (see root `README.md`).
- **Training / accuracy:** Reproducing paper-style metrics requires downloading Kaggle datasets per `ml/scripts/download_datasets.py` and training locally; that path is separate from “run the app.”
