const { SignedTransaction } = require('./protos');

/**
 * Client for communicating with near blockchain. 
 */

function _arrayBufferToBase64(buffer) {
    return Buffer.from(buffer).toString('base64');
}

function _base64ToBuffer(str) {
    return new Buffer.from(str, 'base64');
}

class NearClient {
    constructor(signer, nearConnection) {
        this.signer = signer;
        this.nearConnection = nearConnection;
    }

    async viewAccount(accountId) {
        const response = await this.jsonRpcRequest('abci_query', [`account/${accountId}`, '', '0', false]);
        return JSON.parse(_base64ToBuffer(response.response.value).toString());
    }

    async submitTransaction(signedTransaction) {
        const buffer = SignedTransaction.encode(signedTransaction).finish();
        const transaction = _arrayBufferToBase64(buffer);
        const params = [transaction];
        const response = await this.jsonRpcRequest('broadcast_tx_async', params);
        response.hash = Buffer.from(response.hash, 'hex');
        return response;
    }

    async callViewFunction(contractAccountId, methodName, args) {
        if (!args) {
            args = {};
        }
        const serializedArgs = Buffer.from(JSON.stringify(args)).toString('hex');
        try {
            const result = await this.jsonRpcRequest('abci_query', [`call/${contractAccountId}/${methodName}`, serializedArgs, '0', false]);
            const response = result.response;
            _printLogs(contractAccountId, response.log);
            const json = JSON.parse(_base64ToBuffer(response.value).toString());
            return json;
        } catch(e) {
            _printLogs(contractAccountId, e.log);
            throw e;
        }
    }

    async getTransactionStatus(transactionHash) {
        const encodedHash = _arrayBufferToBase64(transactionHash);
        const response = await this.jsonRpcRequest('tx', [encodedHash, false]);
        // tx_result has default values: code = 0, logs: '', data: ''.
        const codes = { 0: 'Completed', 1: 'Failed', 2: 'Started' };
        const status = codes[response.tx_result.code || 0] || 'Unknown';
        let logs = [];
        if (response.tx_result !== undefined && response.tx_result.log !== undefined && response.tx_result.log.length > 0) {
            logs = response.tx_result.log.split('\n');
        }
        return { logs, status, value: response.tx_result.data };
    }

    async getNonce(accountId) {
        return (await this.viewAccount(accountId)).nonce + 1;
    }

    async jsonRpcRequest(method, params) {
        const request = {
            jsonrpc: '2.0',
            method,
            params,
            id: Date.now().toString(),
        };
        const response = await this.nearConnection.request('', request);
        const code = (response.result.response ? response.result.response.code : response.result.code) || 0;
        if (code != 0) {
            const log = response.result.response.log;
            const error = new Error(`Error calling ${method} with ${params}, error code: ${code}.\nMessage: ${log}`);
            error.log = log;
            throw error;
        }
        return response.result;
    }

    async request(methodName, params) {
        return this.nearConnection.request(methodName, params);
    }
}

function _printLogs(contractAccountId, log) {
    let logs = [];
    if (log !== undefined && log.length > 0) {
        logs = log.split('\n');
    }
    logs.forEach(line => {
        console.log(`[${contractAccountId}]: ${line}`);
    });
}

module.exports = NearClient;