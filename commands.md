# Counterparty Asset Issuance Commands

This document provides examples for issuing different types of assets using the Counterparty API v2.

## Named Assets
Named assets use custom names (e.g., MYASSETNAME) as identifiers. These are more human-readable and easier to remember.

```bash
curl -X GET "https://api.counterparty.io:4000/v2/addresses/bc1p865lxyp372lg0nhkze7kkd6u38vpaglrv5cdfjs3r83nk7jaqalqxzxhq8/compose/issuance?\
asset=MYASSETNAME&\
quantity=1&\
divisible=false&\
description=This%20is%20my%20named%20asset&\
encoding=taproot&\
inscription=true&\
fee_rate=25" \
-H "Accept: application/json"
```

## Numeric Assets
Numeric assets use identifiers starting with 'A' followed by numbers. These are useful for programmatic asset creation.

```bash
curl -X GET "https://api.counterparty.io:4000/v2/addresses/bc1p865lxyp372lg0nhkze7kkd6u38vpaglrv5cdfjs3r83nk7jaqalqxzxhq8/compose/issuance?\
asset=A123456789012345678&\
quantity=1&\
divisible=false&\
description=This%20is%20my%20numeric%20asset&\
encoding=taproot&\
inscription=true&\
fee_rate=25" \
-H "Accept: application/json"
```

## Parameters Explained
- `asset`: Asset identifier (MYASSETNAME for named assets, A... for numeric assets)
- `quantity`: Amount of assets to issue
- `divisible`: Whether the asset is divisible (true/false)
- `description`: Asset description or inscription content
- `encoding`: Use 'taproot' for ordinal-compatible inscriptions
- `inscription`: Set to 'true' for ordinal compatibility
- `fee_rate`: Transaction fee rate in satoshis/byte