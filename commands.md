check pepecash balance
⁠  curl -s -X POST --header "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":0,"method":"get_balances","params":{"filters":[{"field":"address","op":"==","value":"bc1qd0nzd63c8qxzgq8649qwd5w8dfcrl8w8fk9x35"},{"field":"asset","op":"==","value":"PEPECASH"}]}}' https://api.counterparty.io:4000 | jq . ⁠


issue numeric asset
⁠  curl -s -X POST --header "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"create_issuance","params":{"source":"bc1qd0nzd63c8qxzgq8649qwd5w8dfcrl8w8fk9x35","asset":"A173829102938475610","quantity":10,"description":"{\"p\":\"brc-20\",\"op\":\"mint\",\"tick\":\"ordi\",\"amt\":\"10\"}","divisible":true}}' https://api.counterparty.io:4000 | jq . ⁠

 curl -s -X POST --header "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":2,"method":"create_issuance","params":{"source":"bc1qd0nzd63c8qxzgq8649qwd5w8dfcrl8w8fk9x35","asset":"MYASSETNAME","quantity":10,"description":"{\"p\":\"brc-20\",\"op\":\"mint\",\"tick\":\"ordi\",\"amt\":\"10\"}","divisible":false}}' https://api.counterparty.io:4000 | jq . ⁠
