declare module "libs/address/mod" {
    import { packref, textref } from "@hazae41/stdbob";
    export namespace addresses {
        function verify(session: packref): textref;
    }
}
declare module "mod" {
    import { bigintref, packref, textref } from "@hazae41/stdbob";
    /**
     * Initialize the token with a specific owner
     * @param creator
     * @returns nothing
     */
    export function init(creator: textref): void;
    /**
     * Get the balance of a specific address
     * @param target
     * @returns i64
     */
    export function balance(target: textref): bigintref;
    /**
     * Use the owner session to mint tokens to a specific address
     * @param session
     * @param target
     * @param amount
     */
    export function mint(session: packref, target: textref, amount: bigintref): void;
    /**
     * Use some session to transfer tokens to a specific address
     * @param session
     * @param target
     * @param amount
     */
    export function transfer(session: packref, target: textref, amount: bigintref): void;
}
