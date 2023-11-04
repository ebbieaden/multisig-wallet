// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import { IEntryPoint } from "account-abstraction/interfaces/IEntryPoint.sol";
import { Wallet } from "./Wallet.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";

contract WalletFactory {
    Wallet public immutable walletImplementation;

    constructor(IEntryPoint entryPoint) {
        walletImplementation = new Wallet(entryPoint, address(this));
    }

    function getAddress(
        address[] memory owners,
        uint256 salt
    ) public view returns (address) {
        // encode the initialize function in our wallet with the owners array as an arguments into a bytes array
        bytes memory walletInit = abi.encodeCall(Wallet.initialize, owners);
        // encode the proxyContract's constructor arguments which include the address walletImplementation and the walletInit  
        bytes memory proxyConstructor = abi.encode(
            address(walletImplementation),
            walletInit
        );
        // encode the creation code for ERC1967Proxy along witht the encoded proxyConstructoe data
        bytes memory bytecode = abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            proxyConstructor
        );

        // compute the keccak256 hash  of the bytecode generated
        bytes32 bytecodeHash = keccak256(bytecode);
        // use the hash and all the slat to compile the counterfactual address of the array
        return Create2.computeAddress(bytes32(salt), bytecodeHash);
    }

    function createAccount(address[] memory owners,
        uint256 salt) external returns (Wallet) {
            // Get the counterfactual address
            address addr = getAddress(owners, salt);
            // check if the code at the counterfactual address is non empty
            uint256 codeSize = addr.code.length;
            if (codeSize > 0) {
                // is the code is non-empty i.e if the account already deployed returns the Wallet at the counterfactual address
                return Wallet(payable(addr));
            }

            // if the code is empty deploy a new wallet
            bytes memory walletInit = abi.encodeCall(Wallet.initialize, owners);
            ERC1967Proxy proxy = new ERC1967Proxy{salt: bytes32(salt)}(
                address(walletImplementation),
                walletInit
            );

            // return the newly deployed wallet
            return Wallet(payable(address(proxy)));
        } 
}