# Giai đoạn build
FROM node:20-alpine AS build
WORKDIR /app

# Cài đặt dependencies
COPY package.json yarn.lock ./
RUN yarn install
RUN yarn add esbuild@latest vite@latest

# Copy source code
COPY . .

# Build production
RUN yarn build

# Giai đoạn chạy production
FROM node:20-alpine AS production
WORKDIR /app

# Cài đặt serve để chạy file tĩnh
RUN yarn global add serve

# Copy file build từ giai đoạn build sang
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 3000

# Dùng serve để serve thư mục dist
CMD ["serve", "-s", "dist", "-l", "3000"]
