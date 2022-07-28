FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

# Install python3.6
RUN apt-get update && apt-get install -y python3.6 python3-pip

# Install dependencies with pnpm
RUN npm install -g pnpm
RUN pnpm install

# Install git
RUN apt-get update && apt-get install -y git

# Clone captcha-solver repository
RUN git clone https://github.com/MRakox/hcaptcha-challenger

# Install chrome binaries
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN apt-get install -y ./google-chrome-stable_current_amd64.deb
RUN rm google-chrome-stable_current_amd64.deb

# Install dependencies with pip3
RUN cd hcaptcha-challenger && pip3 install -r requirements.txt
RUN cd hcaptcha-challenger/src && python3 main.py install

CMD ["node", "index.js"]