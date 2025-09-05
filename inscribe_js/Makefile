# Makefile for broadcasting Ordinal inscription chunks

# Configuration
CHUNK_DIR = inscription_outputs
BROADCAST_URL = https://blockstream.info/api/tx
SLEEP_TIME = 30
CONFIRM_WAIT = 60

# Find all raw transaction files and sort them numerically
RAW_TX_FILES = $(wildcard $(CHUNK_DIR)/raw_tx_chunk_*.txt)
CHUNK_NUMBERS = $(shell for file in $(RAW_TX_FILES); do \
    basename $$file | sed 's/raw_tx_chunk_//' | sed 's/\.txt//'; \
done | sort -n)

.PHONY: all broadcast-chunks broadcast-chunk-% check-tx check-tx-% clean help extract-raw-txs list-chunks

help:
	@echo "Ordinal Inscription Broadcasting Makefile"
	@echo ""
	@echo "Available commands:"
	@echo "  make extract-raw-txs     - Extract raw transactions from JSON files"
	@echo "  make list-chunks         - List all available chunks"
	@echo "  make broadcast-chunks    - Broadcast all chunks in order"
	@echo "  make broadcast-chunk-N   - Broadcast specific chunk (replace N with chunk number)"
	@echo "  make check-tx-N          - Check status of a specific transaction"
	@echo "  make wait-confirm-N      - Wait for transaction to confirm"
	@echo "  make clean               - Remove temporary files"

extract-raw-txs:
	@echo "Extracting raw transactions from JSON files..."
	@node extract_raw_txs_fixed.js

list-chunks:
	@echo "Available chunks:"
	@for chunk in $(CHUNK_NUMBERS); do \
		if [ -f "$(CHUNK_DIR)/raw_tx_chunk_$$chunk.txt" ]; then \
			echo "Chunk $$chunk: $(CHUNK_DIR)/raw_tx_chunk_$$chunk.txt"; \
		fi; \
	done

broadcast-chunks: $(addprefix broadcast-chunk-,$(CHUNK_NUMBERS))

broadcast-chunk-%:
	@if [ -f "$(CHUNK_DIR)/raw_tx_chunk_$*.txt" ]; then \
		echo "Broadcasting chunk $*..."; \
		raw_tx=$$(cat "$(CHUNK_DIR)/raw_tx_chunk_$*.txt"); \
		response=$$(curl -s -X POST "$(BROADCAST_URL)" -d "$$raw_tx" -H "Content-Type: text/plain"); \
		if echo "$$response" | grep -q "^[a-f0-9]\{64\}$$"; then \
			echo "✅ Chunk $* broadcast successfully!"; \
			echo "Transaction ID: $$response"; \
			echo "Mempool link: https://mempool.space/tx/$$response"; \
			echo "$$response" > "$(CHUNK_DIR)/txid_chunk_$*.txt"; \
			if [ "$*" -ne "$(lastword $(CHUNK_NUMBERS))" ]; then \
				echo "Waiting $(SLEEP_TIME) seconds before next chunk..."; \
				sleep $(SLEEP_TIME); \
			fi; \
		else \
			echo "❌ Failed to broadcast chunk $*"; \
			echo "Response: $$response"; \
			exit 1; \
		fi; \
	else \
		echo "❌ Chunk $* not found: $(CHUNK_DIR)/raw_tx_chunk_$*.txt"; \
		exit 1; \
	fi

check-tx-%:
	@if [ -f "$(CHUNK_DIR)/txid_chunk_$*.txt" ]; then \
		txid=$$(cat "$(CHUNK_DIR)/txid_chunk_$*.txt"); \
		echo "Checking status of transaction $$txid..."; \
		status=$$(curl -s "https://blockstream.info/api/tx/$$txid/status"); \
		if [ $$? -eq 0 ]; then \
			echo "$$status" | python -m json.tool 2>/dev/null || echo "$$status"; \
		else \
			echo "Error checking transaction status"; \
		fi; \
	else \
		echo "No transaction ID found for chunk $*. Please broadcast it first."; \
	fi

wait-confirm-%:
	@if [ -f "$(CHUNK_DIR)/txid_chunk_$*.txt" ]; then \
		txid=$$(cat "$(CHUNK_DIR)/txid_chunk_$*.txt"); \
		echo "Waiting for transaction $$txid to confirm..."; \
		while true; do \
			status=$$(curl -s "https://blockstream.info/api/tx/$$txid/status"); \
			if echo "$$status" | grep -q '"confirmed":true'; then \
				echo "✅ Transaction $$txid confirmed!"; \
				break; \
			elif echo "$$status" | grep -q '"confirmed":false'; then \
				echo "⏳ Transaction still in mempool, waiting $(CONFIRM_WAIT) seconds..."; \
				sleep $(CONFIRM_WAIT); \
			else \
				echo "❌ Error checking status: $$status"; \
				break; \
			fi; \
		done; \
	else \
		echo "No transaction ID found for chunk $*"; \
	fi

clean:
	@echo "Cleaning up transaction ID files..."
	@rm -f $(CHUNK_DIR)/txid_chunk_*.txt
	@echo "Clean complete."