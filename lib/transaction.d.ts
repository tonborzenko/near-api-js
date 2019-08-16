import BN from 'bn.js';
import { Signer } from './signer';
declare class Enum {
    enum: string;
    constructor(properties: any);
}
declare class Assignable {
    constructor(properties: any);
}
export declare class FunctionCallPermission extends Assignable {
    allowance?: BN;
    receiverId: string;
    methodNames: String[];
}
export declare class FullAccessPermission extends Assignable {
}
export declare class AccessKeyPermission extends Enum {
    functionCall: FunctionCallPermission;
    fullAccess: FullAccessPermission;
}
export declare class AccessKey extends Assignable {
    nonce: number;
    permission: AccessKeyPermission;
}
export declare function fullAccessKey(): AccessKey;
export declare function functionCallAccessKey(receiverId: string, methodNames: String[], allowance?: BN): AccessKey;
export declare class IAction extends Assignable {
}
declare class CreateAccount extends IAction {
}
declare class DeployContract extends IAction {
    code: Uint8Array;
}
declare class FunctionCall extends IAction {
    methodName: string;
    args: Uint8Array;
    gas: BN;
    deposit: BN;
}
declare class Transfer extends IAction {
    deposit: BN;
}
declare class Stake extends IAction {
    stake: BN;
    publicKey: PublicKey;
}
declare class AddKey extends IAction {
    publicKey: PublicKey;
    accessKey: AccessKey;
}
declare class DeleteKey extends IAction {
    publicKey: PublicKey;
}
declare class DeleteAccount extends IAction {
    beneficiaryId: string;
}
export declare function createAccount(): Action;
export declare function deployContract(code: Uint8Array): Action;
export declare function functionCall(methodName: string, args: Uint8Array, gas: number, deposit: BN): Action;
export declare function transfer(deposit: BN): Action;
export declare function stake(stake: BN, publicKey: string): Action;
export declare function addKey(publicKey: string, accessKey: AccessKey): Action;
export declare function deleteKey(publicKey: string): Action;
export declare function deleteAccount(beneficiaryId: string): Action;
declare enum KeyType {
    ED25519 = 0
}
declare class PublicKey {
    keyType: KeyType;
    data: Uint8Array;
    constructor(publicKey: string);
}
declare class Signature {
    keyType: KeyType;
    data: Uint8Array;
    constructor(signature: Uint8Array);
}
declare class Transaction extends Assignable {
    signerId: string;
    publicKey: PublicKey;
    nonce: number;
    receiverId: string;
    actions: Array<Action>;
}
export declare class SignedTransaction extends Assignable {
    transaction: Transaction;
    signature: Signature;
    encode(): Uint8Array;
}
export declare class Action extends Enum {
    createAccount: CreateAccount;
    deployContract: DeployContract;
    functionCall: FunctionCall;
    transfer: Transfer;
    stake: Stake;
    addKey: AddKey;
    deleteKey: DeleteKey;
    deleteAccount: DeleteAccount;
}
export declare function signTransaction(receiverId: string, nonce: number, actions: Action[], signer: Signer, accountId?: string, networkId?: string): Promise<[Uint8Array, SignedTransaction]>;
export {};
