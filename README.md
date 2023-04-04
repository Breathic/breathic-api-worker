# create private key (under /breathic/Extension/keys)
openssl rand -hex 20 -out development|staging|production.key

# manually replace those keys for development|staging|production.toml for PRIVATE_KEY

# deploy typescript app to worker
npx wrangler publish --config configs/development|staging|production.toml

# migrate
wrangler d1 execute breathic-api-database-dev|staging|production --file schema.sql

# create test row for a session
curl -X POST -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2YWxpZGF0aW9uS2V5IjoiRDQ1MTMyNDAtMThFRi00RjUxLUI3RkUtNzdEOEMxMzY4NEQ1In0.WeIusABRH-XwyBR6PTtpuaj3C9eMdDpsd1JAsrK5Maw' -d '{"sessionUuid":"D4513240-18EF-4F51-B7FE-77D8C13684D5","deviceUuid":"temp-device-uuid", "payload": "temp-payload", "session":"{}"}' https://dev|staging.api.breathic.com/session

# get all sessions per device
curl https://dev.api.breathic.com/sessions/{{deviceUuid}}

# get all readings per session
curl https://dev.api.breathic.com/session/{{sessionUuid}}/readings

