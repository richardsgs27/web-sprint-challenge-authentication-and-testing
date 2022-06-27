const server = require('./server')
const request = require('supertest')
const bcrypt = require('bcryptjs')
const db = require('../data/dbConfig')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../api/secrets')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

beforeEach(async () => {
  await db('users').truncate()
  await db('users')
    .insert([
      {
        "username": "steve",
        "password": "$2a$08$agGThXzsmeCp0M9kGGLGvOJ6TqbO.1V0oDq/hZR4P4kggin6O9ptq",
      },
      {
        "username": "steven",
        "password": "$2a$08$Yp5KV..j1jgbaDUuLjt0COmV7/YyRHc/w1kDKykikSig2FQh3OMOO",
      },
      {
        "username": "stevie",
        "password": "$2a$08$r0qBJDxYUDvElFf2r42Ymul8BRGCIbvRc9l.RFqBlaGoOi1Ytc.CO",
      }
    ])
})

afterAll(async () => {
  await db.destroy()
})

describe('POST /register', () => {
  test('If username is not included, responds with "username and password required" and user is not created', async () => {
    let res = await request(server).post('/api/auth/register').send({ password: '1234' })
    expect(res.body.message).toBe('username and password required')
    const users = await db('users')
    expect(users).toHaveLength(3)
  })
  test('If password is not included, responds with "username and password required" and user is not created', async () => {
    res = await request(server).post('/api/auth/register').send({ username: 'bill' })
    expect(res.body.message).toBe('username and password required')
    const users = await db('users')
    expect(users).toHaveLength(3)
  })
  test('If username is already taken, responds with "username taken" and user is not created', async () => {
    const res = await request(server).post('/api/auth/register').send({ username: 'steve', password: '1234' })
    expect(res.body.message).toBe('username taken')
    const users = await db('users')
    expect(users).toHaveLength(3)
  })
  test('Hashed (bcrypted) password is saved to database, not plaintext', async () => {
    const password = '1234'
    await request(server).post('/api/auth/register').send({ username: 'bill', password })
    const user = await db('users').where('id', 4).first()
    const validCreds = bcrypt.compareSync(password, user.password)
    expect(validCreds).toBe(true)
  })
  test('On successful register, creates a new username in the database', async () => {
    await request(server).post('/api/auth/register').send({ username: 'billy', password: '1234' })
    const users = await db('users')
    const user = await db('users').where('id', 4).first()
    expect(user).toMatchObject({ username: 'billy', id: 4 })
    expect(users).toHaveLength(4)
  })
  test('On successful register, responds with 201 status', async () => {
    let res = await request(server).post('/api/auth/register').send({ username: 'billy', password: '1234' })
    expect(res.status).toBe(201)
  })
})

describe('POST /login', () => {
  test('if username is not in database, responds with status 401', async () => {
    const res = await request(server).post('/api/auth/login').send({ username: '' })
    expect(res.status).toBe(401)
  })
  test('If username is not in database, responds with "invalid credentials"', async () => {
    const res = await request(server).post('/api/auth/login').send({ username: 'william', password: '1234' })
    expect(res.body.message).toBe("invalid credentials")
  })
  test('if password is incorrect, responds with status 401', async () => {
    const res = await request(server).post('/api/auth/login').send({ username: 'steve', password: '4321' })
    expect(res.status).toBe(401)
  })
  test('If password is incorrect, responds with "invalid credentials"', async () => {
    const res = await request(server).post('/api/auth/login').send({ username: 'steve', password: '4321' })
    expect(res.body.message).toBe("invalid credentials")
  })
  test('on successful login, returns status 200', async () => {
    const res = await request(server).post('/api/auth/login').send({ username: 'steve', password: '1234' })
    expect(res.status).toBe(200)
  })
  test('on successful login, returns welcome message', async () => {
    const res = await request(server).post('/api/auth/login').send({ username: 'steve', password: '1234' })
    expect(res.body.message).toBe('welcome, steve')
  })
})

describe('GET /users', () => {
  test('Returns an array of current users', async () => {
    const res = await request(server).get('/api/users')
    expect(res.body).toBeInstanceOf(Array)
  })
  test('If no users, returns an empty array', async () => {
    await db('users').truncate()
    const res = await request(server).get('/api/users')
    expect(res.body).toHaveLength(0)
  })
})

describe('GET /jokes', () => {
  test('If token is missing, responds with "token required"', async () => {
    const res = await request(server).get('/api/jokes')
    expect(res.body.message).toBe('Token required')
  })
  test('If token invalid, responds with "token invalid"', async () => {
    const jokesRes = await request(server).get('/api/jokes').set('Authorization', 'imposterToken')
    expect(jokesRes.body.message).toBe('Token invalid')
  })
  test('Returns an array of jokes', async () => {
    const res = await request(server).post('/api/auth/login').send({ username: 'steve', password: '1234' })
    const { token } = res.body
    const jokesRes = await request(server).get('/api/jokes').set('Authorization', token)
    expect(jokesRes.body).toBeInstanceOf(Array)
    expect(jokesRes.body).toHaveLength(3)
  })
})