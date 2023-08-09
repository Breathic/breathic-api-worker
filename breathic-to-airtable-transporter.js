require('dotenv').config();
const fetch = require('cross-fetch');

const envUrls = [
    //'https://dev.api.breathic.com',
    'https://api.breathic.com',
    //'https://api.breathic.com',
];

const deviceUuids = [
    'DF92206C-8440-4316-8B09-8AE127B651F2'
];

const airtableUrl = 'https://api.airtable.com/v0/';
const baseId = 'appXYE1grIeldnX0G';
const tableId = 'tblE5RFHSa5VZtUFu';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

const getBreathicSessions = async (airtableIds) => {
    const res = await Promise.all(
        envUrls.map(async (envUrl) => {
            return await Promise.all(
                deviceUuids.map(async (deviceUuid) => {
                    const url = `${envUrl}/device/${deviceUuid}`;
                    console.log({url});
                    const res = await fetch(url);
                    const sessions = (await res.json())
                        .filter((session) => !airtableIds.includes(session['sessionUuid']));;
                    let sessionIndex = 0;
                    let sessionsWithOverviews = []

                    while (sessionIndex != sessions.length) {
                        const session = sessions[sessionIndex];

                        if (session) {
                            session.overview = await getOverviewForSession(envUrl, session['sessionUuid']);
                            sessionsWithOverviews.push(session);
                            await sleep(1000);
                        }

                        sessionIndex = sessionIndex + 1;
                    }
                    return sessionsWithOverviews;
                })
            );
        })
    );

    return res.flat(2);
};

const createAirtableRecord = async (session) => {
    const payload = JSON.parse(session.session);

    if (payload.activityKey !== 'Move') {
        return;
    }

    const data = {
        'fields': {
            'Datetime': payload.startTimeUtc,
            'ID': session['sessionUuid'],
            'Moving Time Pretty': payload.elapsedSeconds * 60,
            'Elapsed Time': payload.elapsedSeconds,
            'Type': payload.activityKey.replace(/^./, str => str.toUpperCase()),
            'Distance in K': payload.distance / 1000,
            'Pace Per K': payload.elapsedSeconds / (payload.distance / 1000) * 60,
            'Average Speed In Kph': payload.distance / payload.elapsedSeconds * 3.6,
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
    const breathicSessions = (await getBreathicSessions(airtableIds));

    let index = 0;
    while (index != breathicSessions.length) {
        await createAirtableRecord(breathicSessions[index]);

        index = index + 1;
    }
})();