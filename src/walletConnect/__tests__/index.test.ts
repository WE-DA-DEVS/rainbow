import { jest, test } from '@jest/globals';

jest.mock('@walletconnect/core');

jest.mock('@/redux/store');
jest.mock('@/redux/walletconnect');
jest.mock('@/redux/requests');
jest.mock('@/navigation/Navigation');
jest.mock('@/handlers/imgix');
jest.mock('@/utils/ethereumUtils');
jest.mock('@/parsers/requests');
jest.mock('@/handlers/localstorage/walletconnectRequests');
jest.mock('@/handlers/appEvents');
jest.mock('@/notifications/tokens');
jest.mock('@/model/wallet');
jest.mock('@/handlers/web3');
jest.mock('@/screens/Portal');
jest.mock('@/walletConnect/sheets/AuthRequest', () => ({
  AuthRequest: jest.fn(),
}));

import { parseRPCParams } from '@/walletConnect';
import { RPCMethod } from '@/walletConnect/types';

test(`works`, () => {
  const send_transaction = {
    method: RPCMethod.SendTransaction,
    params: [
      {
        data: '0x',
        from: '0xA2Eaa7BAe79F0F9FfB23667cdAc9CE285b30aE0E',
        gasLimit: '0x5208',
        gasPrice: '0x14f075c57e',
        nonce: '0x27',
        to: '0xA2Eaa7BAe79F0F9FfB23667cdAc9CE285b30aE0E',
        value: '0x00',
      },
    ],
  };
  const personal_sign = {
    method: RPCMethod.PersonalSign,
    params: [
      '0x4d7920656d61696c206973206a6f686e40646f652e636f6d202d2031363833353832363034343835',
      '0xA2Eaa7BAe79F0F9FfB23667cdAc9CE285b30aE0E',
    ],
  };
  const eth_sign = {
    method: RPCMethod.Sign,
    params: [
      '0xA2Eaa7BAe79F0F9FfB23667cdAc9CE285b30aE0E',
      '0x4d7920656d61696c206973206a6f686e40646f652e636f6d202d2031363833353832363433383539',
    ],
  };
  const eth_signedTypedData = {
    method: RPCMethod.SignTypedData,
    params: [
      '0xA2Eaa7BAe79F0F9FfB23667cdAc9CE285b30aE0E',
      {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
          ],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' },
          ],
        },
        primaryType: 'Mail',
        domain: {
          name: 'Ether Mail',
          version: '1',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        message: {
          from: {
            name: 'Cow',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          },
          to: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          },
          contents: 'Hello, Bob!',
        },
      },
    ],
  };

  const params = parseRPCParams(send_transaction);
});
