import { getUserOpForETHTransfer } from "@/utils/getUserOpForETHTransfer";
import { parseEther } from "ethers/lib/utils";
import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import getUserOpHash from "@/utils/getUserOpHash";
import TransactionsList from "@/components/transactionList";

// define the WalletPage components
export default function WalletPage({
    params: { walletAddress },
} : {
    params: { walletAddress: string };
}) {
    // define state variables
    const [amount, setAmount] = useState<number>(0);
    const [toAddress, setToAddress] = useState("");
    const { address: userAddress } = useAccount();
    const { data: walletClient } = useWalletClient();
    const [loading, setLoading] = useState(false);
    
    // define an asynchronous function to fetch the user operation for an ETH transfer
    const fetchUserOp = async () => {
        try {
            // fetch wallet data
            const response = await fetch(
                `/api/fetch-wallet?walletAddress=${walletAddress}`
            );
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            // convert the amount to a big integer
            const amountBigInt = parseEther(amount.toString());

            // get the user operation for the ETH transfer
            const userOp = await getUserOpForETHTransfer(
                walletAddress,
                data.signers,
                data.salt,
                toAddress,
                amountBigInt,
                data.isDeployed
            );

            //throw an Error us the user operation could not be retrieved 
            if (!userOp) throw new Error("Could not get user operation");

            // return the user operation
            return userOp;
        } catch (e: any) {
            window.alert(e.message);
            throw new Error(e.message);
        }
    };

    const createTransaction = async () => {
        try {
            // set loading state to true
            setLoading(true);

            // throw an Error if userAddress or walletClient is not present
            if (!userAddress) throw new Error("Could not get user address");
            if (!walletClient) throw new Error("Could not get wallet client");

            // Fetch the user operation
            const userOp = await fetchUserOp();
            // throw new Error if userOp could not be fetched
            if (!userOp) throw new Error("Could not fetch userOp");

            // get the hash of the user operation
            const userOpHash = await getUserOpHash(userOp);
            // sign the user operation hash using the wallet client
            const signature = await walletClient.signMessage({
                message: { raw: userOpHash as `0x${string}` },
            });

            // send a POST request to the create-transaction API route
            const response = await fetch("/api/create-transaction", {
                method: "POST",
                body: JSON.stringify({
                    walletAddress,
                    userOp,
                    signature,
                    signerAddress: userAddress,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            // Parse the response data
            const data = await response.json();
            // throw an error is there's an error in the response data
            if (data.error) throw new Error("data.error");

            // Alert the user that the transactiono has been created and signed
            window.alert(
                "Transaction created and signed! Please ask other owners to sign to finally execute the transaction"
            );
            // reload the page
            window.location.reload();
        } catch (err) {
            // alert the user there's an error and log the error
            if (err instanceof Error) window.alert(err.message);
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col py-6 items-center gap-5">
            <h1 className="text-5x1 font-bold">Manage Wallet</h1>
            <h3 className="text-x1 font-medium border-b border-gray-700">
                {walletAddress}
            </h3>

            <p className="text-lg font-bold">Send ETH</p>

            <input
                className="rounded-lg p-2 text-slate-700"
                placeholder="0x0"
                onChange={(e) => {
                    if (e.target.value === "") {
                        setAmount(0);
                        return;
                    }
                    setAmount(parseFloat(e.target.value));
                }}
            />
            <button
                className="bg-blue-500 mx-auto hover:bg-blue-700 disabled:bg-blue-500/50 disabled:hover:bg-blue-500/50 hover:transition-colors text-white font-bold py-2 w-fit px-4 rounded-lg"
                onClick={createTransaction}
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-4 border-gray-300 border-l-white items-center justify-center mx-auto" />
                    ) : (
                        `Create Txn`
                    )}
            </button>

            {userAddress && (
                <TransactionsList address={userAddress} walletAddress={walletAddress} />
            )}
        </div>
    );
} 