# CropIntel

Web app for crop leaf disease hints using EfficientNet → TensorFlow Lite, with a Next.js UI.

## Run without training (no Kaggle)

Trained weights live under `ml/models/` (gitignored). You do **not** need Kaggle or local training if you install models once:

### Option A — Download a release zip (recommended)

1. Get a direct `.zip` URL from a maintainer (e.g. GitHub **Releases**).
2. From the repo root:

```bash
pip install -r ml/requirements-inference.txt
export CROPINTEL_MODELS_URL='https://example.com/cropintel-models.zip'
python3 -m ml.scripts.fetch_models
```

3. Install Node deps and start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3050](http://localhost:3050). The API runs `scripts/predict.py` with `python3`.

### Option B — Docker

```bash
export CROPINTEL_MODELS_URL='https://example.com/cropintel-models.zip'   # required for first-time fetch
docker compose up --build
```

Models are stored in `./ml/models` on your machine. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env` if you use the outbreak map.

## Train yourself (needs Kaggle data)

See [ml/README.md](ml/README.md): Kaggle API, `download_datasets.py`, and training scripts. Use `pip install -r ml/requirements.txt` (includes `kaggle`).

## Maintainer: publish models for others

After training, package `ml/models/`:

```bash
pip install -r ml/requirements.txt   # or minimal env with ml on PYTHONPATH
python3 -m ml.scripts.package_models -o cropintel-models.zip
```

Upload `cropintel-models.zip` to a release and share the **direct download URL** as `CROPINTEL_MODELS_URL`.

## Project layout

- `app/` — Next.js (UI + `/api/predict`)
- `scripts/predict.py` — inference entrypoint for the API
- `ml/` — training, `tflite_predictor`, config

## License

MIT
