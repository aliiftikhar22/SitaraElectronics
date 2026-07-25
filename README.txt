SITARA ELECTRONICS — WEBSITE + ADMIN PANEL + FIREBASE
========================================================

FILES
  index.html          — the storefront (shop, cart, checkout, order tracking)
  admin.html          — the admin panel (products + orders management)
  styles.css          — shared styling for the storefront
  admin.css           — extra styling just for the admin panel
  script.js           — storefront logic (shop, cart, checkout, tracking)
  admin.js            — admin panel logic (login, product/order CRUD)
  firebase-config.js  — shared Firebase setup — YOU EDIT THIS FILE
  firestore.rules     — recommended Firestore security rules (see step 5)

Keep all files together in one folder — they reference each other by filename.
No build step, no npm install — open index.html directly, or upload the folder
to any static host (Netlify, Vercel, GitHub Pages, cPanel, etc).


HOW IT WORKS RIGHT NOW (BEFORE YOU CONNECT FIREBASE)
  The site works out of the box with 6 demo products and a device-local cart/
  order system, so you can preview everything immediately. Products won't sync
  between the storefront and the admin panel until Firebase is connected —
  that's step-by-step below.


SETTING UP FIREBASE (about 10 minutes)
  1. Create a project
     Go to https://console.firebase.google.com → "Add project" → follow the
     steps (Google Analytics is optional, you can skip it).

  2. Create a Web App
     In your new project: Project Settings (gear icon) → "Your apps" →
     click the "</>" (Web) icon → register the app (any nickname is fine).
     Firebase will show you a firebaseConfig object — copy it.

  3. Paste your config
     Open firebase-config.js in this folder and replace the placeholder
     values (apiKey, authDomain, projectId, etc.) with what you just copied.
     Save the file.

  4. Turn on Firestore (the database)
     In the Firebase Console sidebar: Build → Firestore Database → "Create
     database" → start in production mode → pick a location close to you.

  5. Set the security rules
     Still in Firestore Database, open the "Rules" tab, and paste in the
     contents of firestore.rules (included in this folder). Click "Publish".
     These rules let customers browse products and create/track their own
     orders, while only a logged-in admin can add/edit/delete products or
     change/delete orders.

  6. Turn on login for the admin panel
     Sidebar: Build → Authentication → "Get started" → enable the
     "Email/Password" sign-in method.
     Then go to the "Users" tab → "Add user" → enter the email and password
     you (the shop owner) want to use to log into admin.html. There's no
     public sign-up page on purpose — you create admin accounts yourself,
     one per person who should have access.

  7. Reload the site
     Reload index.html and admin.html in your browser. The storefront will
     now read/write real data in Firestore, and you can log into admin.html
     with the user you created in step 6.

  8. Add your real products
     In admin.html → Products tab → "+ Add Product" for each item, or click
     "Load Sample Products" to start from the 6 demo items and edit them
     from there. Whatever you save here appears live on the storefront —
     no redeploy needed.


USING THE ADMIN PANEL
  Products tab  — add, edit, or delete any product; changes reflect on the
                  storefront instantly.
  Orders tab    — every order placed on the storefront lands here in real
                  time. Change the status dropdown (Order Confirmed →
                  Preparing → Shipped → Delivered) and the customer's
                  tracking page updates live. Delete removes an order
                  permanently.


CUSTOMIZING
  - Contact number / WhatsApp link: search for "923001234567" in index.html.
  - Colors: CSS variables are defined at the top of styles.css under :root.
  - Categories: if you add a category beyond the current six, add it to the
    filter chips and the category select in index.html/admin.html too.


A NOTE ON COSTS
  Firebase's free "Spark" plan comfortably covers a small-to-medium shop —
  you only need to upgrade if traffic gets very high. Check current limits
  at https://firebase.google.com/pricing before launching if that matters
  to you.
