const Joi = require("joi");

const createBookingSchema = Joi.object({
  x_user_name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "សូមបញ្ចូលឈ្មោះរបស់អ្នក",
      "string.min": "ឈ្មោះត្រូវមានយ៉ាងតិច ២ តួអក្សរ",
      "any.required": "ឈ្មោះគឺចាំបាច់ត្រូវបំពេញ"
    }),
  x_company_name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .allow("", null)
    .messages({
      "string.min": "ឈ្មោះក្រុមហ៊ុនត្រូវមានយ៉ាងតិច ២ តួអក្សរ",
      "string.max": "ឈ្មោះក្រុមហ៊ុនមិនអាចលើសពី ១០០ តួអក្សរបានទេ"
    }),
  x_phone: Joi.string()
    .trim()
    .regex(/^[0-9]{9,10}$/)
    .required()
    .messages({
      "string.empty": "សូមបញ្ចូលលេខទូរស័ព្ទ",
      "string.pattern.base": "លេខទូរស័ព្ទមិនត្រឹមត្រូវទេ (ត្រូវមាន ៩ ឬ ១០ ខ្ទង់)",
      "any.required": "លេខទូរស័ព្ទចាំបាច់ត្រូវបំពេញ"
    }),

  x_phone: Joi.string()
    .trim()
    .regex(/^[0-9]{9,10}$/)
    .required()
    .messages({
      "string.empty": "សូមបញ្ចូលលេខទូរស័ព្ទ",
      "string.pattern.base": "លេខទូរស័ព្ទមិនត្រឹមត្រូវទេ (ត្រូវមាន ៩ ឬ ១០ ខ្ទង់)",
      "any.required": "លេខទូរស័ព្ទចាំបាច់ត្រូវបំពេញ"
    }),

  x_email: Joi.string()
    .trim()
    .email()
    .allow("", null)
    .messages({
      "string.email": "ទម្រង់អ៊ីមែលមិនត្រឹមត្រូវទេ"
    }),

  x_service_id: Joi.any()
    .required()
    .messages({
      "any.required": "សូមជ្រើសរើសសេវាកម្មណាមួយដែលអ្នកចង់ជួល!"
    }),

  x_type_contact: Joi.string()
    .trim()
    .required()
    .valid("កក់សេរវ៉ាកម្ម", "ពិភាក្សាសេវ៉ាកម្ម")
    .messages({
      "string.empty": "សូមជ្រើសរើសប្រភេទទាក់ទង",
      "any.only": "ប្រភេទទាក់ទងត្រូវតែជា 'កក់សេរវ៉ាកម្ម' ឬ 'ពិភាក្សាសេវ៉ាកម្ម'", 
      "any.required": "សូមជ្រើសរើសប្រភេទទាក់ទង"
    }),

  x_date: Joi.date()
    .iso()
    .required()
    .messages({
      "date.format": "កាលបរិច្ឆេទមិនត្រឹមត្រូវទេ",
      "any.required": "សូមជ្រើសរើសកាលបរិច្ឆេទ"
    }),

  x_des: Joi.string()
    .trim()
    .max(500)
    .allow("", null)
    .messages({
      "string.max": "ការពិពណ៌នាមិនអាចលើសពី ៥០០ តួអក្សរបានទេ"
    })
});

const validateBooking = (req, res, next) => {
    const { error } = createBookingSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
        const errorMessages = error.details.reduce((acc, current) => {
            acc[current.context.key] = current.message;
            return acc;
        }, {});

        return res.status(400).json({ 
            success: false, 
            message: "Validation failed", 
            errors: errorMessages 
        });
    }

    next();
};
module.exports = {
  validateBooking
};