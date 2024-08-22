import React, { useState } from "react";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract, ethers } from "ethers";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
import { useNavigate } from "react-router-dom";
//import { PinataSDK } from "pinata";
import axios from "axios"
//import PinataUpload from "./PinataUpload";

const commerceContractAddress = "0xd0F797a7A539556D6CF386d8133678b0dF12590b";
const commerceABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
      {
        internalType: "string",
        name: "_image",
        type: "string",
      },
      {
        internalType: "string",
        name: "_category",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_currency",
        type: "string",
      },
    ],
    name: "listProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "image",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "category",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "currency",
        type: "string",
      },
    ],
    name: "ProductListed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "currency",
        type: "string",
      },
    ],
    name: "ProductPurchased",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "purchaseProduct",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "getProduct",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "string",
        name: "category",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "currency",
        type: "string",
      },
      {
        internalType: "bool",
        name: "purchased",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPurchasedProducts",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "productCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "products",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "seller",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "string",
        name: "image",
        type: "string",
      },
      {
        internalType: "string",
        name: "category",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "currency",
        type: "string",
      },
      {
        internalType: "bool",
        name: "purchased",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "purchasedProducts",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// 1. Get projectId
const projectId = "54c238d52f1218087ae00073282addb8";

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://cloudflare-eth.com",
};
const sepolia = {
  chainId: 11155111,
  name: "Sepolia",
  currency: "ETH",
  explorerUrl: "https://sepolia.etherscan.io",
  rpcUrl:
    "https://eth-sepolia.g.alchemy.com/v2/_O9yEvZei4_BPgQbLawL754cAfubB8jr", // Replace with your Infura project ID
};

// 3. Create a metadata object
const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,
  auth: {
    email: true, // default to true
    socials: ["google", "x", "github"],
    showWallets: true, // default to true
    walletFeatures: true, // default to true
  },
  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: "...", // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
});

// 5. Create a AppKit instance
createWeb3Modal({
  ethersConfig,
  chains: [mainnet, sepolia],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

// const pinata = new PinataSDK({
//   pinataJwt:
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3ZjliMTdhYi03M2JkLTRkNTktYmY1OC00YmYxYjMxMWI0ZGYiLCJlbWFpbCI6Im5hbmF2YXRpYWtoaWxAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImRkMzQ3YjY5NmU4OTgxMzc4Y2Q3Iiwic2NvcGVkS2V5U2VjcmV0IjoiYWQxMmRiNDFjNjc0ODA4MzJlMWMxMzBjMmM2MzM4MzdmMWMyM2I1MmI1NTJkZDcwYjgxYjZmNGI4N2EyNmIwNSIsImV4cCI6MTc1NTgwMzcyOH0.j3cmVKtVKmAnV6pWembveHfEivZEkr-aEDwQ0m8BzQc",
//   pinataGateway: "copper-occupational-turtle-123.mypinata.cloud",
// });

const ListProducts = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState("");

  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    category: "",
    price: "",
    currency: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  //   const handleFileChange = (event) => {
  //   setSelectedFile(event.target.files[0]);
  // };

  // const handleSub = async (event) => {
  //   event.preventDefault();

  //   const formData = new FormData();
  //   formData.append("file", selectedFile);

  //   const apiKey = "dd347b696e8981378cd7";
  //   const apiSecret =
  //     "ad12db41c67480832e1c130c2c633837f1c23b52b552dd70b81b6f4b87a26b05";

  //   try {
  //     const response = await axios.post(
  //       "https://api.pinata.cloud/pinning/pinFileToIPFS",
  //       formData,
  //       {
  //         maxContentLength: "Infinity",
  //         headers: {
  //           "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
  //           pinata_api_key: apiKey,
  //           pinata_secret_api_key: apiSecret,
  //         },
  //       }
  //     );

  //     setIpfsHash(response.data.IpfsHash);
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //   }
  //};






//   const handleFileChange = async (event) => {
//     setFile(event.target.files[0]);
//     console.log(file);
//     const reader = new FileReader();
//     reader.onloadend =  () => {
//       // Convert the file to BlobPart[] format
//       const arrayBuffer = reader.result;
//       const uint8Array = new Uint8Array(arrayBuffer);
//       const blobPartsArray = Array.from(uint8Array);

//       setBlobParts(blobPartsArray);

//       console.log("BlobPart[]:", blobPartsArray);
//     };

//     await reader.readAsArrayBuffer(file);
// console.log("hey")
//     const filee = new File([blobParts], "Testing.png");
//     console.log("hey")
//     const upload = await pinata.upload.file(filee);
//     console.log(upload);
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       alert("Please select a file first!");
//       return;
//     }
//   };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletProvider) {
      alert("User not connected");
      return;
    }

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const commerceContract = new Contract(
      commerceContractAddress,
      commerceABI,
      signer
    );
    console.log("hey");
    try {
      const priceInWei = ethers.parseEther(formData.price.toString());

      const tx = await commerceContract.listProduct(
        formData.name,
        formData.description,
        formData.image,
        formData.category,
        priceInWei,
        formData.currency
      );

      console.log(priceInWei);

      await tx.wait();
      alert("Product listed successfully");
      navigate("/marketplace");
    } catch (error) {
      console.log("Error listing product:", error);
    }
  };
  return (
    <>
      <div>
        <div className="navbar bg-base-100">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">DeComm</a>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              <w3m-button />
            </ul>
          </div>
        </div>
      </div>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6">List Your Product</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Image URL
            </label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            >
              <option value="" disabled>
                Select Category
              </option>
              <option value="grocery">Grocery</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Price
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            >
              <option value="" disabled>
                Select Currency
              </option>
              <option value="eth">ETH/WETH</option>
              <option value="usdt">USDT</option>
              <option value="dai">DAI</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none"
            >
              List Product
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ListProducts;
