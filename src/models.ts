import { Context } from 'hono';

const getSessionsForDevice = async (
    c: Context,
    deviceUuid: string,
): Promise<any> => {
    return await c.env.DB.prepare(`
        select * from sessions where device_uuid = ?
    `)
    .bind(deviceUuid)
    .all();
};

const getSession = async (
    c: Context,
    sessionUuid: string,
): Promise<any> => {
    const response = await c.env.DB.prepare(`
        select * from sessions where session_uuid = ?
    `)
    .bind(sessionUuid)
    .all();

    if (response.results.length) {
        return response.results[0];
    }
    else {
        return null;
    }
};

const createSession = async (
    c: Context,
    sessionUuid: string,
    deviceUuid: string,
    session: string,
    readingKey: string,
): Promise<any> => {
    const timestamp = parseInt(new Date().getTime() / 1000);

    return await c.env.DB.prepare(`
        insert into sessions (
            session_uuid,
            device_uuid,
            reading_key,
            session,
            createdAt,
            modifiedAt
        ) values (?, ?, ?, ?, ?, ?)
    `)
    .bind(
        sessionUuid,
        deviceUuid,
        readingKey,
        session,
        timestamp,
        timestamp,
    )
    .run();
};

export {
    getSessionsForDevice,
    getSession,
    createSession,
};