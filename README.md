# **Fullstack Login-Register App – Kubernetes Deployment with Jenkins CI/CD**


📌 **Overview**

This project demonstrates deploying a React frontend, Node.js backend, and PostgreSQL database on Kubernetes with a complete CI/CD pipeline using Jenkins and DockerHub.


🛠**Tech Stack**

This project follows a **3-tier architecture**:

Frontend: React + Nginx

Backend: Node.js + Express

Database: PostgreSQL (StatefulSet with Persistent Volumes)

Orchestration: Kubernetes

CI/CD: Jenkins

Image Registry: DockerHub

Ingress: NGINX Ingress Controller




🧠 **Architecture Diagram**

<img width="1212" height="725" alt="fullstack-k8s" src="https://github.com/user-attachments/assets/15401f32-7e2a-4b75-807c-069e15404c35" />




📂 **Project Structure**

<img width="812" height="460" alt="image" src="https://github.com/user-attachments/assets/5938482a-36d9-47e7-b9a4-0cfd99b6d6d6" />






🚀 **Step 1 – Build and Push Docker Images**

We created separate Dockerfiles for frontend and backend.

## Backend Dockerfile (`backend/Dockerfile`)
```
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Make sure this copies the .env file into the image
COPY .env .env
EXPOSE 5000
CMD ["node", "server.js"]
```   

## Frontend Dockerfile (`frontend/Dockerfile`)
```
# Stage 1 - Build React app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2 - Serve with nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```



**Push to DockerHub:**

```
# Build and push backend image
docker build -t <your-dockerhub-username>/login-backend ./backend
docker push <your-dockerhub-username>/login-backend

# Build and push frontend image
docker build -t <your-dockerhub-username>/login-frontend ./frontend
docker push <your-dockerhub-username>/login-frontend
```






📦 **Step 2 – Kubernetes Deployment**


We defined Kubernetes YAML manifests inside k8s/:

**PostgreSQL DB** (StatefulSet with Persistent Volume)
Persistent Volume (PV)

Persistent Volume Claim (PVC)

ConfigMap (for DB name, user, password)

InitContainer to run init-script.sql

Service for internal DB access


**Backend**

Deployment pulling image from DockerHub

ClusterIP Service for internal communication


**Frontend**

Deployment pulling image from DockerHub

ClusterIP Service


**Ingress**

Configured host-based routing to frontend and backend

```
Apply Kubernetes manifests:

kubectl apply -f k8s/db/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/ingress.yaml
```




⚙ **Step 3 – Jenkins CI/CD Setup**

We automated builds using Jenkins.

**Jenkins Plugins Installed:**

Pipeline

Docker, NodeJS

Kubernetes CLI

Git


Pipeline Script (Jenkinsfile in repo):

Pull latest code from GitHub (git clone https://github.com/gopichandpantala/Fullstack-login-registerapp-k8s.git)

Build Docker images for frontend & backend

Push to DockerHub

Deploy updated images to Kubernetes


Pipeline Trigger:


📜 **Jenkinsfile Example**

```
pipeline {
    agent any

    tools {
        nodejs "node-local"   // This makes Jenkins use your configured NodeJS installation
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('DockerHub-Creds')
        GITHUB_CREDENTIALS = credentials('Github-creds')
        FRONTEND_IMAGE = 'pantalagopichand/frontend'
        BACKEND_IMAGE = 'pantalagopichand/backend'
    }

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    credentialsId: 'Github-creds',
                    url: 'https://github.com/gopichandpantala/Fullstack-login-registerapp-k8s.git'
            }
        }

        stage('Build Frontend App') {
            steps {
                dir('frontend') {
                    sh """
                        npm install
                        npm run build
                        docker build --no-cache -t ${env.FRONTEND_IMAGE}:latest .
                    """
                }
            }
        }

        stage('Build Backend App') {
            steps {
                dir('backend') {
                    sh """
                        npm install
                        docker build --no-cache -t ${env.BACKEND_IMAGE}:latest .
                    """
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'DockerHub-Creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${env.FRONTEND_IMAGE}:latest
                        docker push ${env.BACKEND_IMAGE}:latest
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh """
                        microk8s kubectl apply -f k8s/db/
                        microk8s kubectl apply -f k8s/backend/
                        microk8s kubectl apply -f k8s/frontend/
                        microk8s kubectl apply -f k8s/ingress.yaml

			# 🔄 Restart deployments so pods pull the latest image
                        microk8s kubectl rollout restart deployment frontend-deployment
                        microk8s kubectl rollout restart deployment backend-deployment
                        microk8s kubectl rollout restart statefulset/postgres 
              		# ⏳ Wait until updates are done
                        microk8s kubectl rollout status deployment/frontend-deployment
                        microk8s kubectl rollout status deployment/backend-deployment
                        microk8s kubectl rollout status statefulset/postgres
                    """
                }
            }
        }
    }

    post {
        always {
            sh """
                docker rmi ${env.FRONTEND_IMAGE}:latest || true
                docker rmi ${env.BACKEND_IMAGE}:latest || true
                docker image prune -f || true
            """
        }
    }
}

```



<img width="1837" height="1009" alt="image" src="https://github.com/user-attachments/assets/856cacd7-3fc7-42e5-8a8f-894a8cdc40ad" />






🌐 **Accessing the Application**
Once deployed, the app is accessible via the Ingress Controller at:(for local testing i have added in /etc/hosts as 127.0.0.1  loginapp.local )



http://loginapp.local/


<img width="1845" height="1012" alt="image" src="https://github.com/user-attachments/assets/6725308a-9417-42bd-8e17-0bba8093dcea" />








✅ **Key Features**
Automated Builds & Deployments with Jenkins

Persistent Storage for PostgreSQL using PV/PVC

ConfigMap + Secrets for DB configuration

InitContainer for automatic DB initialization

Ingress for external access

Separate Microservices for frontend & backend
