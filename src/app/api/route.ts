import { prisma } from "@/utils/db";
import { walletFactoryContract } from "@/utils/getContracts";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// define an async function to handle POST requests
export async function POST(req: NextRequest) {
    try {
        // parse the request body to get the list of signers
        const { signers }: { signers: string[] } = await req.json();
        // generate a random salt, convert it to hexadecimal and prepend "0x"
        const salt = "0x" + randomBytes(32).toString("hex");

        // call the getAdress function from the walletFactory contracat with the signers and salt
        // this computes the counterfactual address for the wallet without deploying it
        const walletAddress = await walletFactoryContract.getAddress(signers, salt);
        // use prisma client to create a new wallet in the database with the signers, salt, address and isDeployed set to false
        const response = await prisma.wallet.create({
            data: {
                salt: salt,
                signers: signers.map((s) => s.toLowerCase()),
                isDeployed: false,
                address: walletAddress, // converts all signer addresses to lowercase for consistency
            },
        });

        // return the created wallet as a json response
        return NextResponse.json(response);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error });
    }
}