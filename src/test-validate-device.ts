import * as dotenv from 'dotenv';

dotenv.config();

import { validateDevice } from './requests';

const {
    DEVICE_TOKEN,
    APP_STORE_DEVICE_CHECK_ID,
    APP_STORE_DEVICE_CHECK_KEY,
    APP_STORE_TEAM_ID,
    APP_STORE_BUNDLE_ID,
} = process.env; 

(async () => {
    try {
        const res = await validateDevice(
            String(DEVICE_TOKEN),
            String(APP_STORE_DEVICE_CHECK_ID),
            String(APP_STORE_DEVICE_CHECK_KEY),
            String(APP_STORE_TEAM_ID),
            String(APP_STORE_BUNDLE_ID)
        );
        console.log(res);
    } catch (err) {
        console.log(err);
    }
})();