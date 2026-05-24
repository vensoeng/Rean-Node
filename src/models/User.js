
class User {
    constructor(id,username, fistName, lastName, pr_img, bio, gender, birthday, email, password, role, created_at = new Date(), updated_at = new Date()) {
        this.id = id
        this.username = username,
        this.firstName = fistName,
        this.lastName = lastName,
        this.pr_img = pr_img,
        this.bio = bio,
        this.gender = gender,
        this.birthday = birthday,
        this.email = email,
        this.password = password,
        this.role = role,
        this.created_at = created_at,
        this.updated_at = updated_at
    }
}

module.exports = User;