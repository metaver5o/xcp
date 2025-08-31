# ==============================================================================
# Makefile to Interact with Counterparty API with Wallet Integration
# ==============================================================================
# Required tools: make, curl, jq, bitcoin-cli
#
# Usage:
#   make all                  - Runs all commands in sequence.
#   make check_balance        - Checks the PEPECASH balance.
#   make issue_numeric_asset  - Creates the transaction for a numeric asset.
#   make issue_named_asset    - Creates the transaction for a named asset.
#   make import_wallet        - Imports wallet using seed and password
#   make sign_transaction     - Signs a transaction
#   make broadcast_tx         - Broadcasts a signed transaction
#   make help                 - Shows this help message.
# ==============================================================================

# --- User Configuration ---
SOURCE_ADDRESS := 1JXeYvPctZYLsFYcVyhuY2qsM3un7BMQmn
API_URL        := https://api.counterparty.io:4000
WALLET_NAME    := mycounterpartywallet
BITCOIN_CLI    := bitcoin-cli

# --- Wallet Configuration ---
WALLET_SEED    := "indeed front agree sign taught forget flesh square thunder warm swing freeze"
WALLET_PASS    := "yay"
# --- Asset Configuration ---
NUMERIC_ASSET_NAME := A173829102938475610
NAMED_ASSET_NAME   := ASSETNAMEA173829102938475610
ASSET_QUANTITY     := 10
# Inscription in JSON format (escaped string for Makefile)
INSCRIPTION_JSON := {"p":"brc-20","op":"mint","tick":"ordi","amt":"10"}

# --- File Configuration ---
UNSIGNED_TX_FILE := unsigned_transaction.txt
SIGNED_TX_FILE   := signed_transaction.txt

# --- Internal Commands ---
CURL_CMD = curl -s -X POST --header "Content-Type: application/json" -d

# Default target
default: help

# Target to run all steps
all: check_balance issue_numeric_asset issue_named_asset

# --- API Targets ---

# Target 1: Check balance for any token (interactive)
check_balance:
	@echo "--- 1. Checking balance for specific token... ---"
	@read -p "Enter the token/asset name (e.g., PEPECASH, XCP, or your custom token): " TOKEN_NAME; \
	echo "Checking balance for $$TOKEN_NAME..."; \
	$(CURL_CMD) '{"jsonrpc":"2.0","id":0,"method":"get_balances","params":{"filters":[{"field":"address","op":"==","value":"$(SOURCE_ADDRESS)"},{"field":"asset","op":"==","value":"'$$TOKEN_NAME'"}]}}' $(API_URL) | jq .
	@echo ""

# Target 2: Issue a Numeric Asset with Inscription
issue_numeric_asset:
	@echo "--- 2. Creating transaction to issue numeric asset $(NUMERIC_ASSET_NAME)... ---"
	@echo "Reminder: The output below is an unsigned transaction. You must sign and broadcast it."
	@$(CURL_CMD) '{"jsonrpc":"2.0","id":1,"method":"create_issuance","params":{"source":"$(SOURCE_ADDRESS)","asset":"$(NUMERIC_ASSET_NAME)","quantity":$(ASSET_QUANTITY),"description":"{\"p\":\"brc-20\",\"op\":\"mint\",\"tick\":\"ordi\",\"amt\":\"10\"}","divisible":true}}' $(API_URL) | jq . | tee $(UNSIGNED_TX_FILE)
	@echo "Unsigned transaction saved to $(UNSIGNED_TX_FILE)"
	@echo ""

# Target 3: Issue a Named Asset with Inscription
issue_named_asset:
	@echo "--- 3. Creating transaction to issue named asset $(NAMED_ASSET_NAME)... ---"
	@echo "Reminder: This operation costs 0.5 XCP and the output is an unsigned transaction."
	@$(CURL_CMD) '{"jsonrpc":"2.0","id":2,"method":"create_issuance","params":{"source":"$(SOURCE_ADDRESS)","asset":"$(NUMERIC_ASSET_NAME)","quantity":$(ASSET_QUANTITY),"description":"{\"p\":\"brc-20\",\"op\":\"mint\",\"tick\":\"ordi\",\"amt\":\"10\"}","divisible":false}}' $(API_URL) | jq . | tee $(UNSIGNED_TX_FILE)
	@echo "Unsigned transaction saved to $(UNSIGNED_TX_FILE)"
	@echo ""

