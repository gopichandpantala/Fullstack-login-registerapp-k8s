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
                    sh """
                        npm install
                        npm run build
                        docker build -t ${env.FRONTEND_IMAGE}:latest .
                    """
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh """
                        npm install
                        docker build -t ${env.BACKEND_IMAGE}:latest .
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
