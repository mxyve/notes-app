version: "3"

services:
  client:
    build: ./client
    ports:
      - "8081:80"
    depends_on:
      - backend

  server:
    build: ./server
    ports:
      - "3001:3001"
