#!/bin/sh
mkdir -p cert
echo "$PRIVATE_KEY_B64" | base64 -d > cert/private-key.pem
echo "$PUBLIC_KEY_B64"  | base64 -d > cert/public-key.pub
npx drizzle-kit push
node index.js