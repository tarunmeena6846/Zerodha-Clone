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

// Get cumulative returns
router.get(
  "/returns",
  detokenizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const portfolio = await Portfolio.findOne();
      if (!portfolio) {
        return res
          .status(404)
          .json({ success: false, error: "Portfolio not found" });
      }
      const trades = await Trade.find({ _id: { $in: portfolio.trades } });

      let initialInvestment = 0;
      trades.forEach((trade) => {
        if (trade.type === "buy") {
          initialInvestment += trade.price * trade.quantity;
        }
      });

      const finalValue = Object.values(portfolio.holdings).reduce(
        (total, holding) => {
          return total + holding.quantity * 100; // Assuming final price is 100
        },
        0
      );

      const cumulativeReturn =
        (finalValue - initialInvestment) / initialInvestment;

      res.json({ success: true, data: cumulativeReturn });
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
        // date: date,
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
          totalQuantity = holding.quantity + quantity;
        } else {
          totalQuantity = holding.quantity - quantity;
        }
        const totalValue =
          holding.quantity * holding.averagePrice + quantity * price;
        const newAveragePrice = totalValue / totalQuantity;

        holding.quantity = totalQuantity;
        holding.averagePrice = newAveragePrice;
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

// Update trade
router.post(
  "/updateTrade",
  detokenizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tradeId, newTradeData } = req.body;
      const portfolio = await Portfolio.findOne();
      if (!portfolio) {
        return res
          .status(404)
          .json({ success: false, error: "Portfolio not found" });
      }
      const tradeIndex = portfolio.trades.findIndex(
        (trade) => trade._id === tradeId
      );
      if (tradeIndex !== -1) {
        portfolio.trades[tradeIndex] = newTradeData;
        await portfolio.save();
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, error: "Trade not found" });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Remove trade
router.post(
  "/removeTrade",
  detokenizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tradeId } = req.body;
      const portfolio = await Portfolio.findOne();
      if (!portfolio) {
        return res
          .status(404)
          .json({ success: false, error: "Portfolio not found" });
      }
      portfolio.trades = portfolio.trades.filter(
        (trade) => trade._id !== tradeId
      );
      await portfolio.save();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;
