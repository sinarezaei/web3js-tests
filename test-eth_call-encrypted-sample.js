const Web3 = require("web3");

async function main() {
    // a website (https://swapfish.fi/swap) is calling json rpc url to arbitrum
    // it is sending the following to https://arb1.arbitrum.io/rpc
    // payload is
    // {
    //     id: 59,
    //     jsonrpc: "2.0",
    //     method: "eth_call",
    //     params: [
    //         {
    //             data: "0x252dba42000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc800000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000044dd62ed3e0000000000000000000000001acbc17057ddca2e874145a592b1d74d6fea6c22000000000000000000000000cdaec65495fa5c0545c5a405224214e3594f30d800000000000000000000000000000000000000000000000000000000",
    //             to: "0x7ecfbaa8742fdf5756dac92fbc8b90a19b8815bf"
    //         },
    //         "0x302b1ff"'
    //     ]
    // }
    // we are trying to find what it is calling

    // first we create a web3 instance with a valid rpc for the chain which is arbitrum

    let web3 = new Web3("https://rpc.ankr.com/arbitrum");

    // we define the target function selector which is the first 10 characters of data (or first 4 bytes after 0x)
    data =
        "0x252dba42000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc800000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000044dd62ed3e0000000000000000000000001acbc17057ddca2e874145a592b1d74d6fea6c22000000000000000000000000cdaec65495fa5c0545c5a405224214e3594f30d800000000000000000000000000000000000000000000000000000000";
    target_selector = data.slice(0, 10);

    // the "to" parameter is the contract to which the data is sent, we go to https://arbiscan.io/address/0x7ecfbaa8742fdf5756dac92fbc8b90a19b8815bf#code to view it's code
    // the contract is ArbMulticall2, and it's code is as below
    // contract ArbMulticall2 {
    //     struct Call {
    //         address target;
    //         bytes callData;
    //     }
    //     struct Result {
    //         bool success;
    //         bytes returnData;
    //     }

    //     function aggregate(Call[] memory calls)
    //         public
    //         returns (uint256 blockNumber, bytes[] memory returnData)
    //     {
    //         blockNumber = ArbSys(address(100)).arbBlockNumber();
    //         returnData = new bytes[](calls.length);
    //         for (uint256 i = 0; i < calls.length; i++) {
    //             (bool success, bytes memory ret) = calls[i].target.call(calls[i].callData);
    //             require(success, "Multicall aggregate: call failed");
    //             returnData[i] = ret;
    //         }
    //     }

    //     function blockAndAggregate(Call[] memory calls)
    //         public
    //         returns (
    //             uint256 blockNumber,
    //             bytes32 blockHash,
    //             Result[] memory returnData
    //         )
    //     {
    //         (blockNumber, blockHash, returnData) = tryBlockAndAggregate(true, calls);
    //     }

    //     function getBlockHash(uint256 blockNumber) public view returns (bytes32 blockHash) {
    //         blockHash = blockhash(blockNumber);
    //     }

    //     function getBlockNumber() public view returns (uint256 blockNumber) {
    //         blockNumber = ArbSys(address(100)).arbBlockNumber();
    //     }

    //     function getL1BlockNumber() public view returns (uint256 l1BlockNumber) {
    //         l1BlockNumber = block.number;
    //     }

    //     function getCurrentBlockCoinbase() public view returns (address coinbase) {
    //         coinbase = block.coinbase;
    //     }

    //     function getCurrentBlockDifficulty() public view returns (uint256 difficulty) {
    //         difficulty = block.difficulty;
    //     }

    //     function getCurrentBlockGasLimit() public view returns (uint256 gaslimit) {
    //         gaslimit = block.gaslimit;
    //     }

    //     function getCurrentBlockTimestamp() public view returns (uint256 timestamp) {
    //         timestamp = block.timestamp;
    //     }

    //     function getEthBalance(address addr) public view returns (uint256 balance) {
    //         balance = addr.balance;
    //     }

    //     function getLastBlockHash() public view returns (bytes32 blockHash) {
    //         blockHash = blockhash(block.number - 1);
    //     }

    //     function tryAggregate(bool requireSuccess, Call[] memory calls)
    //         public
    //         returns (Result[] memory returnData)
    //     {
    //         returnData = new Result[](calls.length);
    //         for (uint256 i = 0; i < calls.length; i++) {
    //             (bool success, bytes memory ret) = calls[i].target.call(calls[i].callData);

    //             if (requireSuccess) {
    //                 require(success, "Multicall2 aggregate: call failed");
    //             }

    //             returnData[i] = Result(success, ret);
    //         }
    //     }

    //     function tryBlockAndAggregate(bool requireSuccess, Call[] memory calls)
    //         public
    //         returns (
    //             uint256 blockNumber,
    //             bytes32 blockHash,
    //             Result[] memory returnData
    //         )
    //     {
    //         blockNumber = ArbSys(address(100)).arbBlockNumber();
    //         blockHash = blockhash(block.number);
    //         returnData = tryAggregate(requireSuccess, calls);
    //     }
    // }

    // to find the function that UI is calling, we define the list of functions in the following format
    // each function has a name and list of inputs
    // inputs can be raw types or raw type arrays such as uint256 or uint256[]
    // for more types check solidity types on https://docs.soliditylang.org/en/develop/types.html
    // for array of structs use tuple[]
    // for one struct use tuple

    funcs_defs = [
        {
            name: "aggregate",
            inputs: [
                {
                    type: "tuple[]",
                    name: "calls",
                    components: [
                        {
                            type: "address",
                            name: "target",
                        },
                        {
                            type: "bytes",
                            name: "callData",
                        },
                    ],
                },
            ],
        },
        {
            name: "blockAndAggregate",
            inputs: [
                {
                    type: "tuple[]",
                    name: "calls",
                    components: [
                        {
                            type: "address",
                            name: "target",
                        },
                        {
                            type: "bytes",
                            name: "callData",
                        },
                    ],
                },
            ],
        },
        {
            name: "tryAggregate",
            inputs: [
                {
                    type: "bool",
                    name: "requireSuccess",
                },
                {
                    type: "tuple[]", // for array of structs use tuple[], for one struct use tuple
                    name: "calls",
                    components: [
                        {
                            type: "address",
                            name: "target",
                        },
                        {
                            type: "bytes",
                            name: "callData",
                        },
                    ],
                },
            ],
        },
        {
            name: "tryBlockAndAggregate",
            inputs: [
                {
                    type: "bool",
                    name: "requireSuccess",
                },
                {
                    type: "tuple[]",
                    name: "calls",
                    components: [
                        {
                            type: "address",
                            name: "target",
                        },
                        {
                            type: "bytes",
                            name: "callData",
                        },
                    ],
                },
            ],
        },
        {
            name: "getBlockHash",
            inputs: [
                {
                    type: "uint256",
                    name: "blockNumber",
                },
            ],
        },
    ];

    // then we check each function
    // using https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#encodefunctionsignature

    for (const f_name of funcs_defs) {
        res = web3.eth.abi.encodeFunctionSignature(f_name);
        if (res === target_selector) {
            console.log("Found function!-------------------");
            console.log(`${f_name.name || f_name}: ${res}`);
            console.log("---------------------------------");
        } else {
            console.log(`${f_name.name || f_name}: ${res}`);
        }
    }

    // we find out that it is the aggregate function which is being called, now we find the inputs that are passed
    // using https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#decodeparameters

    types = [
        {
            Call: {
                target: "address",
                callData: "bytes",
            },
        },
    ];
    hex_string = data.slice(10);
    decode_result = web3.eth.abi.decodeParameters(types, hex_string);
    console.log(decode_result);
    // We find that the result is
    // Result {
    //     '0': [
    //       '0x0000000000000000000000000000000000000001',
    //       '0x000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    //       target: '0x0000000000000000000000000000000000000001',
    //       callData: '0x000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc8'
    //     ],
    //     __length__: 1
    //   }

    // so it is calling aggregate(
    //     [
    //         Call(target="0x0000000000000000000000000000000000000001", callData="0x000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc8")
    //     ]
    // )

    // Congratulations! we found the function!

    // Unfortunately I still don't know why is it calling 0x0000000000000000000000000000000000000001 with given
    //  calldata 0x000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc8
    // let's test it

    // testing the first call
    await web3.eth
        .call({
            to: "0x7ecfbaa8742fdf5756dac92fbc8b90a19b8815bf",
            data: "0x252dba42000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc800000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000044dd62ed3e0000000000000000000000001acbc17057ddca2e874145a592b1d74d6fea6c22000000000000000000000000cdaec65495fa5c0545c5a405224214e3594f30d800000000000000000000000000000000000000000000000000000000",
        })
        .then((res) => {
            console.log(`First call result is ${res}`);
            // the function aggregate returns (uint256 blockNumber, bytes[] memory returnData)
            decoded_res = web3.eth.abi.decodeParameters(["uint256", "bytes[]"], res);
            console.log(
                "First call decoded result is (blockNumber: uint256, returnData: bytes[]):"
            );
            console.log(decoded_res);
        });
    // The result is 0x00000000000000000000000000000000000000000000000000000000030328fd00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000

    // testing the second call
    await web3.eth
        .call({
            to: "0x0000000000000000000000000000000000000001", // contract address
            data: "0x000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc8",
        })
        .then((res) => {
            console.log(`Second call result is ${res}`);
        });

    // the result is 0x
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
