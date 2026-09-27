FROM node:22-bookworm-slim AS ui
WORKDIR /source
COPY package.json ./
RUN npm install
COPY scripts/build-ui.mjs scripts/build-ui.mjs
COPY ui ui
RUN npm run build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source
COPY InventoryDesk.Api InventoryDesk.Api
COPY --from=ui /source/InventoryDesk.Api/wwwroot/app.js InventoryDesk.Api/wwwroot/app.js
RUN dotnet publish InventoryDesk.Api -c Release -o /app
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080 Inventory__DatabasePath=/data/inventory.db
RUN mkdir /data && chown app:app /data
USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD curl --fail --silent http://127.0.0.1:8080/health/ready || exit 1
ENTRYPOINT ["dotnet", "InventoryDesk.Api.dll"]
