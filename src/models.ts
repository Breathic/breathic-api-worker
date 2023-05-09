import { Context } from 'hono';

const getSessionsForDevice = async (
    c: Context,
    deviceUuid: string,
): Promise<any> => {
    return await c.env.DB.prepare(`
        select * from sessions where deviceUuid = ?
        and deletedAt is NULL
    `)
    .bind(deviceUuid)
    .all();
};

const getSession = async (
    c: Context,
    sessionUuid: string,
): Promise<any> => {
    const response = await c.env.DB.prepare(`
        select * from sessions where sessionUuid = ?
        and deletedAt is NULL
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
): Promise<any> => {
    const timestamp = parseInt(new Date().getTime() / 1000);

    return await c.env.DB.prepare(`
        insert into sessions (
            sessionUuid,
            deviceUuid,
            session,
            createdAt,
            modifiedAt
        ) values (?, ?, ?, ?, ?)
    `)
    .bind(
        sessionUuid,
        deviceUuid,
        session,
        timestamp,
        timestamp,
    )
    .run();
};

const deleteSession = async (
    c: Context,
    sessionUuid: string,
): Promise<any> => {
    const timestamp = parseInt(new Date().getTime() / 1000);
    return await c.env.DB.prepare(`
        UPDATE sessions SET deletedAt=? WHERE sessionUuid=? 
    `)
    .bind(timestamp, sessionUuid)
    .all();
};

export {
    getSessionsForDevice,
    getSession,
    createSession,
    deleteSession,
};