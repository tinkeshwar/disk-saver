FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libva-dev \
    vainfo \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json .
COPY backend/ ./backend/
COPY frontend/ ./frontend/

RUN npm install
RUN cd backend && npm install
RUN cd frontend && npm install && npm run build

EXPOSE 5000

CMD ["npm", "start"]