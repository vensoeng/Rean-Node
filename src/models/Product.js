class Product {
  constructor(
    id,
    status,
    pin,
    user_id,
    cat_id,
    name,
    des,
    detail,
    file,
    img,
    list_img,
    price,
    stock,
    pesent,
    note,
    tags,
    share_count,
    view_count,
    created_at = new Date(),
    updated_at = new Date()
  ) {
    this.id = id;
    this.status = status;
    this.pin = pin;
    this.user_id = user_id;
    this.cat_id = cat_id;
    this.name = name;
    this.des = des;
    this.detail = detail;
    this.price = price;
    this.stock = stock;
    this.pesent = pesent;
    this.note = note;
    this.list_img = list_img;
    this.img = img;
    this.file = file;
    this.tags = tags;
    this.share_count = share_count;
    this.view_count = view_count;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

module.exports = Product;
