import { prisma } from "@/utils/db";
import { isAddress } from "ethers/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextResponse) {
    try {
        const { walletAddress, userOp, signerAddress, signature } = await req.json();

        // validate if the provided walletAddress is a valid Ethereum address
        if (!isAddress(walletAddress)) throw new Error("Invalid walletAddress");
        // use prisma to create a new transaction with the provided parameters
        await prisma.transaction.create({
            data: {
                wallet: {
                    connect: {
                        address: walletAddress,
                    },
                },
                userOp,
                signatures: {
                    create: {
                        signature,
                        signerAddress: signerAddress.toLowerCase(),
                    },
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error });
    }
}