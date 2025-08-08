# **Fullstack Login-Register App – Kubernetes Deployment with Jenkins CI/CD**

📌 Overview
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

login-app/
│── backend/              # Node.js backend service
│   ├── Dockerfile
│   ├── server.js
│   ├── package.json
│
│── frontend/             # React frontend service
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│
│── k8s/                  # Kubernetes manifests
│   ├── backend/          # Backend Deployment + Service
│   ├── frontend/         # Frontend Deployment + Service
│   ├── db/               # DB StatefulSet + PV + PVC + ConfigMap
│   ├── ingress.yaml      # Ingress configuration
│
├── Jenkinsfile           # Jenkins CI/CD pipeline script
├── README.md

🚀 **Step 1 – Build and Push Docker Images**
We created separate Dockerfiles for frontend and backend.

Backend Dockerfile (backend/Dockerfile):

#../backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
#Make sure this copies the .env file into the image
COPY .env .env
EXPOSE 5000
CMD ["node", "server.js"]

Frontend Dockerfile (frontend/Dockerfile):

#Stage 1 - Build React app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

#Stage 2 - Serve with nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

**Push to DockerHub:**
docker build -t <dockerhub-username>/login-backend ./backend
docker push <dockerhub-username>/login-backend

docker build -t <dockerhub-username>/login-frontend ./frontend
docker push <dockerhub-username>/login-frontend


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

Apply Kubernetes manifests:

kubectl apply -f k8s/db/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/ingress.yaml

⚙ **Step 3 – Jenkins CI/CD Setup**
We automated builds using Jenkins.

Jenkins Plugins Installed:

Pipeline

Docker

Kubernetes CLI

Git

Pipeline Script (Jenkinsfile in repo):

Pull latest code from GitHub (git clone https://github.com/gopichandpantala/Fullstack-login-registerapp-k8s.git)

Build Docker images for frontend & backend

Push to DockerHub

Deploy updated images to Kubernetes

Pipeline Trigger:

📜 **Jenkinsfile Example**

pipeline {
    agent any

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

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh "docker build -t ${env.FRONTEND_IMAGE}:latest ."
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh "docker build -t ${env.BACKEND_IMAGE}:latest ."
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

<img width="1849" height="815" alt="image" src="https://github.com/user-attachments/assets/2e06e57d-f486-49a0-b528-e957bdde1c27" />

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
