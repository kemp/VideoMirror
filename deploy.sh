#!/bin/bash

set -e

docker build \
  -t "videomirror-builder:latest" \
  .

docker run --rm \
  "videomirror-builder:latest" > "VideoMirror.zip"

echo "Deployed"
