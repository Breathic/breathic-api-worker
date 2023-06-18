import { Hono } from 'hono';
import { cors } from 'hono/cors';
import * as routes from "./routes";

const app = new Hono();

app.use('*', cors());
app.post('/session', async c => await routes.postSession(c));
app.get('/session/:sessionUuid', async c => await routes.getSession(c));
app.get('/device/:deviceUuid', async c => await routes.getSessionsForDevice(c));
app.get('/session/:sessionUuid/readings', async c => await routes.getReadingsForSession(c));
app.get('/session/:sessionUuid/overview', async c => await routes.getOverviewForSession(c));
app.get('/session/:sessionUuid/delete', async c => await routes.deleteSession(c));


export default app;
