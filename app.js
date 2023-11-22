const express = require('express')
const dotenv = require("dotenv");
const morgan = require('morgan')
const { engine } = require( "express-handlebars");
const mongoose = require('mongoose')
const routes = require('./routes/routes')
const authRoute = require("./routes/auth");
const stories = require("./routes/stories");
const methodOverride = require('method-override')
const path = require('path')
const passport = require('passport')
const session = require('express-session')
const mongoStore = require("connect-mongo")(session);
const connectDB = require('./config/connectDB')

dotenv.config({ path: "./config/config.env" });


require('./config/passport')(passport)

const app = express();


// Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())


// Method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  })
)

//connect to database 
connectDB()


// Set global var
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})



// session setup
app.use(
  session({
    secret: "keyboard",
    resave: false,
    saveUninitialized: false,
    store: new mongoStore ({mongooseConnection:mongoose.connection})
  })
);


//passport setup
app.use(passport.initialize())
app.use(passport.session())


//for deployment
if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev')); 
}

// helper handlebars
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require("./helpers/hbs");

//handlebars
app.engine(
  ".hbs",
  engine({
    helpers: { formatDate, stripTags, truncate, editIcon, select },
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set('view engine', '.hbs')

// static folder
app.use(express.static(path.join(__dirname, 'public')))


// routes
app.use('/', routes)
app.use("/auth", authRoute);
app.use('/stories', stories)


PORT =  process.env.PORT || 6000
// Run Server
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} on PORT${PORT}`);
})