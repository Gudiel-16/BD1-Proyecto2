const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const mysqlStore = require('express-mysql-session');
const {database} = require('./keys');

//inicializaciones
const app = express();

//settings
app.set('port',process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views')); //le hago saber a node, donde esta la carpeta views
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'),'layouts'), //le digo que layouts esta dentro de views
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));

app.set('view engine', '.hbs');

//middlewares
app.use(session({
    secret: 'gudielmysqlnodesession',
    resave: false,
    saveUninitialized: false,
    store: new mysqlStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false})); /*hacepta todo menos imgs*/
app.use(express.json());


//Variables globales
app.use((req, res, next)=>{
    app.locals.success = req.flash('success');
    next();
});

//rutas
app.use(require('./routes'));
app.use(require('./routes/authentication'));
app.use('/links',require('./routes/links'));

//public
app.use(express.static(path.join(__dirname,'public')));

//iniciando server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});