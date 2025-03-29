import { useReadContract } from "wagmi";
import ProgressBar from "./Progress";
import { useEffect } from "react";

const PRESALE_CONTRACT = "0x6982460E0F2da632f2cd446D61106E844bbCc45e";

const PRESALE_ABI_CAP = [
    {
        inputs: [],
        name: "currentCap",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "hardCap",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
];

const Presale = () => {

    const { data: currentCap, isLoading: currentCapLoading, error: currentCapError } = useReadContract({
        abi: PRESALE_ABI_CAP,
        address: PRESALE_CONTRACT,
        functionName: "currentCap",
    });

    const { data: hardCap, isLoading: hardCapLoading, error: hardCapError } = useReadContract({
        abi: PRESALE_ABI_CAP,
        address: PRESALE_CONTRACT,
        functionName: "hardCap",
    });

    const progress = currentCap && hardCap && hardCap > 0n
        ? Math.min(Number(currentCap * 100n / hardCap), 100) // Convert safely
        : 0;

    return (

        <section id="presale" className="py-20 bg-white text-center">
            <div className="flex flex-col gap-[70px] mx-auto ">

                {currentCapError && <p className="text-red-500">Error fetching currentCap: {currentCapError.message}</p>}
                {hardCapError && <p className="text-red-500">Error fetching hardCap: {hardCapError.message}</p>}


                {/* ICO Chart & Details Section */}
                <div className="flex flex-col custom:flex-row items-center bg-[#ffffff80] rounded-[40px] gap-[70px] justify-between py-16 px-10 shadow-2xl">
                    <img
                        src="/images/chart.png" // Replace with actual image path
                        alt="Presale ICO Chart"
                        className="w-full max-w-2xl"
                    />

                    {/* Presale Details Box */}
                    <div className="text-left max-w-3xl w-full">
                        <h3 className="text-xl font-semibold text-gray-800">
                            Total Supply:{" "}
                            <span className="font-bold">100M IVacayCoins (IVAC)</span>
                        </h3>
                        <div className="mt-6 text-lg relative h-[30px]">
                            <p className="text-gray-700 left-[30%] absolute -translate-x-1/2">
                                Soft Cap: <span className="font-bold">5M</span>
                            </p>
                            <p className="text-gray-700 right-0 absolute">
                                Hard Cap: <span className="font-bold">15M</span>
                            </p>
                        </div>

                        {/* Progress bar */}
                        <div>
                            <ProgressBar
                                progress={currentCapLoading || hardCapLoading ? 0 : progress}
                                className="mb"
                            />
                            <p className="text-gray-700 mt-2">
                                Tokens Sold:{" "}
                                <span className="font-bold">
                                    {currentCapLoading
                                        ? "Loading..."
                                        : (BigInt(currentCap) / 1_000_000_000_000_000_000n).toLocaleString()}{" "}
                                    / {(hardCap ? (BigInt(hardCap) / 1_000_000_000_000_000_000n).toLocaleString() : "0")} IVAC
                                </span>
                            </p>
                        </div>

                        {/* Token Distribution Details */}
                        <div className="mt-4 text-gray-700">
                            <p className=' flex justify-between'>
                                <strong>ICO Sale:</strong> 25%
                            </p>
                            <p className=' flex justify-between'>
                                <strong>Public Sale:</strong> 15.6%
                            </p>
                            <p className=' flex justify-between'>
                                <strong>Private Sale:</strong> 6.3%
                            </p>
                            <p className=' flex justify-between'>
                                <strong>Pre-Sale:</strong> 3.1%
                            </p>
                            <p className=' flex justify-between'>
                                <strong>Team and Advisors:</strong> 12.5%
                            </p>
                            <p className=' flex justify-between'>
                                <strong>Reserve Fund:</strong> 12.5%
                            </p>
                            <p className=' flex justify-between'>
                                <strong>Partnerships and Marketing:</strong> 9.4%
                            </p>
                            <p className=' flex justify-between'>
                                <strong>Community Development:</strong> 3.1%
                            </p>
                            <p className=' flex justify-between'>
                                <strong>Ecosystem Incentives:</strong> 12.5%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Presale;