# Finance OS API Documentation

## Base URL
`/api`

## Authentication

### `POST /auth/register`
Create a new user.
- **Body**: `{ firstName, lastName, email, password }`
- **Response**: `{ success: true, data: { user, token } }`

### `POST /auth/login`
Authenticate a user.
- **Body**: `{ email, password }`
- **Response**: `{ success: true, data: { user, token } }`

### `GET /auth/me`
Get current user profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success: true, data: { user } }`

## Accounts

### `GET /accounts`
List all user accounts.
- **Headers**: `Authorization: Bearer <token>`

### `POST /accounts`
Create a new account.
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ name, type, balance, currency }`

## Transactions

### `GET /transactions`
List user transactions with pagination.
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `page`, `limit`, `startDate`, `endDate`, `account`, `category`, `type`

### `POST /transactions`
Create a new transaction.
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ account, category, amount, type, date, description }`

## Budgets

### `GET /budgets`
List user budgets.
- **Headers**: `Authorization: Bearer <token>`

### `POST /budgets`
Create a new budget.
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ category, amount, period }`

## Goals

### `GET /goals`
List user goals.
- **Headers**: `Authorization: Bearer <token>`

### `POST /goals`
Create a new financial goal.
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ name, targetAmount, currentAmount, deadline }`

## Categories

### `GET /categories`
List user categories.
- **Headers**: `Authorization: Bearer <token>`

### `POST /categories`
Create a custom category.
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ name, type, color, icon }`

## Analytics

### `GET /analytics/summary`
Get overall financial summary.
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `month`, `year`

### `GET /analytics/cashflow`
Get cashflow trends over time.
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `months`
