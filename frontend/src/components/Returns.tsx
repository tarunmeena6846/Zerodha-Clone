// src/components/Portfolio.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const Returns: React.FC = () => {
  const [returns, setReturns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stocksPerPage] = useState(10);

  useEffect(() => {
    const fetchHoldingData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/portfolio/returns`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        if (response.data.success) {
          console.log("returns ", response.data);
          setReturns(response.data.data);
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
  const currentTrades = returns.slice(indexOfFirstStock, indexOfLastStock);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto">
      <div className="pt-10">
        <table className="w-full bg-white overflow-hidden mb-4">
          <thead className="">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Name
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg. Buying Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cumilative Return
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentTrades.map((stock: any, index: number) => (
              <tr key={index}>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium`}
                >
                  {stock.stock}
                </td>

                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium`}
                >
                  {stock.averageBuyingCost}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium`}
                >
                  {stock.cumulativeReturn}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center mt-4 space-x-2">
        {[...Array(Math.ceil(returns.length / stocksPerPage))].map(
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

export default Returns;
