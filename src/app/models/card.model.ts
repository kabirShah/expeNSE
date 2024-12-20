export class Card {
  id: string;
  cardNumber: string;
  expiryDate: string;
  _id?: string;
  _rev?: string;

  constructor(id: string, cardNumber: string, expiryDate: string, _id?: string, _rev?: string) {
    this.id = id;
    this.cardNumber = cardNumber;
    this.expiryDate = expiryDate;
    this._id = _id;
    this._rev = _rev;

    // Validate card data
    if (!this.isValid()) {
      throw new Error('Invalid card data');
    }
  }

  // Validation for card fields
  private isValid(): boolean {
    const cardNumberPattern = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
    if (!cardNumberPattern.test(this.cardNumber)) {
      return false;
    }

    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryPattern.test(this.expiryDate)) {
      return false;
    }

    return true;
  }

  // Convert the Card instance to a plain object for use with PouchDB
  toObject(): { _id?: string, id: string, cardNumber: string, expiryDate: string, _rev?: string } {
    return {
      _id: this._id, // _id is optional for new records
      id: this.id,
      cardNumber: this.cardNumber,
      expiryDate: this.expiryDate,
      _rev: this._rev  // _rev is only used for updates
    };
  }
}
