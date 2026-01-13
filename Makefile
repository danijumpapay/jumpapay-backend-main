IMAGE_NAME=jumpapay-backend-main
CONTAINER_NAME=jumpapay-backend-main
ENV_FILE=/opt/.env/production-jumpapay-backend-main.env

build:
	@echo "▶ Building image..."
	@podman build --no-cache \
	  --secret id=github_token,env=GITHUB_TOKEN \
	  -t $(IMAGE_NAME) .

run:
	@echo "▶ Running container..."
	@podman run -d \
	  --name $(CONTAINER_NAME) \
	  --replace \
	  --restart=always \
		--network=host \
	  --env-file $(ENV_FILE) \
	  --log-driver=journald \
	  $(IMAGE_NAME)

deploy: build run
	@echo "✅ Deploy finished!"
