import { prisma } from "@/utils/db";
import { isAddress } from "ethers/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const walletAddress = searchParams.get("walletAddress");

        // check if the walletAddress is provided
        if (!walletAddress) {
            throw new Error("Missing or invalid address");
        }

        // validate if the provided address is a valid ethereum address
        if (!isAddress(walletAddress)) {
            throw new Error("Invalid Ethereum Address");
        }

        // use prisma to find the first wallet that matches the provided address
        const wallet = await prisma.wallet.findFirst({
            where: {
                address: walletAddress,
            },
        });

        return NextResponse.json(wallet);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error });
    }
}