# Specification: Kubernetes (K8s) Local & AWS Deployment Strategy

## Overview
Outlines containerization, Kubernetes manifest orchestration, local minikube deployment, and AWS free-tier cloud deployment options.

## Kubernetes Architecture (`k8s/`)
1. **Namespace**: `asta-rental`.
2. **Stateful Services**:
   - `postgres`: Single-replica `StatefulSet` with `PersistentVolumeClaim` (2Gi).
   - `redis`: Single-replica `Deployment` serving token blacklists, rate-limiting, and dashboard caches.
3. **Stateless Services**:
   - `backend`: 2-replica `Deployment` running containerized Express API.
   - `frontend`: 2-replica `Deployment` running containerized Next.js App Router UI.
4. **Traffic Ingress**:
   - `asta-rental-ingress`: NGINX Ingress Controller routing `/` to Frontend (port 3000) and `/api` + `/graphql` to Backend (port 4000).

## Local K8s Testing (Minikube / k3s)
```bash
minikube start
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
kubectl get pods -n asta-rental
```

## AWS Free Tier Cloud Deployment
- **Option A (Recommended for Free Tier)**: AWS EC2 `t3.micro` instance running `k3s` (lightweight Kubernetes). Fits within 750 free hours/month.
- **Option B (Managed Containers)**: AWS ECS Fargate + RDS PostgreSQL (`t3.micro` 750h/month free).
