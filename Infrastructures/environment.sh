#!/bin/bash

ENVIRONMENT=""
IMAGE_NAME=""
COMMAND=somevalue

# get parameters
while test $# -gt 0; do
           case "$1" in
                -env)
                    shift
                    ENVIRONMENT=$1
                    shift
                    ;;
                -image-name)
                    shift
                    IMAGE_NAME=$1
                    shift
                    ;;
          esac
  done

if [[ $ENVIRONMENT == 'staging' ]]; then
    COMMAND="docker build --no-cache --build-arg APP_ENV=staging -t "$IMAGE_NAME" -f ./Dockerfile ."
fi

if [[ $ENVIRONMENT == 'production' ]]; then
    COMMAND="docker build --no-cache --build-arg APP_ENV=production -t "$IMAGE_NAME" -f ./Dockerfile ."
fi

echo exec-docker-script="$COMMAND" >> "$GITHUB_ENV"

exit 0