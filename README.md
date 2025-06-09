# WhatsApp AI Financial Assistant

An AI-powered assistant that lets users record expenses and income, and query their financial data directly through WhatsApp.

---

## 🚀 Overview

This backend service receives WhatsApp messages, parses user input into structured transactions or queries using OpenAI GPT-4, stores financial transactions in PostgreSQL via Prisma, and answers financial queries (total expenses, income, balance) over a date range. It also provides an endpoint to list available GPT models.

## 🛠️ Tech Stack

* **Node.js** (v18+)
* **Express.js**
* **OpenAI SDK (v4+)**
* **PostgreSQL** + **Prisma**
* **date-fns** for date parsing
* **whatsapp-web.js** (to be integrated)
* **nodemon** (development)

## 📁 Project Structure

```
whatsapp-financial-assistant/
├── server.js                   # App entry & route mounting
├── package.json
├── .env                        # env vars: OPENAI_API_KEY, DATABASE_URL, PORT
└── prisma/
    └── schema.prisma           # DB models: User, Transaction
└── src/
    ├── api/
    │   ├── webhook.js         # POST /webhook
    │   └── models.js          # GET /models
    ├── controllers/
    │   └── messageController.js
    ├── services/
    │   ├── gptService.js      # GPT parsing
    │   ├── financeParser.js   # Save transactions
    │   ├── queryService.js    # Handle queries
    │   └── whatsappService.js # Stubbed send logic
    ├── db/
    │   └── index.js           # Prisma client init
    └── utils/
        └── formatters.js      # Currency formatter
```

## ⚙️ Configuration

Create a `.env` file in the project root with the following variables:

```env
OPENAI_API_KEY=<your_openai_key>
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
PORT=3000
```

## 🛠️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repo-url> whatsapp-financial-assistant
   cd whatsapp-financial-assistant
   ```

2. **Install dependencies**

   ```bash
   npm install express dotenv @prisma/client openai date-fns whatsapp-web.js
   npm install --save-dev prisma nodemon
   ```

3. **Generate Prisma client & run migrations**

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Start the server**

   ```bash
   npm start
   # or for development
   npx nodemon server.js
   ```

You should see:

```
✅ Connected to database
🚀 Server running on port 3000
```

## 📬 API Endpoints

### Health Check

```
GET /
→ 200 OK: "OK"
```

### Ingest Message (Webhook)

```
POST /webhook
Content-Type: application/json

{
  "from": "<whatsapp-number>",
  "body": "I spent 80 reais on dinner yesterday"
}
```

* Parses intent & data via GPT-4
* Stores transaction or answers query
* Returns `{ status: 'ok' }` on success
* Logs outgoing WhatsApp stub message

### List GPT Models

```
GET /models
```

* Returns a JSON list of available models from OpenAI.

## 🔍 Testing

Use `curl` or Postman to test endpoints:

1. **Health check**

   ```bash
   curl http://localhost:3000/
   ```

2. **Record transaction**

   ```bash
   curl -X POST http://localhost:3000/webhook \
     -H "Content-Type: application/json" \
     -d '{"from":"+5511999998888","body":"I spent 80 reais on groceries yesterday"}'
   ```

3. **Query expenses**

   ```bash
   curl -X POST http://localhost:3000/webhook \
     -H "Content-Type: application/json" \
     -d '{"from":"+5511999998888","body":"How much did I spend last week?"}'
   ```

4. **Get models**

   ```bash
   curl http://localhost:3000/models
   ```

## ✅ Completed Features

* Express server & routing
* GPT-4 parsing (transactions & queries)
* Transaction persistence via Prisma
* Query computation & GPT-formatted response
* Models listing endpoint
* Logging & health check

## 🚧 Roadmap / Next Steps

* **WhatsApp integration** with `whatsapp-web.js`
* **Error handling** & input validation
* **Unit & integration tests** (mock OpenAI & Prisma)
* **Authentication** for webhook
* **Dockerization & CI/CD**
* **UI / Dashboard** for transaction overview

---

