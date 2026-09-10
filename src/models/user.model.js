import mongoose from "mongoose";


const documentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "customer", "store"],
      default: "customer"
    },
    documents: {
      type: [documentSchema],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userSchema.set("toJSON", {
  transform: (documento, objeto) => {
    delete objeto.password;
    return objeto;
  }
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
