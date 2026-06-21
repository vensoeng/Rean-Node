const Joi = require("joi");

const createPlayListSchema = Joi.object({
  status: Joi.boolean().empty("").default(false),
  title: Joi.string().trim().required().messages({
    "string.empty": "ចំណងជើងមិនអាចទទេបានទេ",
    "any.required": "សូមបញ្ចូលចំណងជើង"
  }),
  des: Joi.string().trim().required().messages({
    "string.empty": "Description មិនអាចទទេបានទេ",
    "any.required": "សូមបញ្ចូល Description"
  }),
  img: Joi.string().trim().allow("", null).optional(),
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional()
});

const validateCategory = (req, res, next) => {
    const { error } = createPlayListSchema.validate(req.body, { abortEarly: false });
    
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
  validateCategory
};