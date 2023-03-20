# deploy typescript app to worker
npx wrangler publish --config dev|staging|production.toml

# migrate
wrangler d1 execute breathic-api-database-dev|staging|production --file schema.sql

# create test row for a session
curl -X POST -H 'Content-Type: application/json' -d '{"sessionUuid":"temp-session-uuid","deviceUuid":"temp-device-uuid", "payload": "temp-payload", "startTimeEpoch":"1", "endTimeEpoch":"1"}' https://dev.api.breathic.com/session

# get all sessions per device
curl https://dev.api.breathic.com/sessions/{{deviceUuid}}

# get all readings per session
curl https://dev.api.breathic.com/session/{{sessionUuid}}/readings