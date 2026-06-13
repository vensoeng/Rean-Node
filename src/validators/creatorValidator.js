const Joi = require("joi");

const createCreatorSchema = Joi.object({
  status: Joi.boolean().empty("").default(false),
  pin_num: Joi.number().integer().valid(0, 1).empty("").default(0),
  user_id: Joi.number().integer().min(1).empty("").optional(),
  cat_id: Joi.number().integer().min(1).required().messages({
    "number.base": "Category ID ត្រូវតែជាលេខ",
    "any.required": "សូមបញ្ចូល Category ID"
  }),
  title: Joi.string().trim().required().messages({
    "string.empty": "ចំណងជើងមិនអាចទទេបានទេ",
    "any.required": "សូមបញ្ចូលចំណងជើង"
  }),
  des: Joi.string().trim().required().messages({
    "string.empty": "Description មិនអាចទទេបានទេ",
    "any.required": "សូមបញ្ចូល Description"
  }),
  img: Joi.string().trim().allow("", null).optional(),
  tags: Joi.string().trim().allow('', null).optional(),
  share_count: Joi.number().integer().min(0).empty("").default(0),
  view_count: Joi.number().integer().min(0).empty("").default(0),
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional()
});

const validateCreator = (req, res, next) => {
    const { error } = createCreatorSchema.validate(req.body, { abortEarly: false });
    
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
  validateCreator
};