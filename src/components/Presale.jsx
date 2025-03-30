import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import ProgressBar from "./Progress";
import ABI from "./abi.json";
import Web3 from "web3";

const PRESALE_CONTRACT = "0x93A16C6F9486f73ca9e3888e91CaA09C0687e1e9";

const Presale = () => {
    const [currentCap, setCurrentCap] = useState(null);
    const [hardCap, setHardCap] = useState(null);
    const [contract, setContract] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Initialize Web3 with BSC testnet RPC
        const web3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545/");
        const contractInstance = new web3.eth.Contract(ABI, PRESALE_CONTRACT);
        
        // Verify contract exists
        web3.eth.getCode(PRESALE_CONTRACT)
            .then(code => {
                if (code === '0x' || code === '') {
                    setError('Contract not found at this address');
                    return;
                }
                setContract(contractInstance);
            })
            .catch(err => {
                console.error('Error checking contract:', err);
                setError('Failed to verify contract');
            });
    }, []);

    const fetchCaps = async () => {
        if (!contract) return;
        
        try {
            console.log('Fetching currentCap...');
            const current = await contract.methods.currentCap().call();
            console.log('Current cap result:', current);
            
            console.log('Fetching hardCap...');
            const hard = await contract.methods.hardCap().call();
            console.log('Hard cap result:', hard);
            
            setCurrentCap(current);
            setHardCap(hard);
        } catch (error) {
            console.error("Detailed error:", error);
            setError(error.message);
        }
    };

    useEffect(() => {
        if (contract) {
            fetchCaps();
        }
    }, [contract]);

    const progress = currentCap && hardCap && hardCap > 0
        ? Math.min((Number(currentCap) / Number(hardCap)) * 100, 100)
        : 0;

    return (
        <section id="presale" className="py-20 bg-white text-center">
            <div className="flex flex-col gap-[70px] mx-auto ">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

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
                                progress={progress}
                                className="mb"
                            />
                            <p className="text-gray-700 mt-2">
                                Tokens Sold:{" "}
                                <span className="font-bold">
                                    {currentCap ? (Number(currentCap) / 1000000000000000000).toLocaleString() : "Loading..."} /{" "}
                                    {hardCap ? (Number(hardCap) / 1000000000000000000).toLocaleString() : "Loading..."} IVAC
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