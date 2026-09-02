const Joi = require("joi");

const createDesignSchema = Joi.object({
  status: Joi.boolean().empty("").default(false),
  user_id: Joi.number().integer().min(1).empty("").optional(),
  service_id: Joi.number().integer().min(1).required().messages({
    "number.base": "Service ID ត្រូវតែជាលេខ",
    "any.required": "សូមបញ្ចូល Service ID"
  }),
  title: Joi.string().trim().required().messages({
    "string.empty": "Title មិនអាចទទេបានទេ",
    "any.required": "សូមបញ្ចូល Title"
  }),
  des: Joi.string().trim().required().messages({
    "string.empty": "Description មិនអាចទទេបានទេ",
    "any.required": "សូមបញ្ចូល Description"
  }),
  link: Joi.string().trim().required().messages({
    "string.empty": "Link មិនអាចទទេបានទេ",
    "any.required": "សូមបញ្ចូល Link"
  }),
  ifram: Joi.string().trim().allow("", null).optional(),
  img: Joi.string().trim().allow("", null).optional(),
  tags: Joi.string().trim().allow('', null).optional(),
  view_count: Joi.number().integer().min(0).empty("").default(0),
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional()
});

const validateDesign = (req, res, next) => {
    const { error } = createDesignSchema.validate(req.body, { abortEarly: false });
    
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
  validateDesign
};