class Desing {
  constructor(
    id,
    status,
    pin_num,
    user_id,
    cat_id,
    main_ti,
    title,
    des,
    detail,
    img,
    list_img,
    tags,
    share_count,
    view_count,
    created_at = new Date(),
    updated_at = new Date()
  ) {
    this.id = id;
    this.status = status;
    this.pin_num = pin_num;
    this.user_id = user_id;
    this.cat_id = cat_id;
    this.main_ti = main_ti;
    this.title = title;
    this.des = des;
    this.detail = detail;
    this.img = img;
    this.list_img = list_img;
    this.tags = tags;
    this.share_count = share_count;
    this.view_count = view_count;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

module.exports = Desing;
