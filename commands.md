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
fee_rate=2" \
-H "Accept: application/json"
```

## Numeric Assets
Numeric assets use identifiers starting with 'A' followed by numbers. These are useful for programmatic asset creation.

```bash
curl -X GET "https://api.counterparty.io:4000/v2/addresses/bc1p865lxyp372lg0nhkze7kkd6u38vpaglrv5cdfjs3r83nk7jaqalqxzxhq8/compose/issuance?\
asset=A987654321098765432&\
quantity=1&\
divisible=false&\
description=This%20is%20my%20numeric%20asset&\
encoding=taproot&\
inscription=true&\
fee_rate=2" \
-H "Accept: application/json"
```

## Image Inscription Assets
Assets can also be created with JPEG images and BRC-20 metadata. This is useful for creating visual tokens with associated metadata.

```bash
# First, resize the image to roughly 8KB (using ImageMagick)
convert /Users/marco/code/UCASH/xcp/ordinalA.jpeg -resize "150x150>" -quality 85 resized_ordinal.jpg

# Verify the size is under 8KB (8192 bytes)
stat -f%z resized_ordinal.jpg

# Convert the image to hex format and store in variable
HEX_DATA=$(xxd -p resized_ordinal.jpg | tr -d '\n')

# Make sure the hex data is under 8KB
echo -n "$HEX_DATA" | wc -c

# Make the API call with the hex data
curl -X POST "https://api.counterparty.io:4000/v2/addresses/bc1p865lxyp372lg0nhkze7kkd6u38vpaglrv5cdfjs3r83nk7jaqalqxzxhq8/compose/issuance" \
-H "Accept: application/json" \
-H "Content-Type: application/x-www-form-urlencoded" \
--data-urlencode "asset=ORDINALMINT" \
--data-urlencode "quantity=1" \
--data-urlencode "divisible=false" \
--data-urlencode "description=$HEX_DATA" \
--data-urlencode "encoding=taproot" \
--data-urlencode "inscription=true" \
--data-urlencode "mime_type=image/jpeg" \
--data-urlencode "fee_rate=2"
```

Note: For image inscriptions, the `description` field should contain the base64 encoded image data. The BRC-20 metadata (if needed) should be handled separately.

## Parameters Explained
- `asset`: Asset identifier (MYASSETNAME for named assets, A... for numeric assets)
- `quantity`: Amount of assets to issue
- `divisible`: Whether the asset is divisible (true/false)
- `description`: Asset description or inscription content (can include JSON metadata)
- `encoding`: Use 'taproot' for ordinal-compatible inscriptions
- `inscription`: Set to 'true' for ordinal compatibility
- `mime_type`: Content type of the inscription (e.g., 'image/jpeg' for JPEG images)
- `image_data`: Base64 encoded image data when inscribing images
- `fee_rate`: Transaction fee rate in satoshis/byte