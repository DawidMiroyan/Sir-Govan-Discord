"use strict";

import Eris from 'eris';

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import {argType} from './defines';

interface StringArg {
    type: argType.string;
    value: string | null;
}

interface NumberArg {
    type: argType.number;
    value: number | null;
}

interface UserArg {
    type: argType.user;
    value: string | null;
}

interface ChannelArg {
    type: argType.channel;
    value: string | null;
}

interface RoleArg {
    type: argType.role;
    value: string | null;
}

interface RestArg {
    type: argType.rest;
    value: string | null;
}

type Arg = StringArg | NumberArg | UserArg | ChannelArg | RoleArg | RestArg;

export function arg (type: argType.string, value?: string | null): StringArg;
export function arg (type: argType.number, value?: number | null): NumberArg;
export function arg (type: argType.user, value?: string | null): UserArg;
export function arg (type: argType.channel, value?: string | null): ChannelArg;
export function arg (type: argType.role, value?: string | null): RoleArg;
export function arg (type: argType.rest, value?: string | null): RestArg;

export function arg(type: argType, value: any = null): Arg {
    return {
        type: type,
        value: value
    };
}

export function parseArgs(msg: Eris.Message, ...args: Arg[]) {
    let ret: Array<boolean | number | string | Eris.Member | Eris.Channel | Eris.Role | null | undefined> = [false];
    let word = 1;
    let words = msg.content.replace(/ +/g, ' ').split(' ');
    let specialHolder;
    for (let arg of args) {
        let inspected = words[word];
        switch (arg.type) {
            case argType.string:
                ret.push(inspected || arg.value);
                break;
            case argType.number:
                if (inspected && Number.isFinite(+inspected) && !Number.isNaN(+inspected)) {
                    ret.push(+inspected);
                } else {
                    if (arg.value) {
                        ret.push(arg.value);
                        word--;
                    } else {
                        return [true];
                    }
                }
                break;
            case argType.user:
                specialHolder = /<@!?([0-9]+?)>/.exec(inspected);
                if (specialHolder && specialHolder[1]) {
                    if ((msg.channel as Eris.TextChannel).guild.members.get(specialHolder[1])) {
                        ret.push((msg.channel as Eris.TextChannel).guild.members.get(specialHolder[1]));
                        break;
                    }
                }
                return [true];
            case argType.channel:
                specialHolder = /<#([0-9]+?)>/.exec(inspected);
                if (specialHolder && specialHolder[1]) {
                    if ((msg.channel as Eris.TextChannel).guild.channels.get(specialHolder[1])) {
                        ret.push((msg.channel as Eris.TextChannel).guild.channels.get(specialHolder[1]));
                        break;
                    }
                }
                return [true];
            case argType.role:
                specialHolder = /<@\&([0-9]+?)>/.exec(inspected);
                if (specialHolder && specialHolder[1]) {
                    if ((msg.channel as Eris.TextChannel).guild.roles.get(specialHolder[1])) {
                        ret.push((msg.channel as Eris.TextChannel).guild.roles.get(specialHolder[1]));
                        break;
                    }
                }
                return [true];
            case argType.rest:
                ret.push(words.slice(word).join(' '));
                break;
            default:
                throw new Error('Undefined argument');
        }
        word++;
    }
    return ret;
}

export function randFromFile(filename: string, def: string, cb: (s: string) => void) {
    fs.readFile(path.join('data', filename), "utf8", function(err, data) {
        if(err) {
            console.log(`Error detected: ${err}`);
            cb(def);
        } else {
            let lines = data.trim().split('\n');
            cb(lines[Math.floor(Math.random() * lines.length)]);
        }
    });
}

export function randomBigInt(max: bigint = 20n, min: bigint = 0n): bigint {
    let r: bigint;
    const range = 1n + max - min;
    const bytes = BigInt(Math.ceil(range.toString(2).length / 8));
    const bits = bytes * 8n;
    const buckets = (2n ** bits) / range;
    const limit = buckets * range;

    do {
        r = BigInt('0x' + crypto.randomBytes(Number(bytes)).toString('hex'));
    } while (r >= limit);

    return min + (r / buckets);
}

/** Gotten from https://stackoverflow.com/a/55699349 */
export function randomEnum<T>(anEnum: T): T[keyof T] {
    const enumValues = Object.keys(anEnum)
        .map(n => Number.parseInt(n))
        .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][];
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    const randomEnumValue = enumValues[randomIndex];
    return randomEnumValue;
  }

/** Gotten from https://stackoverflow.com/a/2450976 */
export function shuffleArray<T>(arr: Array<T>) {
    let curr: number = arr.length;
    let tempVal: T;
    let randIndex: number;

    while (curr !== 0) {
        randIndex = Math.floor(Math.random() * curr);
        curr--;

        tempVal = arr[curr];
        arr[curr] = arr[randIndex];
        arr[randIndex] = tempVal;
    }
}

export function randomLetter(): string {
    const mask = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&?'.split('');
    return mask[Math.floor(Math.random() * mask.length)];
}

export function randomCode(): string {
    const len = 16; // 16, huh?
    let mask = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&?'.split('');
    shuffleArray(mask);

    return mask.slice(0, len).join('');
}