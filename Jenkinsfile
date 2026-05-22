pipeline {
    agent any

    tools {
        jdk 'jdk21'
        maven 'maven3'
    }

    environment {
        // SonarQube Scanner Tool definition
        SCANNER_HOME          = tool 'sonar-scanner'

        // Cloudinary credentials matching local profile requirements
        CLOUDINARY_CLOUD_NAME = 'docconsult_cloud'
        CLOUDINARY_API_KEY    = '346394969957731'
        CLOUDINARY_API_SECRET = 'UbgLX3_vAMfvnHupOMGxxkN_WkM'
    }

    stages {

        stage('Clean Workspace') {
            steps {
                echo 'Cleaning pipeline workspace archives...'
                cleanWs()
            }
        }

        stage('Git Checkout') {
            steps {
                echo 'Checking out source repository branch: main...'
                git branch: 'main',
                    credentialsId: 'git-check',
                    url: 'https://github.com/hanamanttaranal-cpu/docter-app-new.git'
            }
        }

        stage('Compile') {
            steps {
                echo 'Compiling Java Spring Boot backend modules...'
                dir('backend') {
                    sh 'mvn clean compile'
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Executing Java Spring Boot project unit and integration tests...'
                dir('backend') {
                    sh 'mvn test'
                }
            }
        }

        stage('Trivy File System Scan') {
            steps {
                echo 'Running Trivy file system vulnerability scan...'
                sh 'trivy fs . > trivy-fs-report.txt'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo 'Triggering static code analysis to SonarQube Server...'
                withSonarQubeEnv(installationName: 'sonar-server') {
                    sh """
                    ${SCANNER_HOME}/bin/sonar-scanner \
                    -Dsonar.projectName=doctor-backend \
                    -Dsonar.projectKey=doctor-backend \
                    -Dsonar.sources=backend/src \
                    -Dsonar.java.binaries=backend/target/classes
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo 'Waiting for SonarQube Quality Gate analysis to finalize...'
                script {
                    try {
                        timeout(time: 3, unit: 'MINUTES') {
                            waitForQualityGate abortPipeline: false
                        }
                    } catch (err) {
                        echo "⚠️ SonarQube webhook was not received within 3 minutes. Proceeding with pipeline..."
                    }
                }
            }
        }

        stage('Build Package') {
            steps {
                echo 'Building and packaging bootable Spring Boot JAR file (skipping local unit testing for artifact production)...'
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Publish To Nexus') {
            steps {
                echo 'Deploying packaged artifact to enterprise Nexus repository host...'
                dir('backend') {
                    withMaven(
                        globalMavenSettingsConfig: 'maven-setting',
                        jdk: 'jdk21',
                        maven: 'maven3',
                        traceability: true
                    ) {
                        sh 'mvn deploy -DskipTests'
                    }
                }
            }
        }

        stage('Docker Compose Build') {
            steps {
                echo 'Building Multi-Port backend and role-grouped frontend Docker images...'
                sh 'docker compose build'
            }
        }

        stage('Docker Images') {
            steps {
                echo 'Listing compiled docker images on the local agent registry...'
                sh 'docker images'
            }
        }

        stage('Trivy Docker Image Scan') {
            steps {
                echo 'Running Trivy security scan on backend and customized frontend images...'
                sh 'trivy image docconsult-backend:latest > trivy-image-report.txt'
                sh 'trivy image docconsult-frontend-patient:latest >> trivy-image-report.txt'
                sh 'trivy image docconsult-frontend-doctor:latest >> trivy-image-report.txt'
                sh 'trivy image docconsult-frontend-admin:latest >> trivy-image-report.txt'
            }
        }

        stage('Docker Compose Up') {
            steps {
                echo 'Launching localized staging stack in background (detached mode)...'
                sh 'docker compose up -d'
            }
        }

    }

    post {
        always {
            echo 'Archiving stage reports and log outputs in workspace...'
            archiveArtifacts artifacts: '*.txt', fingerprint: true
        }

        success {
            echo 'Pipeline Executed Successfully'
        }

        failure {
            echo 'Pipeline Failed'
        }
    }
}
