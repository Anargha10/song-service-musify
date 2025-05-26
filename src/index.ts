import express from 'express';
import dotenv from 'dotenv'; // Import dotenv to load environment variables
import redis from 'redis'
import songRoutes from './route.js'
import cors from 'cors';
dotenv.config(); // Load environment variables from .env file

export const redisClient= redis.createClient({
    password:process.env.Redis_Password ,
    socket:{
        host:"redis-11461.crce182.ap-south-1-1.ec2.redns.redis-cloud.com",
        port: 11461,
    }
})

redisClient.connect().then(()=> console.log("connected to redis"))
.catch(console.error)

const app = express();

app.use(cors());
const PORT = process.env.PORT  // 

app.use(express.json());


app.use('/api/v1', songRoutes)
const allowedOrigins = ['https://www.imanargha.shop', 'https://api.imanargha.shop']; // Add your API domain too if the API itself might need to access something
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Ensure OPTIONS is included
    allowedHeaders: ['Content-Type', 'Authorization'], // Add any custom headers your frontend sends
    credentials: true // If you are sending cookies/authentication headers
}));

app.get("/", (req, res) => {
    res.send("Welcome to the Song Service!");
});
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
