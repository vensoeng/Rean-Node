class Project {
  constructor(
    id,
    status,
    user_id,
    service_id,
    title,
    des,
    img,
    tags,
    link,
    ifram,
    view_count,
    created_at = new Date(),
    updated_at = new Date()
  ) {
    this.id = id;
    this.status = status;
    this.user_id = user_id;
    this.service_id = service_id;
    this.main_ti = main_ti;
    this.title = title;
    this.des = des;
    this.detail = detail;
    this.img = img;
    this.tags = tags;
    this.link = link;
    this.ifram = ifram;
    this.view_count = view_count;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

module.exports = Project;
