# Step: 1
FROM node:14

# Step: 2
WORKDIR /app

# Step: 3
COPY package*.json ./

# Step: 4
RUN npm install

# Step: 5
COPY . .

# Step: 6
EXPOSE 3000

# Step: 7
CMD ["npm", "run", "start"]