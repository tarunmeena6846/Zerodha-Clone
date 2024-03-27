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
      const portfolio = await Portfolio.findOne();
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
      const holdings: Record<string, Partial<IHolding>> = {};
      if (!portfolio) {
        return res
          .status(404)
          .json({ success: false, error: "Portfolio not found" });
      }
      portfolio.holdings.forEach((holding) => {
        holdings[holding.stock] = {
          quantity: holding.quantity,
          averagePrice: holding.averagePrice,
        };
      });

      res.json({ success: true, data: holdings });
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

// Add trade
router.post(
  "/addTrade",
  detokenizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { stock, quantity, price, type, date } = req.body;

      const newTrade = { stock, quantity, price, type, date }; // Ensure req.body properties match ITrade interface
      const portfolio = await Portfolio.findOne();
      if (!portfolio) {
        return res
          .status(404)
          .json({ success: false, error: "Portfolio not found" });
      }
      portfolio.trades.push(newTrade as ITrade);
      await portfolio.save();
      res.json({ success: true, data: newTrade });
    } catch (error: any) {
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
