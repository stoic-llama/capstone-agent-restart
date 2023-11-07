pipeline {
    agent any
    environment {
        version = '1.2'
    }

    stages {
        stage("login") {
            steps {
                // echo 'authenticating into jenkins server...'
                // sh 'docker login registry.digitalocean.com'
                
                // note you need to manually add token for capstone-ccsu once 
                // in Jenkins conatiner that is in the droplet
                // Refer to "API" tab in Digital Ocean
                // sh 'doctl auth init --context capstone-ccsu'  

                echo 'no need to login to a private image repository...'
            }
        }

        stage("build") {
            steps {
                // echo 'building the application...'
                // sh 'doctl registry repo list-v2'
                // sh "docker build -t capstone-frontend:${version} ."
                // sh "docker tag capstone-frontend:${version} registry.digitalocean.com/capstone-ccsu/capstone-frontend:${version}"
                // sh "docker push registry.digitalocean.com/capstone-ccsu/capstone-frontend:${version}"
                // sh 'doctl registry repo list-v2'

                echo 'building the application...'
                // sh 'doctl registry repo list-v2'
                sh "docker build -t capstone-agent-restart:${version} ."
                sh "docker tag capstone-agent-restart:${version} stoicllama/capstone-agent-restart:${version}"
                sh "docker push stoicllama/capstone-agent-restart:${version}"
                // sh 'doctl registry repo list-v2'
            }
        }

        stage("test") {
            steps {
                echo 'testing the application...'    
            }
        }

        stage("deploy") {
            steps {
                echo 'deploying the application...' 

                // Use the withCredentials block to access the credentials
                // Note: need --rm when docker run.. so that docker stop can kill it cleanly
                withCredentials([string(credentialsId: 'website', variable: 'WEBSITE')]) {
                    sh 'ssh -i /var/jenkins_home/.ssh/website_deploy_rsa_key ${WEBSITE} "docker stop capstone-agent-restart"'

                    // sh '''
                    //     ssh -i /var/jenkins_home/.ssh/website_deploy_rsa_key ${WEBSITE} "docker run -d \
                    //     -p 80:3700 \
                    //     --rm \
                    //     --name capstone-frontend \
                    //     --network helpmybabies \
                    //     registry.digitalocean.com/capstone-ccsu/capstone-frontend:${version}

                    //     docker ps
                    //     "
                    // '''    

                    sh '''
                        ssh -i /var/jenkins_home/.ssh/website_deploy_rsa_key ${WEBSITE} "docker run -d \
                        -p 5800:5800 \
                        --rm \
                        --name capstone-agent-restart \
                        --network helpmybabies \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        stoicllama/capstone-agent-restart:${version}


                        docker ps
                        "
                    '''


                }
            }
        }
    }

    post {
        always {
            echo "Release finished and start clean up"
            deleteDir() // the actual folder with the downloaded project code is deleted from build server
        }
        success {
            echo "Release Success"
        }
        failure {
            echo "Release Failed"
        }
        cleanup {
            echo "Clean up in post workspace" 
            cleanWs() // any reference this particular build is deleted from the agent
        }
    }

}