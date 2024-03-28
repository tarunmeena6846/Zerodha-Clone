// src/routes/monthlyData.routes.ts
import express, { Router, Response } from "express";
import { detokenizeAdmin } from "../middleware/index";
import { AuthenticatedRequest } from "../middleware/index";
import Portfolio, { IHolding } from "../models/portfolioSchema";
import Trade, { ITrade } from "../models/tradeSchema";

const router: Router = express.Router();
// Retrieve the entire portfolio with trades
router.get(
  "/",
  detokenizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const portfolio = await Portfolio.findOne().populate("trades");
      if (!portfolio) {
        return res
          .status(404)
          .json({ success: false, error: "Portfolio not found" });
      }
      res.json({ success: true, data: portfolio });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get holdings in an aggregate view
router.get(
  "/holdings",
  detokenizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const portfolio = await Portfolio.findOne();
      // const holdings = [];
      if (!portfolio) {
        return res
          .status(404)
          .json({ success: false, error: "Portfolio not found" });
      }

      res.json({ success: true, data: portfolio.holdings });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.post(
  "/addTrade",
  detokenizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { stock, quantity, price, type, date } = req.body;
      console.log("inside add trade", type, stock, quantity, price);
      const newTrade = new Trade({
        stock: stock,
        quantity: quantity,
        price: price,
        type: type,
      }); // Ensure req.body properties match ITrade interface

      await newTrade.save();
      // Get or create the portfolio instance
      let portfolio = await Portfolio.findOne({ user: req.user }); // Assuming portfolio is associated with the user

      if (!portfolio) {
        // If portfolio does not exist, create a new one
        portfolio = new Portfolio({ user: req.user, holdings: [], trades: [] });
      }

      // Update holdings based on the new trade
      let holdingIndex = portfolio.holdings.findIndex(
        (holding) => holding.stock === stock
      );

      if (holdingIndex === -1) {
        // If the stock is not found in holdings, add a new holding
        portfolio.holdings.push({
          stock: stock,
          quantity: quantity,
          averagePrice: price,
        });
      } else {
        // If the stock is found in holdings, update its quantity and average price
        const holding = portfolio.holdings[holdingIndex];
        let totalQuantity;
        if (type === "buy") {
          // Calculate total quantity after adding the new buy trade
          totalQuantity = holding.quantity + quantity;
          // Calculate total value after adding the new buy trade
          const totalValue =
            holding.quantity * holding.averagePrice + quantity * price;
          // Calculate new average price after adding the new buy trade
          const newAveragePrice = totalValue / totalQuantity;

          holding.quantity = totalQuantity;
          holding.averagePrice = newAveragePrice;
        } else if (type === "sell") {
          // Calculate total quantity after subtracting the sold quantity
          totalQuantity = holding.quantity - quantity;
          if (totalQuantity < 0) {
            // Handle error if trying to sell more than available quantity
            return res.status(400).json({
              success: false,
              error: "Insufficient quantity in holding",
            });
          }
          if (totalQuantity === 0) {
            // If total quantity becomes 0, remove the holding
            portfolio.holdings.splice(holdingIndex, 1);
          } else {
            // Calculate total value after subtracting the sold quantity
            const totalValue =
              holding.quantity * holding.averagePrice - quantity * price;
            // Calculate new average price after subtracting the sold quantity
            const newAveragePrice =
              totalQuantity > 0 ? totalValue / totalQuantity : 0;

            holding.quantity = totalQuantity;
            holding.averagePrice = newAveragePrice;
          }
        }
      }
      // Push the trade document's _id to the portfolio's trades array
      portfolio.trades.push(newTrade._id);

      // Save the portfolio document
      await portfolio.save();
      res.json({ success: true, data: newTrade });
    } catch (error: any) {
      console.error("Error saving new trade:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
/// Remove trade
router.delete(
  "/removeTrade/:tradeId",
  detokenizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tradeId } = req.params;

      // Find the trade in the trade schema
      const trade = await Trade.findById(tradeId);
      if (!trade) {
        return res
          .status(404)
          .json({ success: false, error: "Trade not found" });
      }

      // Find the associated holding in the portfolio
      const portfolio = await Portfolio.findOne({ trades: tradeId });
      if (!portfolio) {
        return res
          .status(404)
          .json({ success: false, error: "Portfolio not found" });
      }

      const holdingIndex = portfolio.holdings.findIndex(
        (holding) => holding.stock === trade.stock
      );
      if (holdingIndex === -1) {
        return res
          .status(404)
          .json({ success: false, error: "Holding not found" });
      }

      const holding = portfolio.holdings[holdingIndex];

      // Calculate the impact of the removed trade on the holding's quantity and average price
      const updatedQuantity =
        trade.type === "buy"
          ? holding.quantity - trade.quantity
          : holding.quantity + trade.quantity;
      const updatedTotalValue =
        holding.quantity * holding.averagePrice - trade.quantity * trade.price;
      const updatedAveragePrice =
        updatedQuantity > 0 ? updatedTotalValue / updatedQuantity : 0;

      // Update the holding's quantity and average price
      holding.quantity = updatedQuantity;
      holding.averagePrice = updatedAveragePrice;

      // Remove the trade from the trade schema and update the portfolio's trades array
      await Trade.findByIdAndDelete(tradeId);
      portfolio.trades = portfolio.trades.filter(
        (tradeRef) => tradeRef.toString() !== tradeId
      );

      // Save the changes to the portfolio
      await portfolio.save();

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error removing trade:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Update trade
router.post(
  "/updateTrade/:tradeId",
  detokenizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tradeId } = req.params;
      const { quantity, price } = req.body;
      console.log(tradeId, quantity, price);
      // Find the trade in the trade schema
      const trade = await Trade.findById(tradeId);
      if (!trade) {
        return res
          .status(404)
          .json({ success: false, error: "Trade not found" });
      }

      // Find the associated holding in the portfolio
      const portfolio = await Portfolio.findOne({ trades: tradeId });
      if (!portfolio) {
        return res
          .status(404)
          .json({ success: false, error: "Portfolio not found" });
      }

      const holdingIndex = portfolio.holdings.findIndex(
        (holding) => holding.stock === trade.stock
      );
      if (holdingIndex === -1) {
        return res
          .status(404)
          .json({ success: false, error: "Holding not found" });
      }

      const holding = portfolio.holdings[holdingIndex];

      // Calculate the impact of the updated trade on the holding's quantity and average price
      const updatedQuantity =
        trade.type === "buy"
          ? holding.quantity - trade.quantity + quantity
          : holding.quantity + trade.quantity - quantity;
      const updatedTotalValue =
        holding.quantity * holding.averagePrice -
        trade.quantity * trade.price +
        quantity * price;
      const updatedAveragePrice =
        updatedQuantity > 0 ? updatedTotalValue / updatedQuantity : 0;

      // Update the holding's quantity and average price
      holding.quantity = updatedQuantity;
      holding.averagePrice = updatedAveragePrice;

      // Update the trade in the trade schema
      trade.quantity = quantity;
      trade.price = price;
      await trade.save();

      // Save the changes to the portfolio
      await portfolio.save();

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating trade:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;
