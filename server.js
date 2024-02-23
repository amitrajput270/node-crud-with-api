
import express from 'express';
import path, { dirname } from "path";
import { fileURLToPath } from 'url';
import flash from 'express-flash';
import session from 'express-session';
import postRoute from './routes/postRoute.js';
import apiRoutes from './routes/apiRoutes.js';
import authRoute from './routes/authRoute.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());



app.use(session({
    cookie: { maxAge: 60000 },
    store: new session.MemoryStore,
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}))

// Error Handling
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
        message: err.message,
    });
});

app.use(flash());
app.use('/', postRoute);
app.use('/api/auth', authRoute);
app.use(apiRoutes);

// catch 404 and forward to error handler
app.use((err, req, res, next) => {
    console.log(err.message);
    res.send("Error. See console");
});


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));