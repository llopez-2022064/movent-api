import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from 'dotenv'
import userRoutes from '../src/user/user.routes.js'
import authRoutes from '../src/auth/auth.routes.js'
import categoryRoutes from '../src/category/category.routes.js'
import accountRoutes from '../src/account/account.routes.js'
import expenseRoutes from '../src/expense/expense.routes.js'
import transfersRoutes from '../src/transfer/transfer.routes.js'

const app = express()
config()
const port = process.env.PORT || 3200

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors({
    origin: [
        "https://movent.netlify.app",
        "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))
app.use(helmet())
app.use(morgan('dev'))

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/categories', categoryRoutes)
app.use('/api/v1/accounts', accountRoutes)
app.use('/api/v1/expenses', expenseRoutes)
app.use('/api/v1/transfers', transfersRoutes)

export const initServer = () => {
    app.listen(port, () => {
        console.log(`Server HTTP running in port ${port}`)
    })
}