class PlayList {
  constructor(id, status, title, des, img, created_at, updated_at) {
    this.id = id;
    this.status = status;
    this.title = title;
    this.des = des;
    this.img = img;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

module.exports = PlayList;
