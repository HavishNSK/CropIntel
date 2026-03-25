#!/bin/sh
set -e
cd /app

if [ -n "${CROPINTEL_MODELS_URL}" ]; then
  if [ ! -f ml/models/.cropintel-fetch-ok ]; then
    echo "Fetching pre-built models from CROPINTEL_MODELS_URL…"
    python3 -m ml.scripts.fetch_models --url "${CROPINTEL_MODELS_URL}"
    touch ml/models/.cropintel-fetch-ok
  else
    echo "Models already present (ml/models/.cropintel-fetch-ok); skip fetch."
  fi
else
  echo "Note: CROPINTEL_MODELS_URL not set. Place models under ml/models/ or predictions will fail."
fi

exec "$@"
