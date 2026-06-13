const Joi = require("joi");

const createProductSchema = Joi.object({
  status: Joi.boolean().empty("").default(false),
  pin: Joi.number().integer().valid(0, 1).empty("").default(0),
  user_id: Joi.number().integer().min(1).empty("").optional(),
  cat_id: Joi.number().integer().min(1).required().messages({
    "number.base": "Category ID ត្រូវតែជាលេខ",
    "any.required": "សូមបញ្ចូល Category ID"
  }),
  name: Joi.string().trim().required().messages({
    "string.empty": "ចំណងជើងមិនអាចទទេបានទេ",
    "any.required": "សូមបញ្ចូលចំណងជើង"
  }),
  des: Joi.string().trim().required().messages({
    "string.empty": "Description មិនអាចទទេបានទេ",
    "any.required": "សូមបញ្ចូល Description"
  }),
  detail: Joi.string().trim().allow('', null).optional(),
  list_img:  Joi.string().trim().allow('').optional(),
  price: Joi.number().positive().required(),
  stock: Joi.string().trim().allow('', null).optional(),
  pesent: Joi.string().trim().allow('', null).optional(),
  note: Joi.string().trim().allow("", null).optional(), 
  img: Joi.string().trim().allow("", null).optional(),
  file: Joi.string().trim().allow("", null).optional(),
  tags: Joi.string().trim().allow('', null).optional(),
  share_count: Joi.number().integer().min(0).empty("").default(0),
  view_count: Joi.number().integer().min(0).empty("").default(0),
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional()
});

const productValidator = (req, res, next) => {
    const { error } = createProductSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
        const errorMessages = error.details.reduce((acc, current) => {
            acc[current.context.key] = current.message;
            return acc;
        }, {});
        
        return res.status(400).json({ 
            success: false, 
            errors: errorMessages 
        });
    }
    
    next();
};

module.exports = {
  productValidator
};