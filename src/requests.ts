import jwt from '@tsndr/cloudflare-worker-jwt';
import { Buffer } from 'buffer';

const uuid = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const validateDevice = async (
    deviceToken: string,
    keyId: string,
    key: string,
    teamId: string,
    bundleId: string
): Promise<Boolean> => {
    try {
        const bearerToken = await jwt.sign(
            {
                iss: teamId,
                iat: Date.now() / 1000,
                exp: (Date.now() + 600 * 1000) / 1000,
                sub: bundleId
            },
            Buffer.from(key, 'base64').toString('ascii'),
            {
                algorithm: 'ES256',
                header: {
                    kid: keyId
                }
            }
        );
        const payload = {
            timestamp: Date.now(),
            transaction_id: uuid(),
            device_token: deviceToken
        };
        const url = `https://api.devicecheck.apple.com/v1/validate_device_token`;
        const headers = {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json'
        };
        const request = new Request(
            url,
            {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            }
        );

        const response = await fetch(request);
        if (response.status === 200 && response.ok) {
            return true;
        }
    } catch (err) {
        console.log('validateDevice()', err);
    }

    return false;
};

export {
    validateDevice,
};