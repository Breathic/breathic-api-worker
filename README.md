npx wrangler publish --name breathic-api-worker
wrangler d1 execute breathic-api-database --file schema.sql
curl https://breathic-api-worker.andrus.workers.dev/api/posts/hello-world/comments

curl -X POST -H 'Content-Type: application/json' -d '{"sessionUuid":"temp-session-uuid","deviceUuid":"temp-device-uuid", "payload": "temp-payload", "startTimeEpoch":"1", "endTimeEpoch":"1"}' https://api.breathic.com/session

curl https://api.breathic.com/sessions/{{deviceUuid}}

curl https://api.breathic.com/session/{{sessionUuid}}/readings