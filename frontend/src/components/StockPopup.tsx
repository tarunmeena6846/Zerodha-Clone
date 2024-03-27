import React, { useState } from "react";

interface StockPopupProps {
  stock: {
    symbol: string;
    dayLow: number;
    dayHigh: number;
    lastPrice: number;
  };
  onClose: () => void;
}

const StockPopup: React.FC<StockPopupProps> = ({ stock, onClose }) => {
  const [quantity, setQuantity] = useState(1);

  const totalPrice = quantity * stock.lastPrice;
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(parseInt(event.target.value));
  };

  const handleBuy = () => {
    // Implement buy functionality here
    console.log(`Buying ${quantity} ${stock.symbol} stocks for ${totalPrice}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg">
        <h2 className="text-lg font-bold mb-2">{stock.symbol}</h2>
        <div className="mb-2">
          Low: {stock.dayLow} | High: {stock.dayHigh}
        </div>
        <div className="mb-4">
          <label htmlFor="quantity" className="block font-semibold">
            Quantity:
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={handleQuantityChange}
            className="w-full border rounded-md p-2 mt-1"
          />
        </div>
        <div className="font-semibold">Total Price: {totalPrice}</div>
        <div className="mt-4 flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            // Add onClick handler for buy action
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockPopup;
