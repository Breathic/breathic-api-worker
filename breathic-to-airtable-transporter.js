require('dotenv').config();
const fetch = require('cross-fetch');

const envUrls = [
    'https://dev.api.breathic.com',
    'https://staging.api.breathic.com',
    //'https://api.breathic.com',
];

const deviceUuids = [
    'B0ACEBD3-045A-4F12-A87A-9B95D2F83BEB',
    'AFE783B4-4024-4D13-8373-AD44D4EC67CA',
];

const airtableUrl = 'https://api.airtable.com/v0/';
const baseId = 'appXYE1grIeldnX0G';
const tableId = 'tblE5RFHSa5VZtUFu';

const getAirtableIds = async () => {
    const options = {
        method: 'GET',
        headers: {
            authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`
        }
    };
    const res = await fetch(`${airtableUrl}${baseId}/${tableId}`, options);
    const json = await res.json();
    const ids = json.records.map((record) => record.fields.ID);
    return ids;
};

const getOverviewForSession = async (envUrl, sessionUuid) => {
    const res = await fetch(`${envUrl}/session/${sessionUuid}/overview`);
    return res.json();
};

const getBreathicSessions = async () => {
    const sessions = await Promise.all(
        envUrls.map(async (envUrl) => {
            return await Promise.all(
                deviceUuids.map(async (deviceUuid) => {
                    const res = await fetch(`${envUrl}/sessions/${deviceUuid}`);
                    return await Promise.all(
                        (await res.json()).map(async (session) => {
                            session.overview = await getOverviewForSession(envUrl, session['session_uuid']);
                            return session;
                        })
                    );
                })
            );
        })
    );

    return sessions.flat(2);
};

const createAirtableRecord = async (session) => {
    const payload = JSON.parse(session.session);

    const data = {
        'fields': {
            'Datetime': payload.startTimeUtc,
            'ID': session['session_uuid'],
            'Moving Time Pretty': payload.elapsedSeconds,
            'Elapsed Time': payload.elapsedSeconds,
            'Type': payload.activityKey.replace(/^./, str => str.toUpperCase()),
            'Distance in K': payload.distance / 1000,
            //'Pace Per K': 8520,
            //'Average Speed In Kph': 25.42,
            'Average Heartrate': session.overview.heart,
            'Average Breathrate': session.overview.breath,
          }
    };
    const options = {
        method: 'POST',
        headers: {
            authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data)
    };
    const res = await fetch(`${airtableUrl}${baseId}/${tableId}`, options);
    const json = await res.json();
    console.log(json);
};

(async () => {
    const airtableIds = await getAirtableIds();
    let breathicSessions = (await getBreathicSessions())
        .filter((session) => !airtableIds.includes(session['session_uuid']));

    let index = 0;
    while (index != breathicSessions.length) {
        await createAirtableRecord(breathicSessions[index]);

        index = index + 1;
    }
})();