# Target 4: Import wallet using seed and password
import_wallet:
	@echo "--- 4. Importing wallet $(WALLET_NAME)... ---"
	@$(BITCOIN_CLI) createwallet "$(WALLET_NAME)" true
	@echo "Wallet created. Now unlocking and importing seed..."
	@$(BITCOIN_CLI) -rpcwallet="$(WALLET_NAME)" walletpassphrase "$(WALLET_PASS)" 300
	@$(BITCOIN_CLI) -rpcwallet="$(WALLET_NAME)" importdescriptors '[{"desc":"wpkh($(WALLET_SEED))","timestamp":"now","internal":false}]'
	@echo "Wallet imported and unlocked successfully!"
	@echo ""

# Target 5: Extract and sign transaction
sign_transaction:
	@echo "--- 5. Signing transaction from $(UNSIGNED_TX_FILE)... ---"
	@if [ ! -f "$(UNSIGNED_TX_FILE)" ]; then \
		echo "Error: File $(UNSIGNED_TX_FILE) not found!"; \
		echo "Please create a transaction first using make issue_numeric_asset or make issue_named_asset"; \
		exit 1; \
	fi
	@TX_HEX=$$(grep -o '"result": *"[^"]*"' $(UNSIGNED_TX_FILE) | head -1 | cut -d'"' -f4); \
	if [ -z "$$TX_HEX" ]; then \
		echo "Error: Could not extract transaction hex from $(UNSIGNED_TX_FILE)"; \
		exit 1; \
	fi; \
	echo "Extracted transaction hex: $$TX_HEX"; \
	echo "Signing transaction..."; \
	SIGNED_TX=$$($(BITCOIN_CLI) -rpcwallet="$(WALLET_NAME)" signrawtransactionwithwallet "$$TX_HEX" | grep -o '"hex": *"[^"]*"' | cut -d'"' -f4); \
	if [ -z "$$SIGNED_TX" ]; then \
		echo "Error: Failed to sign transaction"; \
		exit 1; \
	fi; \
	echo "$$SIGNED_TX" > $(SIGNED_TX_FILE); \
	echo "Signed transaction saved to $(SIGNED_TX_FILE)"; \
	echo ""

# Target 6: Broadcast signed transaction
broadcast_tx:
	@echo "--- 6. Broadcasting signed transaction from $(SIGNED_TX_FILE)... ---"
	@if [ ! -f "$(SIGNED_TX_FILE)" ]; then \
		echo "Error: File $(SIGNED_TX_FILE) not found!"; \
		echo "Please sign a transaction first using make sign_transaction"; \
		exit 1; \
	fi
	@TX_HEX=$$(cat $(SIGNED_TX_FILE) | tr -d '\n' | tr -d ' '); \
	echo "Broadcasting transaction: $$TX_HEX"; \
	$(CURL_CMD) '{"jsonrpc":"2.0","id":3,"method":"broadcast_tx","params":{"tx_hex":"'$$TX_HEX'"}}' $(API_URL) | jq .
	@echo ""

# Target 7: Complete workflow - create, sign, and broadcast
complete_workflow: issue_numeric_asset sign_transaction broadcast_tx
	@echo "--- Complete workflow finished ---"

# Help Target
help:
	@echo "Usage: make [target]"
	@echo "------------------"
	@echo "Available targets:"
	@echo "  all                  - Runs balance check and asset creation"
	@echo "  check_balance        - Checks the PEPECASH balance"
	@echo "  issue_numeric_asset  - Creates transaction for numeric asset"
	@echo "  issue_named_asset    - Creates transaction for named asset"
	@echo "  import_wallet        - Imports wallet using seed and password"
	@echo "  sign_transaction     - Signs a transaction using wallet"
	@echo "  broadcast_tx         - Broadcasts signed transaction"
	@echo "  complete_workflow    - Complete create-sign-broadcast workflow"
	@echo "  help                 - Shows this help message"

.PHONY: all check_balance issue_numeric_asset issue_named_asset import_wallet sign_transaction broadcast_tx complete_workflow help default