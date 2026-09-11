import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

storeSchema.plugin(mongoosePaginate);

const StoreModel = mongoose.model("Store", storeSchema);

export default StoreModel;
