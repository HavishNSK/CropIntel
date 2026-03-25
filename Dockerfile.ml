# ML training / inference only (Next.js app is not in this image).
FROM python:3.11-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ml/requirements.txt /app/ml/requirements.txt
RUN pip install --no-cache-dir -r /app/ml/requirements.txt

COPY ml /app/ml

ENV PYTHONPATH=/app
ENV TF_CPP_MIN_LOG_LEVEL=2

# Override with e.g. docker compose run ... python -m ml.training.train_crop --crop corn
CMD ["python", "-m", "ml.scripts.create_synthetic_dataset", "--help"]
