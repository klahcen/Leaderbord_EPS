# PE Dashboard — local dev & Railway deploy helpers
# Railway: uses Dockerfile (see railway.toml) — push to GitHub to redeploy

.PHONY: help install lock dev build start lint clean \
        db-generate db-push db-seed db-studio db-setup \
        db-push-railway db-seed-railway \
        railway-build railway-start env-check \
        db-up db-down docker-build docker-run

NPM ?= npm

.DEFAULT_GOAL := help

help: ## Show available targets
	@grep -E '^[a-zA-Z0-9_-]+:.*##' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

install: ## Install deps (clean, from lockfile — same as Railway)
	$(NPM) ci

lock: ## Refresh package-lock.json after package.json changes
	$(NPM) install

clean: ## Delete .next cache (fixes MODULE_NOT_FOUND / stale webpack errors)
	rm -rf .next

dev: ## Run Next.js dev server
	$(NPM) run dev

build: ## Production build (Prisma client + Next.js)
	$(NPM) run build

start: ## Start production server (run `make build` first)
	$(NPM) run start

lint: ## Run ESLint
	$(NPM) run lint

db-generate: ## Generate Prisma client
	npx prisma generate

db-up: ## Start local Postgres (Docker, port 5434)
	@docker start pe-dashboard-db 2>/dev/null || docker run -d \
		--name pe-dashboard-db \
		-e POSTGRES_USER=pe \
		-e POSTGRES_PASSWORD=pe \
		-e POSTGRES_DB=pe_dashboard \
		-p 5434:5432 \
		postgres:16-alpine
	@echo "Waiting for Postgres..."
	@sleep 2

db-down: ## Stop local Postgres container
	docker stop pe-dashboard-db

db-push: ## Push schema to DATABASE_URL
	npx prisma db push

db-seed: ## Seed demo data
	npx prisma db seed

db-setup: db-up db-push db-seed ## Start DB + schema + seed (first-time local setup)

# Railway Postgres → Connect → Public URL (host + port change when service restarts)
# Example: make db-push-railway RAILWAY_DATABASE_URL='postgresql://postgres:PASS@yamanote.proxy.rlwy.net:21612/railway'
db-push-railway: ## Push schema to Railway DB (set RAILWAY_DATABASE_URL)
	@test -n "$(RAILWAY_DATABASE_URL)" || (echo "Set RAILWAY_DATABASE_URL first" && exit 1)
	DATABASE_URL="$(RAILWAY_DATABASE_URL)" npx prisma db push

db-seed-railway: ## Seed Railway DB (set RAILWAY_DATABASE_URL)
	@test -n "$(RAILWAY_DATABASE_URL)" || (echo "Set RAILWAY_DATABASE_URL first" && exit 1)
	DATABASE_URL="$(RAILWAY_DATABASE_URL)" npx prisma db seed

db-studio: ## Open Prisma Studio
	npx prisma studio

railway-build: build ## Railway build step

railway-start: ## Railway start: sync DB schema then serve
	$(NPM) run railway:start

env-check: ## Print which required env vars are set (values hidden)
	@echo "DATABASE_URL:        $$([ -n \"$$DATABASE_URL\" ] && echo set || echo MISSING)"
	@echo "AUTH_SECRET:         $$([ -n \"$$AUTH_SECRET\" ] && echo set || echo MISSING)"
	@echo "ANTHROPIC_API_KEY:   $$([ -n \"$$ANTHROPIC_API_KEY\" ] && echo set || echo MISSING)"
	@echo "AUTH_URL (optional): $$([ -n \"$$AUTH_URL\" ] && echo set || echo not set)"

docker-build: ## Build Docker image locally
	docker build -t pe-dashboard .

docker-run: ## Run Docker image (requires .env or -e flags)
	docker run --rm -p 3000:3000 --env-file .env pe-dashboard
