declare module "mod" {
    import { bigintref, blobref, packref, textref } from "@hazae41/stdbob";
    export function verify(session: packref): bool;
    export function nonce(address: textref): bigintref;
    export function call(module: textref, method: textref, params: packref, pubkey: blobref, signature: blobref): packref;
}
