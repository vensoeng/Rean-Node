

class Service {
    constructor({
        id,
        user_id,
        status,
        index,
        upper,
        booking_length,
        list_id,
        list_name,
        title,
        title_kh,
        title_zh,
        description,
        description_kh,
        description_zh,
        tags,
        tags_zh,
        tags_kh,
        tags_active,
        tags_active_kh,
        tags_active_zh,
        price_start,
        price_end,
        warranty,
        warranty_zh,
        warranty_kh,
        deposit,
        time,
        time_kh,
        time_zh,
        location,
        location_zh,
        location_kh,
        note,
        note_kh,
        note_zh,
        img_slider,
        img,
        file,
        created_at = new Date(),
        updated_at = new Date()
    }) {
        this.id = id;
        this.user_id = user_id;
        this.status = status;
        this.index = index;
        this.upper = upper;
        this.booking_length = booking_length;
        this.list_id = list_id;
        this.list_name = list_name;
        this.title = title;
        this.title_kh = title_kh;
        this.title_zh = title_zh;
        this.description = description;
        this.description_kh = description_kh;
        this.description_zh = description_zh;
        this.tags = tags;
        this.tags_zh = tags_zh;
        this.tags_kh = tags_kh;
        this.tags_active = tags_active;
        this.tags_active_kh = tags_active_kh;
        this.tags_active_zh = tags_active_zh;
        this.price_start = price_start;
        this.price_end = price_end;
        this.warranty = warranty;
        this.warranty_zh = warranty_zh;
        this.warranty_kh = warranty_kh;
        this.deposit = deposit;
        this.time = time;
        this.time_kh = time_kh;
        this.time_zh = time_zh;
        this.location = location;
        this.location_zh = location_zh;
        this.location_kh = location_kh;
        this.note = note;
        this.note_kh = note_kh;
        this.note_zh = note_zh;
        this.img = img;
        this.file = file;
        this.img_slider = img_slider;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

module.exports = Service;
