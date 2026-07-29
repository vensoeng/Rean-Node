class Booking {
  constructor(
    id,
    created_at = new Date(),
    updated_at = new Date()
  ) {
    this.id = id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

module.exports = Booking;
