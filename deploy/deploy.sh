#!/bin/bash
set -e

cd /opt/messenger
echo "[$(date)] Pulling latest changes..."
git fetch origin master
git reset --hard origin/master
echo "[$(date)] Rebuilding and restarting..."
docker compose up -d --build
echo "[$(date)] Deploy complete."
