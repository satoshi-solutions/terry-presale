import React, { useState, useEffect, useRef } from 'react';
import { parseEther } from "viem";
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Header from './Header';
import { Link } from "react-scroll";
import Footer from './Footer';
import { useAccount, useConnect, useWriteContract, useSimulateContract, useReadContract, useBalance } from 'wagmi';
import ProgressBar from "./Progress";

const PRESALE_ABI = [
    {
        inputs: [],
        name: "buyTokens",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    }
]

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

const PRESALE_CONTRACT = "0x93A16C6F9486f73ca9e3888e91CaA09C0687e1e9";

const LandingPage = () => {

    const [isScrolled, setIsScrolled] = useState(false);
    const [amount, setAmount] = useState(0);

    const [isVisible, setIsVisible] = useState(false);
    const textRef = useRef(null);
    const { address, isConnected } = useAccount();
    const { connect, connectors, error, isLoading } = useConnect();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alert, setAlert] = useState(null); // { message, type }
    const [errors, setError] = useState("");
    const { writeContract, isPending, isSuccess } = useWriteContract();

    const {
        data: balanceData,
        isLoading: balanceLoading,
        refetch: refetchBalance,
    } = useBalance({
        address: address,
        watch: true, // Enable real-time updates
        // chainId: 56, // Uncomment and set to BSC mainnet chain ID if needed
        // chainId: 97, // BSCTestnet chain ID
    });

    const { data: currentCap, isLoading: currentCapLoading } = useReadContract({
        abi: PRESALE_ABI_CAP,
        address: PRESALE_CONTRACT,
        functionName: "currentCap",
    });

    const { data: hardCap, isLoading: hardCapLoading } = useReadContract({
        abi: PRESALE_ABI_CAP,
        address: PRESALE_CONTRACT,
        functionName: "hardCap",
    });

    const progress = currentCap && hardCap && hardCap > 0
        ? Math.min((Number(currentCap) / Number(hardCap)) * 100, 100) // Cap at 100%
        : 0;

    function CustomAlert({ message, type, onClose }) {
        useEffect(() => {
            const timer = setTimeout(() => {
                onClose();
            }, 4500); // Auto-close after 3 seconds
            return () => clearTimeout(timer); // Cleanup on unmount
        }, [onClose]);

        return (
            <div
                className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-lg font-semibold animate-fade-in-out ${type === "error" ? "bg-red-500" : "bg-green-500"
                    }`}
            >
                {message}
            </div>
        );
    }

    const closeAlert = () => setAlert(null);

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                setAlert({ message: "Purchase successful!", type: "success" });
            }, 4500); // Wait 4 seconds
            refetchBalance().then((result) => {
                console.log("Balance refetched after success:", result.data?.formatted);
            });
        }
    }, [isSuccess, refetchBalance, balanceData]);

    const { data: simulationData, error: simulationError } = useSimulateContract({
        abi: PRESALE_ABI,
        address: PRESALE_CONTRACT,
        functionName: "buyTokens",
        args: [],
        value: amount ? parseEther(amount) : 0,
        enabled: isConnected && !!amount && !isNaN(Number(amount)),
    });

    const handleConnect = (connector) => {
        connect({ connector }); // Simply call connect without chaining
    };

    const handleBuy = () => {
        console.log("address", address);
        console.log("balanceData", balanceData);
        if (!isConnected) {
            setAlert({ message: "Please connect your wallet!", type: "error" });
            return;
        }
        if (!balanceData || balanceLoading) {
            setAlert({ message: "Fetching balance, please wait...", type: "error" });
            return;
        }

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setAlert(null); // Reset alert
            setTimeout(
                () =>
                    setAlert({
                        message: "Please enter a valid BNB amount",
                        type: "error",
                    }),
                0
            );
            return;
        }

        // Check if the amount exceeds the user's BNB balance
        const bnbAmount = parseEther(amount);
        const userBalance = balanceData?.value || 0;
        if (userBalance === 0) {
            setAlert({ message: "Your wallet has no BNB!", type: "error" });
            return;
        }
        if (bnbAmount > userBalance) {
            setAlert(null); // Reset alert to force re-render
            setTimeout(
                () => setAlert({ message: "Insufficient Balance!", type: "error" }),
                0
            );
            return;
        }

        if (!simulationData) {
            setAlert(null); // Reset alert
            setTimeout(
                () =>
                    setAlert({
                        message:
                            "Transaction simulation failed. Check your input or network.",
                        type: "error",
                    }),
                0
            );
            return;
        }

        writeContract({
            abi: PRESALE_ABI,
            address: PRESALE_CONTRACT,
            functionName: "buyTokens",
            args: [],
            value: bnbAmount,
        });
    };

    const handleMax = () => {
        if (balanceData && !balanceLoading) {
            const maxAmount = Number(balanceData.formatted).toFixed(4); // Limit to 4 decimals
            setAmount(maxAmount);
        }
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;

        // Update the amount state
        if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
            setAmount(value);
        }
    };

    // Use useEffect to close the modal when the connection is successful
    useEffect(() => {
        if (isConnected && isModalOpen) {
            setIsModalOpen(false); // Close the modal when the wallet is connected
        }
    }, [isConnected, isModalOpen]);

    // Handle error display (e.g., user rejected the request)
    useEffect(() => {
        if (error) {
            console.error('Connection error:', error);
            console.log("Errors", error)
            if (error.message.includes('User rejected the request')) {
                alert('You rejected the wallet connection request. Please try again and approve the connection.');
            }
        }
    }, [error]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true); // Set visibility to true when the element is in view
                } else {
                    setIsVisible(false); // Optionally, reset when it leaves the view
                }
            },
            {
                threshold: 0.5, // Trigger when 50% of the element is in the viewport
            }
        );

        if (textRef.current) {
            observer.observe(textRef.current); // Start observing the element
        }

        return () => {
            if (textRef.current) {
                observer.unobserve(textRef.current); // Clean up the observer on unmount
            }
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 150) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div>
            <div className="mx-auto px-4 lg:px-16 z-0 overflow-hidden">
                <Header isScrolled={isScrolled} />
                {/* Landing Section */}
                <section className=" text-black flex mt-[100px] justify-between items-center max-md:flex-col-reverse ">
                    <div className='text-center md:text-left'>
                        <div className="flex flex-col w-full items-center md:items-start">
                            <h1 className="text-[#f49400] text-3xl md:text-4xl font-roboto">Travel Smart</h1>
                            <h2 className="text-[#283583] text-4xl md:text-5xl font-roboto">Invest Smarter</h2>
                        </div>
                        <p className="text-[16px] md:text-[24px] leading-7 max-w-xl mt-4">
                            iVaCay Where Blockchain Turns Vacations into Profits.
                        </p>
                        <div className='flex flex-col sm:flex-row mt-6 gap-4 items-center max-md:justify-center'>
                            <Link
                                to="buy"
                                smooth={true}
                                duration={500}
                                className="relative flex items-center font-helvetica space-x-2 text-black hover:text-[#f49400] transition duration-300 cursor-pointer"
                            >
                                <button className="bg-[#283583] text-white py-3 px-6 rounded-md text-lg hover:bg-blue-700 transition duration-300">
                                    BUY NOW
                                </button>
                            </Link>
                            <button className="border border-[#283583] text-[#283583] py-3 px-6 rounded-md text-lg hover:bg-[#f49400] transition duration-300 hover:text-white">
                                JOIN COMMUNITY
                            </button>
                        </div>
                    </div>
                    <div className="relative mt-8 md:mt-0">
                        <img className="w-full max-w-md md:max-w-lg" src="/images/banner.png" alt="banner" />
                    </div>
                </section>
                <div className="z-10 text-center px-6 mt-6">
                    <span className="flex flex-col font-roboto items-center text-black py-3 px-8 rounded-full text-md animate-bounce">
                        Scroll Down
                        <ChevronDownIcon className='w-6 h-6 mt-1' />
                    </span>
                </div>
                <div id='about' className="flex flex-col z-10 text-center px-6 mt-6 items-center justify-center ">
                    <span ref={textRef} className={`font-roboto text-[#283583] py-3 px-8 text-[60px] transition-all duration-1500ms ${isVisible ? 'animate-flip' : ''
                        }`}>
                        About iVaCay
                    </span>
                    <span className='h-[5px] w-[70px] bg-[#283583]  mt-[55px]' />
                </div>
                <section className=" w-[full] text-black gap-[70px] flex mt-[100px] justify-between items-center max-custom:flex-col">
                    <div className="flex flex-col custom:flex-row gap-[70px] justify-between pt-32 items-center">
                        <img
                            src="/images/about.png" // Replace with actual image path
                            alt="About Features"
                            className="w-full max-w-lg"
                        />

                        {/* Right - Text Content */}
                        <div className="text-center custom:text-left">
                            {/* Underline style */}
                            <h3 className="text-3xl font-bold text-gray-800">
                                is <span className="text-red-500">NOT</span> just a travel app
                            </h3>
                            <p className="text-xl mt-4">
                                iVaCay isn&apos;t just a travel app; it&apos;s a groundbreaking
                                investment opportunity. Our mission is to revolutionize vacations
                                by offering investors seamless access to unparalleled experiences
                                and lodging options through blockchain technology.
                            </p>
                            <p className="mt-4 text-xl">
                                What sets us apart is our bold integration of cryptocurrency
                                payments, NFTs, and a tokenized ecosystem that rewards engagement.
                                Join iVaCay and be part of the journey where every vacation is not
                                just an adventure but a profitable endeavor.
                            </p>
                        </div>
                    </div>
                </section>
                <section id='feature' className=" w-[full] text-black flex flex-col mt-[200px] items-center max-custom:flex-col-reverse">
                    <div className='flex flex-col items-center justify-center'>
                        <img className="max-custom:mt-5 w-[51px] h-[31px] mb-2" src="/images/decoration.png" alt="decoration" />
                        <div className='flex w-[80%] flex-col justify-center text-center items-center custom:text-left'>
                            <div className="flex text-center items-center custom:items-start">
                                <h1 className="text-black text-3xl custom:text-4xl font-roboto">Future of Travel and Experiences</h1>
                            </div>
                            <p className="text-[18px] max-w-full text-center custom:text-[24px] leading-7 mt-4">
                                iVacay is spearheading the future of travel with disruptive blockchain innovation. By harnessing XRPL for payments and tokenization, we're not only revolutionizing how travelers transact but also creating a secure and seamless experience. Our incorporation of NFTs elevates travel to new heights by capturing moments and curating personalized experiences like never before. iVacay isn't just a travel platform; it's a visionary investment opportunity poised to redefine the entire travel industry landscape.
                            </p>
                        </div>
                    </div>
                    <img className="w-full max-w-[950px] mt-10 " src="/images/travel.png" alt="travel" />
                </section>
                <section id="earning-income" className="py-20 bg-white">
                    <div className="container mx-auto flex flex-col-reverse custom:flex-row gap-[70px] items-center justify-between">
                        {/* Left - Text Content */}
                        <div className="text-center md:text-start">
                            {/* Decorative Element */}
                            <div className="flex justify-center md:justify-start mb-2">
                                <img
                                    src="/images/decoration.png" // Replace with actual path
                                    alt="Decorative Element"
                                    className="w-8"
                                />
                            </div>

                            <h2 className="text-4xl font-bold text-black mb-4">
                                Earning Passive Income
                            </h2>

                            <p className="text-2xl">
                                iVaCay offers investors a golden opportunity to earn passive income
                                in the flourishing travel market. With properties and hotels
                                available for investment using tokens, users can unlock lucrative
                                real estate returns while indulging in luxurious vacations.
                            </p>

                            <p className="mt-4 text-2xl">
                                Our innovative fee structure incentivizes engagement, and strategic
                                acquisitions of timeshare properties amplify earning potential.
                                iVaCay isn&apos;t just a vacation; it&apos;s an unparalleled
                                investment journey where every moment counts towards financial
                                prosperity.
                            </p>

                            <p className="mt-4 text-2xl">
                                Join us and seize the future of travel investments with iVaCay.
                            </p>
                        </div>

                        {/* Right - Image */}

                        <img
                            src="/images/earning.png" // Replace with actual path
                            alt="Earning Passive Income"
                            className="w-full max-w-lg mt-8 md:mt-0"
                        />
                    </div>
                </section>
                <section id='presale' className=" w-[full] text-black flex flex-col mt-[200px] items-center max-custom:flex-col-reverse">
                    <div className='flex flex-col items-center justify-center'>
                        <img className="w-[51px] h-[31px] mb-2" src="/images/decoration.png" alt="decoration" />
                        <div className='flex w-[80%] flex-col justify-center text-center items-center md:text-left'>
                            <div className="flex text-center items-center md:items-start">
                                <h1 className="text-black text-3xl md:text-4xl font-roboto">Presale is live!</h1>
                            </div>
                            <p className="text-[18px] max-w-full text-center md:text-[24px] leading-7 mt-4">
                                Discover a new realm of financial freedom with iVaCay: Where NFTs, VacayCoin, and timeshares unite to redefine transactions, offering seamless experiences and unparalleled value creation
                            </p>
                        </div>
                    </div>
                </section>
                <section id="presale" className="py-20 bg-white text-center">
                    <div className="flex flex-col gap-[70px] mx-auto ">

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
                                            {currentCapLoading || !currentCap
                                                ? "Loading..."
                                                : (Number(currentCap) / 1e18).toLocaleString()}{" "}
                                            / {(hardCap ? Number(hardCap) / 1e18 : 0).toLocaleString()} IVAC
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
                <div id='buy' className={`flex items-center justify-center max-h-screen mt-10 lg:bg-[url("/images/circle.png")] bg-no-repeat bg-[100%_auto]`}>
                    <div className="relative py-20 px-10 text-center">
                        <h2 className="text-2xl font-semibold text-gray-900">Presale Started</h2>
                        <div className="mt-6 border-green-300 p-4 rounded-lg border flex items-center gap-4">
                            <div className="flex flex-col flex-grow text-left">
                                <label className="text-sm text-gray-600">Amount</label>
                                <input
                                    type="float"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    className={`w-full bg-transparent text-2xl font-semibold text-gray-900 outline-none ${errors ? "border-red-500 border-2 rounded" : ''}`}
                                    placeholder='0.00'
                                />
                                {errors && (
                                    <p className="text-red-500 text-sm mt-2">{errors}</p>
                                )}
                            </div>
                            <button onClick={() => handleMax()} className="bg-[#2e7d32] text-white px-3 py-1 rounded-lg text-sm">MAX</button>
                            <span className="flex items-center gap-1 font-semibold text-gray-900">
                                <img src="/images/bnb.png" alt="BNB" className="w-5 h-5" /> BNB
                            </span>
                        </div>
                        <button disabled={isPending} onClick={!isConnected ? () => setIsModalOpen(true) : () => handleBuy()} className="mt-6 bg-[#f49400] text-white hover:text-blue-600 font-semibold py-2 px-6 rounded-lg hover:shadow-sm">
                            {!isPending ? (!isConnected ? 'CONNECT' : 'BUY NOW') : 'PENDING...'}
                        </button>
                    </div>
                </div>
            </div>
            <Footer />

            {alert && (
                <CustomAlert
                    message={alert.message}
                    type={alert.type}
                    onClose={closeAlert}
                />
            )}
            {/* Modal for wallet selection */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-800 text-white rounded-lg p-6 w-80">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Connect Wallet</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Wallet Options */}
                        <div className="space-y-3">
                            {connectors.map((connector) => (
                                <button
                                    key={connector.id}
                                    onClick={() => handleConnect(connector)}
                                    disabled={isLoading}
                                    className={`flex items-center w-full px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {/* Wallet Icon */}
                                    <img
                                        src={
                                            connector.name === 'WalletConnect'
                                                ? 'https://walletconnect.com/favicon.ico'
                                                : connector.name === 'MetaMask'
                                                    ? 'https://metamask.io/favicon.ico'
                                                    : 'https://metamask.io/favicon.ico' // Fallback for other wallets
                                        }
                                        alt={connector.name}
                                        className="w-6 h-6 mr-3"
                                    />
                                    <span>{connector.name}</span>
                                    {connector.name === 'MetaMask' && (
                                        <span className="ml-auto text-green-500 text-xs">
                                            {typeof window !== 'undefined' && window.ethereum?.isMetaMask ? 'INSTALLED' : 'NOT INSTALLED'}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <p className="text-red-500 mt-4">
                                {error.message.includes('User rejected the request')
                                    ? 'You rejected the connection request. Please try again.'
                                    : error.message}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div >
    )
};

export default LandingPage;
