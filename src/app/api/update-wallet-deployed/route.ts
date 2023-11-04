import { prisma } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // destructure walletId, transactionId and txHash from the request
        const { walletId, transactionId, txHash } = await req.json();

        //update the wallet's isDeployed status to true
        await prisma.wallet.update({
            where: {
                id: walletId,
            },
            data: {
                isDeployed: true,
            },
        });

        // update the transaction with the txHash
        const res = await prisma.transaction.update({
            where: {
                id: transactionId,
            },
            data: {
                txHash,
            },
        });

        // return the updated transaction
        return NextResponse.json(res)        
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error });
    }
}