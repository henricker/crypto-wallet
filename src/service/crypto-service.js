import { Crypto } from "../entities/crypto.js";
import { CryptoRepository } from "../repository/crypto-repository.js";

export class CryptoService {
    constructor() {
        this.repository = new CryptoRepository();
    }

  async *list() {
    let page = 1;
    const limit = 5;
    while (true) {
      const data = await this.repository.list(page, limit);
      if(!data) return;
      yield data.map(item => new Crypto(item));
      page += 1;
    }
  }
}