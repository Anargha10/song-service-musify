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

app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
