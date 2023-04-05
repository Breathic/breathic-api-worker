import jwt from '@tsndr/cloudflare-worker-jwt';
const Buffer = require('buffer/').Buffer;

const uuid = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const validateDevice = async (
    DEVICE_TOKEN: string,
    KEY_ID: string,
    KEY: string,
    TEAM_ID: string,
    BUNDLE_ID: string
): Promise<Boolean> => {
    try {
        const jwtHeaders = {
            algorithm: 'ES256',
            header: {
                kid: KEY_ID
            }
        };
        const jwToken = await jwt.sign(
            {
                iss: TEAM_ID,
                iat: Date.now() / 1000,
                exp: (Date.now() + 600 * 1000) / 1000,
                sub: BUNDLE_ID
            },
            Buffer.from(String(KEY), 'base64').toString('ascii'),
            jwtHeaders
        );
        const payload = {
            timestamp: Date.now(),
            transaction_id: uuid(),
            device_token: DEVICE_TOKEN
        };
        const url = `https://api.devicecheck.apple.com/v1/validate_device_token`;
        const headers = {
            Authorization: `Bearer ${jwToken}`,
            'Content-Type': 'application/json'
        };
        const request = new Request(
            url,
            { method: 'POST', headers, body: JSON.stringify(payload) }
        );
        const response = await fetch(request);
        if (response.status === 200 && response.ok) {
            return true;
        }
    } catch (err) {
        console.log('validateDevice()', err);
    };

    return false;
};

export {
    validateDevice,
};