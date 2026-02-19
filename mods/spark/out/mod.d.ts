declare module "libs/address/mod" {
    import { packref, textref } from "@hazae41/stdbob";
    export namespace addresses {
        function verify(session: packref): textref;
    }
}
declare module "libs/storages/mod" {
    import { bigintref, textref } from "@hazae41/stdbob";
    export namespace storages {
        namespace supply {
            function get(): bigintref;
            function set(value: bigintref): void;
        }
        namespace balances {
            function get(address: textref): bigintref;
            function set(address: textref, value: bigintref): void;
        }
    }
}
declare module "mod" {
    import { bigintref, blobref, packref, textref } from "@hazae41/stdbob";
    /**
     * Get the name of the token
     * @returns
     */
    export function name(): textref;
    /**
     * Get the symbol of the token
     * @returns
     */
    export function symbol(): textref;
    /**
     * Get the number of decimals of the token
     * @returns
     */
    export function decimals(): i32;
    /**
     * Get the balance of a specific address
     * @param target
     * @returns i64
     */
    export function balance(target: textref): bigintref;
    /**
     * Get the total supply of the token
     * @returns
     */
    export function supply(): bigintref;
    /**
     * Use some session to mint tokens to the caller address
     * @param session
     * @param effort proof of work
     * @returns the amount of tokens minted
     */
    export function mint(session: packref, effort: blobref): bigintref;
    /**
     * Use some session to burn tokens from the caller address
     * @param session
     * @param amount
     * @returns
     */
    export function burn(session: packref, amount: bigintref): void;
    /**
     * Use some session to transfer tokens to a specific address
     * @param session
     * @param target
     * @param amount
     */
    export function transfer(session: packref, target: textref, amount: bigintref): void;
}
