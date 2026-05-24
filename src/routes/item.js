
const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");

// create new item 
router.post("/", itemController.createItem);
// get all items
router.get("/", itemController.getAllItems);
// get item by id
router.get("/:id", itemController.getItemById);
// update item by id
router.put("/:id", itemController.updateItem);
// delete item by id
router.delete("/:id", itemController.deleteItem);

module.exports = router;

