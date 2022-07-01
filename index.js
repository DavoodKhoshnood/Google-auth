const express = require('express')
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')

const { Pool } = require('pg')

require('./auth')

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'videos',
  user: 'user',
  password: '0o9i8u7y',
})

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// })


function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401)
}

const app = express()
app.use(session({ secret: 'cats' }))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('<a href="/auth/google"> Authenticate with Google</a>')
})

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }),
)

app.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/failure',
  }),
)

app.get('/auth/failure', (req, res) => {
  res.send('something went wrong...')
})

app.get('/protected', isLoggedIn, (req, res) => {
  const { name, email, picture } = req.user;
  pool.query(`select * from users where email = $1`, [email])
  .then(result => {
    if(result.rows.length==0)
        pool.query(`Insert into users (firstname, surname, email, picture ) 
                    values ($1, $2, $3, $4)`, [name.givenName, name.familyName, email, picture])
        .then(()=> res.sendStatus(201))
        .catch(error => res.json(error))
  }).catch(error => res.json(error))

  res.send(`
    Display name: ${req.user.displayName} </br>
    First name: ${req.user.name.givenName}</br>
    Surname: ${req.user.name.familyName}</br>
    Email: ${req.user.email}</br>
    Picture: ${req.user.picture}</br>
    `)
})

app.get('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    res.redirect('/')
  })
})

app.get('/currentUser', (req, res) => {
    res.json(req.user);
})

app.get('/allVideos', (req, res) => {
    pool.query(`select * 
                from videos 
                order by title desc
                `)
    .then(result => res.status(201).json(result.rows))
    .catch(error => res.status(500).json(error))
})

app.get('/videos', (req, res) => {
  let email = ''  
  if(req.session.passport)
    email = req.session.passport.user.email;
   
  pool.query(`select videos.* 
                from videos 
                inner join users on users.id = user_id 
                where email = $1
                order by title desc`
                 , [email])
    .then(result => res.status(201).json(result.rows))
    .catch(error => res.status(500).json(error))
})

app.post('/videos', (req, res) => {
  const { title, url } = req.body
  const queryString = `Insert Into videos (title, url) values ($1, $2)`
  client
    .query(queryString, [title, url])
    .then((result) => res.status(200).send('Video added!'))
    .catch((error) => res.status(500).json(error))
})

app.put('/:videoId/rating', (req, res) => {
  const id = req.params.videoId
  const rate = req.body.rating
  const queryString = `Update videos Set rating = $1 Where id = $2`
  client
    .query(queryString, [rate, id])
    .then((result) => res.status(201).send('Rating has been updated!'))
    .catch((error) => res.status(500).json(error))
})


app.delete('/:videoId', (req, res) => {
  const id = req.params.videoId
  const queryCheck = `Select * From videos where id = $1`
  const queryString = `Delete From videos where id = $1`
  client
    .query(queryCheck, [id])
    .then((result) => {
      if (result.rows.length == 0) res.status(404).send('Video does not exist!')
      else {
        client
          .query(queryString, [id])
          .then((result) => res.status(200).send('Video has been deleted!'))
          .catch((error) => res.status(500).json(error))
      }
    })
    .catch((error) => res.status(500).json(error))
})

app.listen(5000, () => console.log('listening in: 5000'))
