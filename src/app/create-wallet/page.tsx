import CreateSCW from "@/components/createSCW";

export default function CreateWalletPage() {
    return (
        <main className="flex flex-col py-6 items-center gap-6">
            <h1 className="text-5x1 font-bold">Create New Wallet</h1>
            <p className="text-gray-400">
                Enter the signer addresses for this account
            </p>
            <CreateSCW />
        </main>
    );
}