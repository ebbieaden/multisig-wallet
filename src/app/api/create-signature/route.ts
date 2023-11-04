import { prisma } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        //destructure signature, signerAddress and transactionId from the request
        const { signature, signerAddress, transactionId } = await req.json();

        // update the transaction with the new signer
        await prisma.transaction.update({
            where: {
                id: transactionId,
            },
            data: {
                signatures: {
                    create: {
                        signature,
                        signerAddress: signerAddress.toLowerCase(),
                    },
                },
            },
        });

        // return a success message
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error });
    }
}