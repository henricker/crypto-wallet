import { api } from '../util/api.js'

export class CryptoRepository {
    list(page = 1, limit = 5) {
        return api.get('crypto?_page=' + page + '&_limit=' + limit);
    }
}