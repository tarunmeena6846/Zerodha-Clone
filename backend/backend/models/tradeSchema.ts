import { Schema, model, Document } from "mongoose";

export interface ITrade extends Document {
  stock: string;
  quantity: number;
  price: number;
  type: "buy" | "sell";
  date: Date;
}

const tradeSchema: Schema<ITrade> = new Schema({
  stock: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["buy", "sell"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

export default model<ITrade>("Trade", tradeSchema);
