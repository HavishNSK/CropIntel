# CropIntel: Next.js + Python inference (no Kaggle needed if CROPINTEL_MODELS_URL is set)
FROM python:3.11-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY ml/requirements-inference.txt ml/
RUN pip install --no-cache-dir -r ml/requirements-inference.txt

COPY . .

RUN chmod +x docker/entrypoint.sh

ENV NODE_ENV=development
ENV PYTHONUNBUFFERED=1

EXPOSE 3050

ENTRYPOINT ["/app/docker/entrypoint.sh"]
CMD ["npx", "next", "dev", "-p", "3050", "-H", "0.0.0.0"]
