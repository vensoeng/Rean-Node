const Joi = require('joi');

const createServiceSchema = Joi.object({
    status: Joi.boolean().empty('').default(false),
    upper: Joi.boolean().empty('').default(false),
    index: Joi.number().integer().min(0).empty('').optional(),
    booking_length: Joi.number().integer().min(0).empty('').optional(),
    list_id: Joi.number().integer().required(),

    // title
    list_name: Joi.string().trim().allow('', null).optional(),
    title: Joi.string().trim().required().messages({
        'string.empty': 'ចំណងជើងមិនអាចទទេបានទេ!',
        'any.required': 'សូមបញ្ចូលចំណងជើង!'
    }),
    title_kh: Joi.string().trim().allow('', null).optional(),
    title_zh: Joi.string().trim().allow('', null).optional(),

    // Descriptions
    description: Joi.string().trim().required(),
    description_kh: Joi.string().trim().allow('', null).optional(),
    description_zh: Joi.string().trim().allow('', null).optional(),

    // tage
    tags: Joi.string().trim().required(),
    tags_zh: Joi.string().trim().allow('', null).optional(),
    tags_kh: Joi.string().trim().allow('', null).optional(),

    tags_active: Joi.string().trim().required(),
    tags_active_kh: Joi.string().trim().allow('', null).optional(),
    tags_active_zh: Joi.string().trim().allow('', null).optional(),

    // Prices
    price_start: Joi.number().positive().required(),
    price_end: Joi.number().allow('', null).optional(),
    deposit: Joi.string().trim().allow('', null).optional(),
    
    // Localization fields
    warranty: Joi.string().trim().required(),
    warranty_zh: Joi.string().trim().allow('', null).allow(''),
    warranty_kh: Joi.string().trim().allow('', null).allow(''),
    
    time: Joi.string().trim().required(),
    time_kh: Joi.string().trim().allow('', null).optional(),
    time_zh: Joi.string().trim().allow('', null).optional(),
    
    location: Joi.string().trim().required(),
    location_zh: Joi.string().trim().allow('', null).optional(),
    location_kh: Joi.string().trim().allow('', null).optional(),

    note: Joi.string().trim().required(),
    note_kh: Joi.string().trim().allow('', null).allow(''),
    note_zh: Joi.string().trim().allow('', null).allow(''),
    
    img_slider:  Joi.string().trim().allow('').optional()
});

// Middleware function
const validateService = (req, res, next) => {
    const { error } = createServiceSchema.validate(req.body, { abortEarly: false });
    
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

module.exports = { validateService };