#!/bin/bash

echo "Cleaning up existing containers and volumes..."
docker-compose down -v

echo "Starting services with Docker Compose..."
docker-compose up -d

echo "Waiting for MongoDB to start..."
sleep 10  # Wait for MongoDB to fully start

# Initializing MongoDB replica set
sh ./init-replicaset.sh

echo "Development environment setup complete."
