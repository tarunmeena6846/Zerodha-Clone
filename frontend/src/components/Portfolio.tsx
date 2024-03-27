// src/components/Portfolio.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";

interface PortfolioData {
  // Define your portfolio data structure
}

const Portfolio: React.FC = () => {
//   const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);

//   useEffect(() => {
//     const fetchPortfolio = async () => {
//       try {
//         const response = await axios.get<PortfolioData>("/portfolio");
//         setPortfolio(response.data);
//       } catch (error) {
//         console.error("Error fetching portfolio:", error);
//       }
//     };

//     fetchPortfolio();
//   }, []);

  return (
    <div className="container mx-auto bg-green-400">
      <h2 className="text-7xl font-bold text-green-300 bg-black mb-4">
        Portfolio
      </h2>
    </div>
  );
};

export default Portfolio;
