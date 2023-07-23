import { Runtype, Static } from '../runtype';
declare type RecordStaticType<O extends {
    [_: string]: Runtype;
}, RO extends boolean> = RO extends true ? {
    readonly [K in keyof O]: Static<O[K]>;
} : {
    [K in keyof O]: Static<O[K]>;
};
export interface Record<O extends {
    [_: string]: Runtype;
}, RO extends boolean> extends Runtype<RecordStaticType<O, RO>> {
    tag: 'record';
    fields: O;
    isReadonly: RO;
    asReadonly(): Record<O, true>;
}
/**
 * Construct a record runtype from runtypes for its values.
 */
export declare function InternalRecord<O extends {
    [_: string]: Runtype;
}, RO extends boolean>(fields: O, isReadonly: RO): Record<O, RO>;
export declare function Record<O extends {
    [_: string]: Runtype;
}>(fields: O): Record<O, false>;
export {};
