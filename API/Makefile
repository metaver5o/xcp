# ==============================================================================
# Makefile para Counterparty API Local
# ==============================================================================

# --- Configuração Local ---
SOURCE_ADDRESS := 1JXeYvPctZYLsFYcVyhuY2qsM3un7BMQmn
API_URL        := http://localhost:4000/api/
API_USER       := local
API_PASSWORD   := localpass

# --- Asset Configuration ---
NUMERIC_ASSET_NAME := A173829102938475610
NAMED_ASSET_NAME   := ASSETNAMEA173829102938475610
ASSET_QUANTITY     := 10
INSCRIPTION_JSON   := {"p":"brc-20","op":"mint","tick":"ordi","amt":"10"}

# --- Comandos ---
CURL_CMD = curl -s -u $(API_USER):$(API_PASSWORD) -X POST --header "Content-Type: application/json" -d

# Targets principais
default: help

# Verificar se API está rodando
check_api:
	@echo "Verificando se API local está rodando..."
	@curl -s http://localhost:4000/health | jq .

# Verificar balances
check_balance:
	@echo "Verificando balances..."
	@$(CURL_CMD) '{"jsonrpc":"2.0","id":0,"method":"get_balances","params":{"filters":[{"field":"address","op":"==","value":"$(SOURCE_ADDRESS)"}]}}' $(API_URL) | jq .

# Criar issuance numérica
issue_numeric_asset:
	@echo "Criando asset numérico..."
	@$(CURL_CMD) '{"jsonrpc":"2.0","id":1,"method":"create_issuance","params":{"source":"$(SOURCE_ADDRESS)","asset":"$(NUMERIC_ASSET_NAME)","quantity":$(ASSET_QUANTITY),"description":"$(INSCRIPTION_JSON)","divisible":true}}' $(API_URL) | jq .

# Criar issuance nomeada
issue_named_asset:
	@echo "Criando asset nomeado..."
	@$(CURL_CMD) '{"jsonrpc":"2.0","id":2,"method":"create_issuance","params":{"source":"$(SOURCE_ADDRESS)","asset":"$(NAMED_ASSET_NAME)","quantity":$(ASSET_QUANTITY),"description":"$(INSCRIPTION_JSON)","divisible":false}}' $(API_URL) | jq .

# Ver estado completo
get_state:
	@echo "Estado completo da blockchain local:"
	@curl -s -u $(API_USER):$(API_PASSWORD) http://localhost:4000/state | jq .

# Resetar estado
reset_state:
	@echo "Resetando estado..."
	@curl -s -u $(API_USER):$(API_PASSWORD) -X POST http://localhost:4000/reset | jq .

# Help
help:
	@echo "Makefile para Counterparty API Local"
	@echo "Comandos disponíveis:"
	@echo "  make check_api        - Verificar status da API"
	@echo "  make check_balance    - Verificar balances"
	@echo "  make issue_numeric_asset - Criar asset numérico"
	@echo "  make issue_named_asset   - Criar asset nomeado"
	@echo "  make get_state        - Ver estado completo"
	@echo "  make reset_state      - Resetar estado"
	@echo "  make help             - Esta ajuda"

.PHONY: default check_api check_balance issue_numeric_asset issue_named_asset get_state reset_state help