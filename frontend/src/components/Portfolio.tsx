// src/components/Portfolio.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import StockPopup from "./StockPopup";

const Portfolio: React.FC = () => {
  const [trades, setTrades] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stocksPerPage] = useState(5);
  const [selectedStock, setSelectedStock] = useState<any>(null);

  useEffect(() => {
    const fetchHoldingData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/portfolio/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        if (response.data.success) {
          console.log("portfolio ", response.data);
          setTrades(response.data.data.trades);
        }
      } catch (error) {
        // setStocks([]);
        console.error(error);
      }
    };

    fetchHoldingData();
  }, []); // Empty dependency array

  const indexOfLastStock = currentPage * stocksPerPage;
  const indexOfFirstStock = indexOfLastStock - stocksPerPage;
  const currentTrades = trades.slice(indexOfFirstStock, indexOfLastStock);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const handleStockClick = (stock: any) => {
    setSelectedStock(stock);
  };

  const closePopup = () => {
    setSelectedStock(null);
  };
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toDateString(); // Format to display only the date part
  };

  return (
    <div className="container mx-auto">
      <h2 className="text-xl mb-4">Trades</h2>
      <table className="w-full bg-white overflow-hidden mb-4 p-10">
        <thead className="">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock Name
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {currentTrades.map((stock: any, index: number) => (
            <tr key={index} onClick={() => handleStockClick(stock)}>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium`}>
                {stock.stock}
              </td>

              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium`}>
                {stock.quantity}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium`}>
                {stock.price}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium`}>
                {stock.type}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium`}>
                {formatDate(stock.date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedStock && (
        <StockPopup
          stock={selectedStock}
          onClose={closePopup}
          isLiveStock={false}
        />
      )}
      <div className="flex justify-center items-center mt-4 space-x-2">
        {[...Array(Math.ceil(trades.length / stocksPerPage))].map(
          (_, index) => (
            <button
              key={index}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={() => paginate(index + 1)}
            >
              {index + 1}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default Portfolio;
