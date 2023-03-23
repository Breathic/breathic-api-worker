import { Context } from 'hono';
import * as models from "./models";

const postSession = async (c: Context) => {
    c.status(500);

    const {
        sessionUuid,
        deviceUuid,
        session,
        payload,
    } = await c.req.json();

    if (!sessionUuid) return c.json({ success: false, error: "Missing sessionUuid argument for new session" });
    if (!deviceUuid) return c.json({ success: false, error: "Missing deviceUuid argument for new session" });
    if (!session) return c.json({ success: false, error: "Missing session argument for new session" });
    if (!payload) return c.json({ success: false, error: "Missing payload argument for new session" });

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
        session,
        readingKey,
    );

    if (!success) {
        return c.json({ success: false, error: 'postSession(): save session error' });
    }

    const res = await models.getSession(c, sessionUuid);
    if (!res) {
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