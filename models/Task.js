const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automaticamente
  },
);

module.exports = mongoose.model("Task", taskSchema);
