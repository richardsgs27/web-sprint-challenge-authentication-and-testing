const db = require('../../data/dbConfig')

async function create(user) {
  const [id] = await db('users')
    .insert(user)
  return findById(id)
}

function findAll() {
  return db('users')
}

async function findBy(filter) {
  return db('users')
    .where(filter)
}

async function findById(id) {
  return db('users')
    .where('id', id)
    .first()
}

function findByUserName(username) {
  return db('users')
    .where({ username })
    .first()
}

module.exports = {
  create,
  findAll,
  findById,
  findBy,
  findByUserName
}