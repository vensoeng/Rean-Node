
class Post {
    constructor(id,status, title, tag, hastag, img, file, description, createdAt = new Date(), updatedAt = new Date()) {
        this.id = id;
        this.title = title;
        this.status = status;
        this.tag = tag;
        this.hastag = hastag;
        this.img = img;
        this.file = file;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

module.exports = Post;