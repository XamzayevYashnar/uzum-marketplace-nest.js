import bcrypt from 'bcrypt';

export class Crypt {
    static async hash(data: string) {
        return bcrypt.hash(data, 7);
    }

    static async compare(data: string, hashedData: string) {
        return bcrypt.compare(data, hashedData);
    }
}
