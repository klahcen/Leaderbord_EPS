# PE Dashboard — local dev & Railway deploy helpers
# Railway: set Build Command to `make build`, Start Command to `make railway-start`

.PHONY: help install lock dev build start lint \
        db-generate db-push db-seed db-studio \
        railway-build railway-start env-check

NPM ?= npm

.DEFAULT_GOAL := help

help: ## Show available targets
	@grep -E '^[a-zA-Z0-9_-]+:.*##' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

install: ## Install deps (clean, from lockfile — same as Railway)
	$(NPM) ci

lock: ## Refresh package-lock.json after package.json changes
	$(NPM) install

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

db-push: ## Push schema to DATABASE_URL
	npx prisma db push

db-seed: ## Seed demo data
	npx prisma db seed

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
