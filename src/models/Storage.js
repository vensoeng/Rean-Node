class Storage {
    constructor(id, user_id, name, created_at = new Date(), updated_at = new Date()) {
        this.id = id
        this.user_id = user_id
        this.name = name
        this.created_at = created_at,
        this.updated_at = updated_at
    }
}

module.exports = Storage;