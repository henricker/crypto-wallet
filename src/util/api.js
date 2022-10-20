import 'dotenv/config'
import http from 'http';

class Api {
    constructor (baseUrl) {
        this.baseUrl = baseUrl
    }
    
    async get (path) {
        return new Promise((resolve, reject) => {
            http.get(`${this.baseUrl}/${path}`, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve(JSON.parse(data.toString()));
                });
                res.on('error', reject)
            }).on('error', reject);
        });
    }
    
}
const { PROVIDER_URL } = process.env;

const api = new Api(PROVIDER_URL);

export { api };