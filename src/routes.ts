import { Context } from 'hono';
import * as models from "./models";

const postSession = async (c: Context) => {
    c.status(500);

    const {
        sessionUuid,
        deviceUuid,
        payload,
        startTimeEpoch,
        endTimeEpoch,
    } = await c.req.json();

    if (!sessionUuid) return c.json({ success: false, error: "Missing sessionUuid value for new session" });
    if (!deviceUuid) return c.json({ success: false, error: "Missing deviceUuid value for new session" });
    if (!payload) return c.json({ success: false, error: "Missing payload value for new session" });
    if (!startTimeEpoch) return c.json({ success: false, error: "Missing startTimeEpoch value for new session" });
    if (!endTimeEpoch) return c.json({ success: false, error: "Missing endTimeEpoch value for new session" });

    const readingKey = `${deviceUuid}_${sessionUuid}.csv`;
    await c.env.R2_READINGS.put(readingKey, payload);

    const doesSessionExists: boolean = (await models.getSession(c, sessionUuid))!;
    if (doesSessionExists) {
        c.status(409);
        return c.json({ success: false, error: "Session exists already" });
    }

    const { success } = await models.createSession(
        c,
        sessionUuid,
        deviceUuid,
        startTimeEpoch,
        endTimeEpoch,
        readingKey,
    );

    if (!success) {
        return c.json({ success: false, error: 'postSession(): save session error' });
    }

    const session = await models.getSession(c, sessionUuid);
    if (!session) {
        return c.json({ success: false, error: 'postSession(): session read error' });
    }

    c.status(200);
    return c.json(session);
};

const getSessionsForDevice = async (c: Context): Promise<any> => {
    const { deviceUuid } = c.req.param();
    const response = await models.getSessionsForDevice(c, deviceUuid);
    return c.json(response.results);
};

const getReadingsForSession = async (c: Context): Promise<any> => {
    const { sessionUuid } = c.req.param();
    const session = await models.getSession(c, sessionUuid);
    if (!session) {
        return c.text("");
    }
    else {
        const readingKey = session["reading_key"];
        const object = await c.env.R2_READINGS.get(readingKey);

        if (object === null) {
            c.status(404);
            return c.text("Reading Object Not Found");
        }
  
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        c.header('etag', object.httpEtag);
        return c.text(object.body);
    }
};

export {
    postSession,
    getSessionsForDevice,
    getReadingsForSession,
};