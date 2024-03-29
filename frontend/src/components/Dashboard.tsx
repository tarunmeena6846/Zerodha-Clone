import axios from "axios";
import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { userState } from "../store/user";
import StockPopup from "./StockPopup";
import Portfolio from "./Portfolio";
// import Holdings from "./Holdings";
import { holdingState } from "../store/holdings";

// Function to determine if the change is positive or negative
export const getColor = (change: number) => {
  return change > 0 ? "text-green-500" : "text-red-500";
};

const Dashboard: React.FC = () => {
  const [stocks, setStocks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stocksPerPage] = useState(10);
  const [holdings, setHoldings] = useRecoilState(holdingState);
  const userEmail = useRecoilValue(userState);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  console.log("holdingstate", holdings);
  // Function to calculate profit or loss for a holding
  const calculateProfitLoss = (holding: any, stock: any) => {
    if (stock) {
      const profitOrLoss =
        (stock.lastPrice - holding.averagePrice) * holding.quantity;
      return profitOrLoss.toFixed(2);
    }
    return 0; // Return 0 if the stock is not found
  };

  // Calculate current value, total invested, and profit/loss for each holding
  const holdingData = holdings.map((holding: any) => {
    const stock: any = stocks.find((s: any) => s.symbol === holding.stock);
    const currentValue = stock
      ? (holding.quantity * stock.lastPrice).toFixed(2)
      : 0;
    const profitLoss = calculateProfitLoss(holding, stock);
    return {
      ...holding,
      currentValue,
      profitLoss,
    };
  });

  // Calculate total current value
  const totalCurrentValue = holdingData.reduce(
    (total, holding) => total + parseFloat(holding.currentValue),
    0
  );

  // Calculate total amount invested
  const totalAmountInvested = holdings.reduce(
    (total, holding: any) => total + holding.quantity * holding.averagePrice,
    0
  );

  // Calculate total profit or loss
  const totalProfitLoss = holdingData.reduce(
    (total, holding) => total + parseFloat(holding.profitLoss),
    0
  );

  console.log("Holding Data:", holdingData);
  console.log("Total current value:", totalCurrentValue);
  console.log("Total amount invested:", totalAmountInvested);
  console.log("Total profit/loss:", totalProfitLoss);
  useEffect(() => {
    const fetchData = async () => {
      const options = {
        method: "GET",
        url: "https://latest-stock-price.p.rapidapi.com/price",
        params: {
          Indices: "NIFTY 50",
        },
        headers: {
          "X-RapidAPI-Key":
            "10f338c793mshaa50130260238a6p1e2430jsn065d7c0b910f",
          "X-RapidAPI-Host": "latest-stock-price.p.rapidapi.com",
        },
      };

      try {
        const response = await axios.request(options);
        console.log(response.data);
        setStocks(response.data);
      } catch (error) {
        setStocks([]);
        console.error(error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to ensure the effect runs only once

  useEffect(() => {
    const fetchHoldingData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/portfolio/holdings`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        if (response.data.success) {
          console.log("honldings ", response.data.data);
          setHoldings(response.data.data);
        }
      } catch (error) {
        // setStocks([]);
        console.error(error);
      }
    };

    fetchHoldingData();
  }, []); // Empty dependency array
  const handleStockClick = (stock: any) => {
    setSelectedStock(stock);
  };

  const closePopup = () => {
    setSelectedStock(null);
  };

  const indexOfLastStock = currentPage * stocksPerPage;
  const indexOfFirstStock = indexOfLastStock - stocksPerPage;
  const currentStocks = stocks.slice(indexOfFirstStock, indexOfLastStock);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/2 p-4">
        <table className="w-full max-w-xl bg-white shadow-md rounded-lg overflow-hidden mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Name
              </th>

              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Percent Change
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Price
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentStocks.map((stock: any, index: number) => (
              <tr key={index} onClick={() => handleStockClick(stock)}>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getColor(
                    stock.lastPrice - stock.previousClose
                  )}`}
                >
                  {stock.symbol}
                </td>

                <td
                  className={`px-6 py-4 whitespace-nowrap text-right text-sm ${getColor(
                    stock.lastPrice - stock.previousClose
                  )}`}
                >
                  {stock.change}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-right text-sm ${getColor(
                    (stock.lastPrice - stock.previousClose) /
                      stock.previousClose
                  )}`}
                >
                  {(
                    ((stock.lastPrice - stock.previousClose) /
                      stock.previousClose) *
                    100
                  ).toFixed(2)}
                  %
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-right text-sm ${getColor(
                    stock.lastPrice - stock.previousClose
                  )}`}
                >
                  {stock.lastPrice}
                </td>
              </tr>
            ))}
            {selectedStock && (
              <StockPopup
                stock={selectedStock}
                onClose={closePopup}
                isLiveStock={true}
              />
            )}
          </tbody>
        </table>
        <div className="flex justify-center items-center mt-4 space-x-2">
          {[...Array(Math.ceil(stocks.length / stocksPerPage))].map(
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
      <div className="md:w-3/4 p-4">
        <div className="p-4 mb-4">Hi, {userEmail.userEmail.split("@")[0]}</div>
        <Portfolio />
        <h2 className="text-xl">Returns</h2>
        {/* <Holdings /> */}
        <div>
          <div className="flex flex-row  justify-between max-w-lg pt-4">
            <h2 className={`text-5xl ${getColor(16)}`}>
              {totalProfitLoss.toFixed(2)}
            </h2>

            <div className="flex flex-col">
              <h2>current value : {totalCurrentValue.toFixed(2)}</h2>
              <h2>Investment : {totalAmountInvested.toFixed(2)}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
