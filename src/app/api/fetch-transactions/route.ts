import { prisma } from "@/utils/db";
import { isAddress } from "ethers/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { Transaction, TransactionSignature, Wallet } from "@prisma/client";

export const dynamic = "force-dynamic";

//define a type for transactions with signatures
export type TransactionWithSignatures = Transaction & {
    signatures: TransactionSignature[];
    wallet: Wallet;
    pendingSigners: string[];
};

// define an asynchronous function GET function
export async function GET(req: NextRequest) {
    try {
        //extract wallet addresses from the search parameters
        const { searchParams } = new URL(req.url);
        const walletAddress = searchParams.get("walletAddress");

        // throw an error is walletAddress is mussing or invalid
        if (!walletAddress) {
            throw new Error("Missing or invalid wallet address");
        }

        // validate the Ethereum address
        if (!isAddress(walletAddress)) {
            throw new Error("Invalid Ethereum address");
        }

        // fetch all transactions associated with the walletAddress
        const transactions = await prisma.transaction.findMany({
            where: {
                wallet: {
                    address: walletAddress,
                },
            },
            include: {
                signatures: true,
                wallet: true,
            },
            orderBy: {
                txHash: {
                    sort: "asc",
                    nulls: "first",
                },
            },
        });

        // Augment transactions with pendingSigners
        const augmentedTransactions: TransactionWithSignatures[] = transactions.map(
            (transaction) => {
                // filter out signers who haven't completed a signature
                const pendingSigners = transaction.wallet.signers.filter(
                    (signer) =>
                        !transaction.signatures.find(
                            (signature) => signature.signerAddress === signer
                        )
                );

                // return transactions with pendingSigners
                return {
                    ...transaction,
                    pendingSigners,
                };
            }
        );
        //return transaction in JSON format
        return NextResponse.json({ transactions: augmentedTransactions });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error });
    }
}