import type { Request } from "express";
import { UAParser } from "ua-parser-js";

export function getDeviceInfo(req: Request){
    const parser = new UAParser(req.headers['user-agent']);
    const result = parser.getResult();
    return result;
}