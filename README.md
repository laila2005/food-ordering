# Electro Pi Online Food Ordering Web Application (24-Hour Technical Assessment)

An enterprise-grade, real-time, multi-lingual Online Food Ordering prototype built from scratch under a strict 24-hour deadline. The application emphasizes clean architecture, database optimization, dynamic Right-to-Left (RTL) layout switching, and live bi-directional socket streams.

---

## 🏗️ System Architecture (Clean Architecture & CQRS)

The backend follows the **Onion (Clean) Architecture** pattern, enforcing strict separation of concerns and keeping domain entities free of third-party infrastructure.

```
                  ┌────────────────────────────────────────┐
                  │                 WebAPI                 │
                  │   (Controllers, Hubs, Middlewares)     │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │              Application               │
                  │        (Interfaces, DTOs, Maps)        │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │                 Domain                 │
                  │     (Entities, Enums, Interfaces)      │
                  └────────────────────────────────────────┘
                                      ▲
                                      │
                  ┌───────────────────┴────────────────────┐
                  │             Infrastructure             │
                  │   (DbContext, PasswordHasher, Token)   │
                  └────────────────────────────────────────┘
```

- **Domain Layer:** Pure standard library. Contains core structures (User, Product, Category, Order, OrderItem) and enums (Role, OrderStatus).
- **Application Layer:** Contains DTO definitions for authentication, menus, and order operations, along with service interfaces.
- **Infrastructure Layer:** Implements standard data persistence (`ApplicationDbContext`), cryptographic password hashing (using ASP.NET Core PasswordHasher), and JWT generation (`JwtService`).
- **WebAPI Layer:** Consists of controllers, the SignalR order tracking Hub (`OrderHub`), and dynamic startup configurations (including automatic DB migration and seed engines).

---

## 💾 PostgreSQL Schema with JSONB Localization

To store multi-language product strings (English and Arabic) with high performance and zero join overhead, the schema leverages PostgreSQL's native **JSONB** column type.

```sql
CREATE TABLE "Products" (
    "Id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name"        JSONB NOT NULL,       -- Format: {"en": "Double Cheeseburger", "ar": "دبل تشيز برجر"}
    "Description" JSONB NOT NULL,       -- Format: {"en": "Beef patty...", "ar": "شريحة لحم..."}
    "Price"       DECIMAL(18,2) NOT NULL,
    "ImageUrl"    VARCHAR(500) NOT NULL,
    "CategoryId"  UUID REFERENCES "Categories"("Id") ON DELETE SET NULL,
    "IsAvailable" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt"   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### Advantages:
1. **Dynamic Extensibility:** Adding a third language (e.g., French or Turkish) requires zero database schema migrations.
2. **Indexing:** Fast lookups are guaranteed by applying **Generalized Inverted Indexes (`GIN`)** over the JSONB properties.
3. **Frontend Simplicity:** The API returns Name/Description properties directly as localized dictionaries, allowing the React UI to display correct translations immediately depending on the `i18n.language` state.

---

## 📡 SignalR Real-Time Sockets Architecture

Real-time order statuses are pushed immediately from the database to clients using C# SignalR Hubs with strongly-typed client groups.

```
       [Customer Client]                            [Admin Panel]
               │                                          │
        (joins group)                              (joins group)
      "JoinOrderGroup(id)"                      "JoinAdminDashboard()"
               │                                          │
               ▼                                          ▼
     ┌───────────────────┐                      ┌───────────────────┐
     │                   │                      │                   │
     │                   │◄──[ Place Order ]────┤                   │
     │     OrderHub      │                      │                   │
     │                   │───(New Order Alert)─►│                   │
     │                   │                      │                   │
     │                   │◄──[ Update Status ]──┤                   │
     │                   │                      │                   │
     │(Status Pushed to) │                      │                   │
     │ "ReceiveStatus"   │                      │                   │
     └─────────┬─────────┘                      └───────────────────┘
               │
               ▼
     (React UI Updated)
