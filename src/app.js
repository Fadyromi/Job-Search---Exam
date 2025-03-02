import express from 'express';
import {rateLimit} from 'express-rate-limit';
import errorMiddleware from './middleware/errorMiddleware.js';
import userRoutes from './users/userRoutes.js';
import { graphqlHTTP } from 'express-graphql';
import schema from './graphql/schema.js';
import cors from 'cors';

// import companyRoutes from './routes/companyRoutes.js';
// import jobRoutes from './routes/jobRoutes.js';
// import applicationRoutes from './routes/applicationRoutes.js';



const bootstrap =  async(app , express) =>{

// Initialize Express app
// const app = express();

// Apply CORS middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000' || '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
    credentials: true, // Allow cookies and credentials
  })
);

// Middleware
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes

app.get('/', (req, res) => {
  res.send('Job Search App Backend');
});
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/report', reportRoutes);


// Use error middleware
app.use(errorMiddleware);

app.use('/api/users', userRoutes);
// app.use('/api/companies', companyRoutes);
// app.use('/api/jobs', jobRoutes);
// app.use('/api/applications', applicationRoutes);
// GraphQL endpoint
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true, 
  })
);


}



export default bootstrap;