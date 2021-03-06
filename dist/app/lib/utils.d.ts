import { IConfig } from '../Interface/IConfig';
import { IGlobalConfig } from '../Interface/IGlobalConfig';
export declare function objHasValue(obj: object, names: PropertyKey[], val: any): boolean;
export declare function hasUndefined<T extends Parameters<typeof objHasValue>>(...args: [T[0], T[1]]): boolean;
export declare function readConfig(name: string): Promise<IConfig>;
export declare function readGlobalConfig(): Promise<IGlobalConfig>;
export declare function writeToGlobalConfig(obj: IGlobalConfig): Promise<void>;
export declare function changeJson<T>(jsonpath: string, cbk: (obj: T) => Promise<T>): Promise<void>;
export declare function runInDir<T extends Parameters<typeof runWithError>>(dirpath: string, ...args: T): Promise<void>;
export declare function runWithError<T extends any[]>(func: (...args: T) => any, errorcbk?: (e: any) => void, args?: T): Promise<void>;
export declare function changeExt(fpath: string, ext?: string): string;
export declare function innerCopy(src: string, dest: string): Promise<void>;
export declare function getUrlFromPath(fpath: string, baseurl?: string): string;
export declare function pathMap(srcpath: string, base: string, newbase: string): string;
export declare function cached<T extends any[], R>(func: (...args: T) => R): (...args: T) => Readonly<R>;
export declare function mapCached<T extends any[], R>(func: (...args: T) => R): (...args: T) => Readonly<R>;
