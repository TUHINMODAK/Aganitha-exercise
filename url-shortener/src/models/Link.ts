import mongoose from "mongoose"

const linkSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  targetUrl: { type: String, required: true },
  clicks: { type: Number, default: 0 },
  lastClicked: { type: Date },
}, { timestamps: true })

// linkSchema.index({ code: 1 }, { unique: true })

export default mongoose.models.Link || mongoose.model("Link", linkSchema)