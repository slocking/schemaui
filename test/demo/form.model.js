const mongoose = require('mongoose');
const { Schema } = mongoose;

const formSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId },
  company_id: { type: Schema.Types.ObjectId, },
  form_type: { type: String },
  series: { type: Number, index: true },
  is_active: { type: Boolean, default: true },
  fields: { type: Object },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

const Form = mongoose.model('Form', formSchema);

module.exports = Form;
