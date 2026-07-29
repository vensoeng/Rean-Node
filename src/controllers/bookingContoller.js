const path = require("path");
const ServiceModel = require("../models/Services");
const { readJsonFile, writeJsonFile, uploadBufferFile, deleteFile } = require("../utils/githubJsonStore");
const { compressToTargetSize } = require("../config/imageProcessor");

const SERVICE_FILE_PATH = process.env.SERVICE_FILE_PATH || "data/portfolio/services.json";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const makeFileName = (ext) => `${Date.now()}${ext}`;

const formatBackendDate = (dateInput) => {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

exports.createBooking = async (req, res) => {
  try {
    const { x_user_name, x_phone, x_email, x_service_id, x_type_contact, x_date, x_des,x_company_name } = req.body;

    const services = await readJsonFile(SERVICE_FILE_PATH, []);
    const service = services.find(s => String(s.id) === String(x_service_id));
    if (!service) {
      return res.status(404).json({ success: false, message: "សេវ៉ាកម្មដែលអ្នកបានជ្រើសរើសមិនមានទេ" });
    }

    const newBooking = {
      x_user_name,
      x_company_name,
      x_phone,
      x_email,
      service_title: service.title || "Unknown Service",
      x_type_contact,
      x_date: formatBackendDate(x_date),
      x_des
    };
    
const telegramMessage = `<b>🔔 មានទំនាក់ទំនងថ្មី (New Booking)</b>
━━━━━━━━━━━━━━━━━━
👤 ឈ្មោះ: ${x_user_name || '-'}
📞 លេខទូរស័ព្ទ: ${x_phone || '-'}
📧 អ៊ីមែល: ${x_email || '-'}
🛠️ ឈ្មោះក្រុមហ៊ុន: ${x_company_name || 'មិនបញ្ចូល'}
🛠️ សេវាកម្ម: ${newBooking.service_title}
📱 ទម្រង់ទាក់ទង: ${x_type_contact || '-'}
📅 កាលបរិច្ឆេទ: ${newBooking.x_date}
📝 ការពិពណ៌នា: ${x_des || '-'}`;

    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
      const telegramUrl = 'https://api.telegram.org/bot'+TELEGRAM_TOKEN+'/sendMessage';
      
      try {
        const response = await fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: "HTML"
          })
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          console.log("✅ Telegram Success Response:", result);
        } else {
          console.error("❌ Telegram still returned HTML metadata.");
        }
      } catch (telegramErr) {
        console.error("Failed to connect to Telegram API:", telegramErr.message);
      }
    }

    res.status(201).json({ message: "បង្កើត Booking បានជោគជ័យ", data: newBooking });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};