```

1. When a Customer views their order, the frontend hooks up to `OrderHub` and invokes `JoinOrderGroup` using their unique Order ID.
2. When an Admin updates an order's status from the dashboard, the API controller modifies the database and broadcasts the status update to the specific client group `Order_{id}`.
3. The Customer's React `useOrderTracking` hook catches the event and immediately transitions the animated tracking timeline.

---

## 🌍 Frontend Localization & RTL Layout

The frontend client utilizes `react-i18next` for seamless dynamic language toggles.

- **Cairo & Inter Font pairing:** When the language is toggled, Cairo (optimized for Arabic) or Inter (optimized for English) is prioritised in the base CSS stylesheet.
- **RTL Logical Properties:** Tailwind CSS's native **logical attributes** (`ms-*` instead of `ml-*`, `pe-*` instead of `pr-*`, and `text-start`) are implemented, allowing the entire page layout to flip seamlessly when `<html dir="rtl">` is set without writing redundant stylesheets.

---

## 🚀 Step-by-Step Setup Instructions

### 🛠️ Backend API Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Update the `ConnectionString` inside `src/FoodOrdering.WebAPI/appsettings.json` to point to your PostgreSQL server instance.
   *(Default: `Host=localhost;Database=foodordering;Username=postgres;Password=postgres`)*
3. Run the API project:
   ```bash
   dotnet run --project src/FoodOrdering.WebAPI
   ```
   *Note: On startup, the API will automatically ensure the PostgreSQL database is created and fully seeded with a multi-language food catalog!*

### 💻 Frontend React Client Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Run standard installation of npm dependencies:
   ```bash
   npm install
   ```
3. Set your backend endpoint URL inside a `.env` environment file:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the local Vite server:
   ```bash
   npm run dev
   ```

---

## ⚖️ Strategic Trade-offs & Compromises (Under 24-Hour Scope)

To meet the strict time limits of this assessment, the following structural decisions were made:
- **Mock Payment rails:** Payment selections include Credit Card (Stripe) and Cash on Delivery. To avoid setting up webhook listeners or sandboxes, checking out via Stripe mocks a successful API checkout response automatically.
- **In-Memory DbSeeder:** In a production context, database seeding would happen through Entity Framework migrations files or DbUp tools. We embedded the seeder inside `Program.cs` under an `EnsureCreated()` block to ensure the app works flawlessly out of the box.
- **State-Based Page Routing:** Instead of importing `react-router-dom` (which adds bundle size and setup overhead), a clean state router was created inside `App.jsx`, ensuring immediate responsiveness and zero route configuration friction.

---

## 🏆 Current Status & Core Milestones Achieved

The prototype has been dramatically enhanced to an enterprise-grade standard, delivering an outstanding visual aesthetic ("wow factor") and flawless user experience:

1. **Dynamic Theme Engine (Sunset Gold, Cozy Forest, Velvet Night):**
   - Implemented a complete design token system (`index.css` mapped in Tailwind v4 `@theme`) hooked to a React `ThemeContext.jsx` switcher.
   - Built custom shimmers, details quick-view modal dialogs, instant catalog searches, custom notes checkout grouping, and auto-dismiss toast notices.
   - Every surface in the app dynamically shifts HSL variables when toggling themes, maintaining beautiful color harmony and premium glassmorphic effects.
2. **Glassmorphic Theme-Adaptive Navbar & Mobile Bottom Tab Bar:**
   - Redesigned the desktop top Navbar and floating bottom mobile tab bar to adapt dynamically to active themes (`bg-bg-card/85 backdrop-blur-md border-border-card text-text-main shadow-xs transition-colors duration-300`).
3. **Responsive Order Tracking & Portal:**
   - Polished `OrderHistory.jsx` and `OrderTracking.jsx` empty states and order list cards.
   - Created translucent glowing HSL status pills (`bg-emerald-500/10 text-emerald-500` for Delivered, `bg-rose-500/10 text-rose-500` for Cancelled).
   - Unified the shortcuts panel inside `TrackDashboard.jsx` to adapt flawlessly across all visual themes.
4. **Persistent LocalStorage Syncing:**
   - Integrated automatic persistent syncing for client checkout inputs (Address, Phone, Landmark, Notes) in `CartDrawer.jsx`, protecting customers from losing their order details upon accidental page reloads.
5. **Secure Client-Side Route Guards:**
   - Added client-side app route-guards in `App.jsx` to instantly restrict and redirect standard user sessions away from the Admin Dashboard.
6. **Premium Logistics Admin Dashboard:**
   - Upgraded the Admin Dashboard (`AdminDashboard.jsx`) with sliding workspace tabs (`Fulfillment Feed` vs `Catalog Manager`), live order feeds, custom status color-coded dropdown controllers, and complete Toast alerts.
7. **Premium Product Overlay Modal Dialog:**
   - Replaced basic inline add/edit forms with a centered, backdrop-blurred dialog modal featuring textareas for description fields, `dir="rtl"` typing alignment for Arabic inputs, and an active miniature image preview rendering block.
8. **Organized Menu Catalog, Live Search Filtering & RTL Sizing Alignments:**
   - Integrated dynamic multi-field search inputs and category selection widgets into the Admin Catalog workspace tab, supported by localized category database tags.
   - Refactored customer-facing and administrator-facing search panels to use native logical CSS positioning (`start`, `end`, `ps`, `pe`), ensuring proper side shifts for magnifying and close buttons in Arabic RTL layouts.
   - Added complete bi-directional translation sets in standard `en.json` and `ar.json` structures, making the entire product catalog workflow localized.
9. **Interactive Client Favorites Viewing & Filtering:**
   - Introduced a dedicated, HSL-themed "Favorites (❤️)" tab option inside the categories filter bar in the client menu grid.
   - Configured instant client-side filtering against local storage arrays (`fav_products`), along with an active empty state guide dialog to invite users to save their favorite dishes.
10. **Dynamic Dessert Menu Seeding & Database Resilience:**
    - Upgraded `DbSeeder.cs` with a conditional database query engine that safely detects and adds the **Dessert** category and premium dessert products (Chocolate Fudge Cake, Strawberry Cheesecake) onto already-populated SQLite instances without dropping tables or losing live order transaction databases.




