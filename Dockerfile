# syntax=docker/dockerfile:1

FROM alpine:latest

RUN apk add zip git

RUN mkdir /tmp/src
COPY . /tmp/src

WORKDIR /usr/src/app
RUN git clone /tmp/src .
RUN git checkout master

WORKDIR /usr/src/app/src
CMD ["zip", "-r", "-", "."]
