check pepecash balance
⁠  curl -s -X POST --header "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":0,"method":"get_balances","params":{"filters":[{"field":"address","op":"==","value":"bc1qd0nzd63c8qxzgq8649qwd5w8dfcrl8w8fk9x35"},{"field":"asset","op":"==","value":"PEPECASH"}]}}' https://api.counterparty.io:4000 | jq . ⁠


issue numeric asset
⁠  curl -s -X POST --header "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"create_issuance","params":{"source":"bc1qd0nzd63c8qxzgq8649qwd5w8dfcrl8w8fk9x35","asset":"A173829102938475610","quantity":10,"description":"{\"p\":\"brc-20\",\"op\":\"mint\",\"tick\":\"ordi\",\"amt\":\"10\"}","divisible":true}}' https://api.counterparty.io:4000 | jq . ⁠

 curl -s -X POST --header "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":2,"method":"create_issuance","params":{"source":"bc1qd0nzd63c8qxzgq8649qwd5w8dfcrl8w8fk9x35","asset":"MYASSETNAME","quantity":10,"description":"{\"p\":\"brc-20\",\"op\":\"mint\",\"tick\":\"ordi\",\"amt\":\"10\"}","divisible":false}}' https://api.counterparty.io:4000 | jq . ⁠


###############
V2

```

curl -X POST "https://api.counterparty.io:4000/v2/addresses/bc1p865lxyp372lg0nhkze7kkd6u38vpaglrv5cdfjs3r83nk7jaqalqxzxhq8/compose/issuance?asset=MY_ASSET&quantity=1&divisible=false&encoding=taproot&inscription=true&fee_rate=2" \
-H "Accept: application/json" \
-H "Content-Type: application/json" \
-d '{
  "description": "This is an inscription for a named asset.",
  "mime_type": "text/plain"
}'
```

```
Numeric asset insc

curl -X POST "https://api.counterparty.io:4000/v2/addresses/bc1p865lxyp372lg0nhkze7kkd6u38vpaglrv5cdfjs3r83nk7jaqalqxzxhq8/compose/issuance?asset=123456&quantity=1&divisible=false&encoding=taproot&inscription=true&fee_rate=2" \
-H "Accept: application/json" \
-H "Content-Type: application/json" \
-d '{
  "description": "Inscription for numeric asset 123456.",
  "mime_type": "text/plain"
}'
```

```
JPEG 
xxd -p "/path/to/your/image.jpg" | tr -d '\n' > image.hex

curl -X POST "https://api.counterparty.io:4000/v2/addresses/bc1p865lxyp372lg0nhkze7kkd6u38vpaglrv5cdfjs3r83nk7jaqalqxzxhq8/compose/issuance?asset=JPEG_ASSET&quantity=1&divisible=false&encoding=taproot&inscription=true&fee_rate=2" \
-H "Accept: application/json" \
-H "Content-Type: application/json" \
-d '{
  "description": "'"$(cat image.hex)"'",
  "mime_type": "image/jpeg"
}'
```

#############
```
curl -X GET "https://api.counterparty.io:4000/v2/addresses/bc1p865lxyp372lg0nhkze7kkd6u38vpaglrv5cdfjs3r83nk7jaqalqxzxhq8/compose/issuance?asset=A987654321098765432&quantity=1&divisible=false&description=This%20is%20my%20ordinal%20content&encoding=taproot&inscription=true" -H "Accept: application/json" | jq .
```