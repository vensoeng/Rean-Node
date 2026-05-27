
const dotenv = require("dotenv");
dotenv.config();

const Item = require("../models/Items");
const { readJsonFile, writeJsonFile } = require("../utils/githubJsonStore");

const ITEMS_FILE_PATH = process.env.ITEMS_FILE_PATH || "data/portfolio/items.json";


exports.createItem = async (req, res) => {
  try {
   
    const { name, description, price } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({
        message: "ត្រូវប្រើប្រាស់ name, description, price ទាំងអស់",
        required: ["name", "description", "price"]
      });
    }

    const items = await readJsonFile(ITEMS_FILE_PATH, []);

    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;

    const newItem = new Item(
      newId,
      name,
      description,
      parseFloat(price),  
      new Date()
    );

    items.push(newItem);

    await writeJsonFile(ITEMS_FILE_PATH, items, `Create item ${newItem.name}`);

    res.status(201).json({
      message: "Item បង្កើតបានដោយជោគជ័យ ✓",
      item: newItem
    });

  } catch (error) {
    console.error("កំហុសក្នុងការបង្កើត Item:", error);
    res.status(500).json({
      message: "មានកំហុសលើម៉ាឌែលសេវាកម្ម",
      error: error.message
    });
  }
};

exports.getAllItems = async (req, res) => {
  try {
    const items = await readJsonFile(ITEMS_FILE_PATH, []);

    res.status(200).json({
      message: "ទទួលបាននូវ Items ដោយជោគជ័យ",
      total: items.length,
      items: items
    });

  } catch (error) {
    console.error("កំហុសក្នុងការទទួលបាន Items:", error);
    res.status(500).json({
      message: "មានកំហុលើម៉ាឌែលសេវាកម្ម",
      error: error.message
    });
  }
};


exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const items = await readJsonFile(ITEMS_FILE_PATH, []);

    const item = items.find(i => i.id === parseInt(id));

    if (!item) {
      return res.status(404).json({
        message: "រកមិនឃើញ Item ដែលមាន ID: " + id
      });
    }

    res.status(200).json({
      message: "ទទួលបាន Item ដោយជោគជ័យ",
      item: item
    });

  } catch (error) {
    console.error("កំហុសក្នុងការក្ខើង Item:", error);
    res.status(500).json({
      message: "មានកំហុលើម៉ាឌែលសេវាកម្ម",
      error: error.message
    });
  }
};


exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;

    const items = await readJsonFile(ITEMS_FILE_PATH, []);

    const itemIndex = items.findIndex(i => i.id === parseInt(id));

    if (itemIndex === -1) {
      return res.status(404).json({
        message: "រកមិនឃើញ Item ដែលមាន ID: " + id
      });
    }

    if (name) items[itemIndex].name = name;
    if (description) items[itemIndex].description = description;
    if (price) items[itemIndex].price = parseFloat(price);

    await writeJsonFile(ITEMS_FILE_PATH, items, `Update item ${id}`);

    res.status(200).json({
      message: "Item ក្ខើងបានដោយជោគជ័យ ✓",
      item: items[itemIndex]
    });

  } catch (error) {
    console.error("កំហុសក្នុងការក្ខើង Item:", error);
    res.status(500).json({
      message: "មានកំហុលើម៉ាឌែលសេវាកម្ម",
      error: error.message
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const items = await readJsonFile(ITEMS_FILE_PATH, []);

    const itemIndex = items.findIndex(i => i.id === parseInt(id));

    if (itemIndex === -1) {
      return res.status(404).json({
        message: "រកមិនឃើញ Item ដែលមាន ID: " + id
      });
    }

    items.splice(itemIndex, 1);

    await writeJsonFile(ITEMS_FILE_PATH, items, `Delete item ${id}`);

    res.status(200).json({
      message: "Item លុបបានដោយជោគជ័យ ✓",
      deletedId: id
    });

  } catch (error) {
    console.error("កំហុសក្នុងការលុប Item:", error);
    res.status(500).json({
      message: "មានកំហុលើម៉ាឌែលសេវាកម្ម",
      error: error.message
    });
  }
};
