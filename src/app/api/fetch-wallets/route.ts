import { prisma } from "@/utils/db";
import { isAddress } from "ethers/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        // extract the search parameters from the request URL
        const { searchParams } = new URL(req.url);
        // get the address from the search parameters
        const address = searchParams.get("address");

        // if the address is not provided, throw an Error
        if (!address) {
            throw new Error("Missing or invalid address");
        }

        // if the address is not a valid ethereum address, throw an Error
        if (!isAddress(address)) {
            throw new Error("Invalid Ethereum address");
        }

        // use Prisma ro find all wallets where the given address is a signer
        // also include a count of transactions for each wallet
        const wallets = await prisma.wallet.findMany({
            where: {
                signers: {
                    has: address.toLowerCase(),
                },
            },
            include: {
                _count: {
                    select: {
                        transactions: true,
                    },
                },
            },
        });

        // return the wallet as a json responsee
        return NextResponse.json(wallets);
    } catch (error) {
        // log any errors to the console and return them as a JSON response
        console.error(error);
        return NextResponse.json({ error });
    }
        
}