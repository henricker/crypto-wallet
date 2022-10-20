
const kUsers = Symbol('users');

export class Users {
    constructor() {
        this[kUsers] = new Set();
    }
    
    add(user) {
        this[kUsers].add(user);
    }

    remove(user) {
        this[kUsers].delete(user);
    }

    hasUsers() {
        return this[kUsers].size !== 0;
    }

    [Symbol.iterator]() {
        return this[kUsers].values();
    }
}