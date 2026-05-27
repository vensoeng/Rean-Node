
class Blog {
    constructor(id, user_id, status, title, des, detail, main_hastag, hastag, img, file, created_at = new Date(), updated_at = new Date()) {
        this.id = id
        this.user_id = user_id
        this.status = status,
        this.title = title,
        this.des = des,
        this.detail = detail,
        this.main_hastag = main_hastag,
        this.hastag = hastag,
        this.img = img,
        this.file = file,
        this.created_at = created_at,
        this.updated_at = updated_at
    }
}

module.exports = Blog;