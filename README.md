# Integrated Food Delivery and Dine-Out Hospiatality Platfrom

A full-stack food delivery and table reservation app (product name: **TiffinBox**, shown in the UI).
- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Auth:** JWT
- **Image upload:** Multer (local disk storage, served at `/uploads`)

## Opening this in VS Code (Windows)

1. Unzip the downloaded `TiffinBox.zip` somewhere like `C:\Users\<you>\Projects\`.
2. Open VS Code → **File > Open Folder** → select the unzipped `TiffinBox` folder.

## Pushing to your GitHub repo

```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/patel1125/TiffinBox.githttps://git
git push -u origin main
```

## Running the backend
```
cd backend
npm install
copy .env.example .env
```
Set `MONGO_URI` and `JWT_SECRET` in `.env`, then:
```
npm run dev
```
Backend runs at `http://localhost:5000`.

## Running the frontend
```
cd frontend
npm install
copy .env.example .env
npm run dev
```
Frontend runs at `http://localhost:5173`.

## Seeding demo data
```
cd backend
npm run seed
```
Creates 2 demo restaurants with menu items, plus two demo accounts:
- **Owner:** owner@tiffinbox.com / password123
- **Admin:** admin@tiffinbox.com / password123

## Roles & dashboards
When registering, choose a role:
- **Customer** → browses restaurants, orders, reviews, loyalty points, notifications, reservations
- **Restaurant Owner** → `/owner` — create restaurants, add menu categories/items (with image upload), manage incoming orders
- **Delivery Agent** → `/agent` — register vehicle details, toggle availability, see assigned orders, send live location updates
- **Admin** → `/admin` — platform stats, change any user's role, activate/deactivate restaurants

(Admin role isn't selectable at signup — promote a user to admin via the seeded `admin@tiffinbox.com` account, or manually in MongoDB.)

## Folder structure
```
TiffinBox/
├── backend/
│   ├── server.js, seed.js
│   ├── config/db.js
│   ├── middleware/ (auth.js, errorMiddleware.js)
│   ├── models/      (14 schemas matching your DB tables)
│   ├── routes/      (14 route files — users, restaurants, menu, cart, orders,
│   │                 reservations, reviews, loyalty, delivery, payments,
│   │                 notifications, upload, owner, admin)
│   └── uploads/     (uploaded menu item images land here)
└── frontend/
    └── src/
        ├── components/ (Navbar, RestaurantCard, MenuItemCard, ReviewsSection, ProtectedRoute)
        ├── pages/       (Home, RestaurantDetail, Cart, Checkout, Login, Register,
        │                 Orders, Reservations, Loyalty, Notifications,
        │                 OwnerDashboard, AgentDashboard, AdminPanel)
        ├── context/AuthContext.tsx
        ├── services/api.ts
        ├── types/index.ts
        └── App.tsx, main.tsx, index.css
```

## What's fully covered
All 14 database tables have a Mongoose model + working API routes, AND a frontend screen:

| Table | Frontend |
|---|---|
| Users | Login/Register, Admin user management |
| Restaurants | Home, Owner Dashboard |
| Menu Categories / Items | Restaurant Detail, Owner Dashboard (with image upload) |
| Cart | Cart page |
| Orders / Order Items | Orders page, Owner Dashboard, Agent Dashboard |
| Table Reservations | Reservations page |
| Reviews & Ratings | Restaurant Detail page |
| Loyalty Rewards | Loyalty page |
| Delivery Agents | Agent Dashboard |
| Delivery Tracking | Orders page (Track button), Agent Dashboard (send location) |
| Payments | Created automatically at checkout |
| Notifications | Notifications page |

## Known limitations
- Image storage is local disk (`backend/uploads`) — fine for development; for production deploy you'd want Cloudinary/S3/Firebase Storage instead, since most hosts wipe local files on redeploy.
- Delivery agent location updates are manual (a form), not live GPS — wiring actual device GPS would need the browser Geolocation API.
- No payment gateway integration (Stripe/Razorpay) — checkout just records a Payment record.
