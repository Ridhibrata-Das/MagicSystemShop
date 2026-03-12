# Firebase Database Setup

Firebase Firestore is a **NoSQL Document Database**, so it does not use SQL commands (`CREATE TABLE`, etc.). Instead, the application automatically creates collections (`products`, `users`, `carts`, `orders`) on-the-fly the first time data is written to them.

However, since you requested a setup script regarding structure and storage, here is the direct equivalent of what sets up and configures the permissions and indexes in Firebase (which functions as our "setup queries"):

## 1. Security Rules Setup (firestore.rules)
This "query" establishes our tables and secures them:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null; // Admin only in prod
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /orders/{orderId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 2. Storage Setup (storage.rules)
If you decide to utilize Firebase Storage instead of Cloudinary later, run this "query":
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /product_images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null; // Admin only in prod
    }
  }
}
```

## 3. Database Initializer (Data Seeding)
In SQL, you would `INSERT INTO products...`. In Firebase, we run the custom Node endpoint we created via our application.

To populate the actual database with data, run the Next.js server and execute a GET request:
```bash
curl http://localhost:3000/api/seed
```
This acts as your `INSERT` setup script, seeding 50 mock RPG catalog items instantly.
