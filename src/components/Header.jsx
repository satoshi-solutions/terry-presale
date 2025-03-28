import React, { useState, useEffect } from "react";
import { Link } from "react-scroll";
import { FaBars, FaSignOutAlt, FaTimes } from "react-icons/fa";
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const Header = ({ isScrolled }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { address, isConnected } = useAccount();
    const { connect, connectors, error, isLoading } = useConnect();
    const { disconnect } = useDisconnect();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Handle wallet connection
    const handleConnect = (connector) => {
        connect({ connector }); // Simply call connect without chaining
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
            if (error.message.includes('User rejected the request')) {
                alert('You rejected the wallet connection request. Please try again and approve the connection.');
            }
        }
    }, [error]);

    return (
        <>
        <nav className={`fixed top-0 left-0 w-full z-50 ${isScrolled ? "backdrop-blur-md bg-white/50 text-gray-700 shadow-md" : "bg-transparent text-black"}`}>
            <div className={`max-w-7xl mx-auto flex justify-between items-center transition-all duration-300 ${isScrolled ? "pt-1 pb-1" : "pt-3 pb-3"}`} style={isScrolled ? { paddingLeft: '1%', paddingRight: '2%' } : { paddingLeft: '2%', paddingRight: '3%' }}>
                {/* Logo */}
                <img src="/images/logo.png" alt="Logo" />

                {/* Desktop Navigation - Hidden on small screens */}
                <ul className="hidden md:flex space-x-6 items-center">
                    <li>
                        <Link
                            to="about"
                            smooth={true}
                            duration={500}
                            className="relative flex items-center font-helvetica space-x-2 text-black hover:text-[#f49400] transition duration-300 cursor-pointer"
                        >
                            <span className="text-[18px] relative font-bold after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-[#f49400] after:transition-all after:duration-300 hover:after:w-full">
                                About
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="feature"
                            smooth={true}
                            duration={500}
                            className="relative flex items-center ml-5 font-helvetica space-x-2 text-black hover:text-[#f49400] transition duration-300 cursor-pointer"
                        >
                            <span className="text-[18px] relative font-bold after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-[#f49400] after:transition-all after:duration-300 hover:after:w-full">
                                Feature
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="presale"
                            smooth={true}
                            duration={500}
                            className="flex items-center ml-5 font-helvetica space-x-2 text-black hover:text-[#f49400] transition duration-300 cursor-pointer"
                        >
                            <span className="text-[18px] relative font-bold after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-[#f49400] after:transition-all after:duration-300 hover:after:w-full">
                                Presale
                            </span>
                        </Link>
                    </li>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center space-x-2 bg-[#283583] text-white py-[7px] px-[19px] rounded-[5px] text-[15px] hover:bg-[#f49400] transition duration-300 cursor-pointer"
                    >
                        {isConnected ? `Connected: ${address.slice(0, 6)}...` : 'CONNECT'}
                    </button>
                    <button onClick={() => disconnect()} style={isConnected ? { visibility: "visible" } : { visibility: "hidden" }} className="flex items-center justify-center space-x-2 bg-[#283583] text-white py-[7px] px-[19px] rounded-[5px] text-[15px] hover:bg-red-500 transition duration-300 cursor-pointer" > <FaSignOutAlt /></button>
                </ul>

                {/* Mobile Menu Button - Visible on small screens */}
                <button className="md:hidden text-black text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Mobile Menu - Shown when menuOpen is true */}
            {menuOpen && (
                <div className="md:hidden absolute top-16 right-4 w-40 bg-white shadow-lg rounded-lg flex flex-col items-center">
                    {/* CONNECT Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-blue-900 text-white font-semibold py-2 px-4 rounded-t-lg"
                    >
                        {isConnected ? `Connected: ${address.slice(0, 6)}...` : 'CONNECT'}
                    </button>
                    {isConnected && <span onClick={() => disconnect()} style={isConnected ? { visibility: "visible" } : { visibility: "hidden" }} className="flex mt-2 items-center justify-center space-x-2 bg-[#283583] text-white py-[7px] px-[19px] rounded-[5px] text-[15px] hover:bg-red-500 transition duration-300 cursor-pointer" > <FaSignOutAlt /></span>}
                    {/* Menu Items */}
                    <Link
                        to="about"
                        smooth={true}
                        duration={500}
                        className="w-full text-black text-center py-2 px-4 hover:bg-gray-100 transition cursor-pointer"
                        onClick={() => setMenuOpen(false)}
                    >
                        ABOUT
                    </Link>
                    <Link
                        to="feature"
                        smooth={true}
                        duration={500}
                        className="w-full text-black text-center py-2 px-4 hover:bg-gray-100 transition cursor-pointer"
                        onClick={() => setMenuOpen(false)}
                    >
                        FEATURE
                    </Link>
                    <Link
                        to="presale"
                        smooth={true}
                        duration={500}
                        className="w-full text-black text-center py-2 px-4 hover:bg-gray-100 transition cursor-pointer"
                        onClick={() => setMenuOpen(false)}
                    >
                        PRESALE
                    </Link>
                </div>
            )}
        </nav>
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
        </>
    );
};

export default Header;