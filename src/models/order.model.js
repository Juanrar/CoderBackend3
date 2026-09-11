import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import {
  ORDER_STATUS,
  ORDER_STATUSES,
  ORDER_PRIORITY,
  ORDER_PRIORITIES
} from "../constants/order.constants.js";

const orderItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  {
    _id: false
  }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    deliveryAddress: {
      type: String,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: ORDER_STATUS.CREATED
    },
    statusHistory: {
      type: [
        {
          status: { type: String, enum: ORDER_STATUSES, required: true },
          changedAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    priority: {
      type: String,
      enum: ORDER_PRIORITIES,
      default: ORDER_PRIORITY.NORMAL
    },
    proof: {
      type: Object,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

orderSchema.plugin(mongoosePaginate);

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;
