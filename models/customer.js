/** Customer for Lunchly */

const { search } = require("../app");
const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map(c => new Customer(c));
  }

  /**Search customers by name */
  static async nameSearch(searchString){
    console.log(`searching for ${searchString}`);
    const results = await db.query(
      `SELECT id, 
      first_name AS "firstName",  
      last_name AS "lastName", 
      phone, 
      notes
    FROM customers
    WHERE first_name ilike '${searchString}'
    OR last_name ilike '${searchString}'
    ORDER BY last_name, first_name`
    );
    return results.rows.map(c => new Customer(c));
  }

  /**get top ten customers by number of reservations */
  static async getTop10(){
    const results = await db.query(
      `SELECT customer_id as "id", first_name as "firstName", last_name as "lastName", count(r.id) as count
      FROM reservations as r join customers as c on customer_id=c.id 
      GROUP BY customer_id, first_name, last_name 
      ORDER BY COUNT(r.id) DESC 
      LIMIT 10`
      )

      for (let customer of results.rows){

        // console.log(`Customer.id = ${customer.id}, Customer.count=${customer.count}`)
      }
      return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** Get customer's full name (by id) */

  get fullName(){
    return `${this.firstName} ${this.lastName}`;
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  } 

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }
}

module.exports = Customer;
