import { Hono } from 'hono';
import { cors } from 'hono/cors';
import * as routes from "./routes";

const app = new Hono();

app.use('*', cors());
app.post('/session', async c => await routes.postSession(c));
app.get('/sessions/:deviceUuid', async c => await routes.getSessionsForDevice(c));
app.get('/session/:sessionUuid/readings', async c => await routes.getReadingsForSession(c));
app.get('/session/:sessionUuid/overview', async c => await routes.getOverviewForSession(c));

export default app;
