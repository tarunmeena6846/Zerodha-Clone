import { Schema, model, Document } from "mongoose";
import Trade, { ITrade } from "./tradeSchema";

export interface IHolding {
  stock: string;
  quantity: number;
  averagePrice: number;
}

export interface IPortfolio extends Document {
  user: string;
  holdings: IHolding[];
  trades: ITrade[];
}

const holdingSchema: Schema<IHolding> = new Schema({
  stock: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  averagePrice: {
    type: Number,
    required: true,
  },
});

const portfolioSchema: Schema<IPortfolio> = new Schema({
  user: {
    type: String,
    required: true,
    unique: true,
  },
  holdings: [holdingSchema],
  trades: [{ type: Schema.Types.ObjectId, ref: "Trade" }],
});

export default model<IPortfolio>("Portfolio", portfolioSchema);
