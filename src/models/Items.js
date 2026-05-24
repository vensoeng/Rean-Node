
class Item {
  constructor(id, name, description, price, createdAt = new Date()) {
    this.id = id;                    
    this.name = name;                
    this.description = description; 
    this.price = price;              
    this.createdAt = createdAt;     
  }
}

module.exports = Item;
