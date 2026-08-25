import { generate } from 'otp-generator';

export function generateOTP() {
    return generate(6, {
        specialChars: false,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false
    });
}