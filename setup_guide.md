# Firebase Cloud Database Setup Guide
## (Dewangan Photo & Videography Cloud Integration)

यह गाइड आपको अपने Firebase Console में प्रोजेक्ट सेटअप करने, **Authentication**, **Firestore Database**, और **Storage** को चालू करने तथा Security Rules को कॉन्फ़िगर करने की पूरी जानकारी देगी।

---

## Step 1: Firebase Project बनाना
1. [Firebase Console](https://console.firebase.google.com/) पर जाएं।
2. **"Add Project"** पर क्लिक करें।
3. प्रोजेक्ट का नाम दें (जैसे: `dewangan-studio-suite`) और **Continue** करें।
4. Google Analytics को अपनी इच्छानुसार Enabled/Disabled रख कर **Create Project** पर क्लिक करें।

---

## Step 2: Authentication चालू करना (Owner Login के लिए)
1. Firebase Console के बाएं साइडबार में **Build > Authentication** पर जाएं।
2. **"Get Started"** पर क्लिक करें।
3. **Sign-in method** टैब में **"Email/Password"** प्रोवाइडर पर क्लिक करें।
4. **Email/Password** को **Enable** करें और **Save** करें।
5. **Users** टैब पर जाएं और **"Add User"** पर क्लिक करें:
   - **Email:** `admin@dewangan.com` (या जो भी आप चाहें)
   - **Password:** अपना सुरक्षित पासवर्ड सेट करें।
   - *नोट:* यही क्रेडेंशियल्स आपके Admin Panel (`admin.html`) में लॉगिन करने के काम आएंगे।

---

## Step 3: Cloud Firestore Database बनाना
1. बाएं साइडबार में **Build > Firestore Database** पर जाएं।
2. **"Create Database"** पर क्लिक करें।
3. **Start in Test Mode** चुनें (ताकि सेटअप के दौरान कनेक्टिविटी में दिक्कत न आए)।
4. डेटाबेस की लोकेशन डिफ़ॉल्ट रहने दें और **Enable** पर क्लिक करें।

---

## Step 4: Firestore Database Security Rules लागू करना
1. Firestore Database में ऊपर **Rules** टैब पर जाएं।
2. नीचे दी गई सुरक्षित **Security Rules** को कॉपी करें और वहां पेस्ट करें:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Check if the user is authenticated as Admin
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'admin@dewangan.com';
    }

    // Public Collections: Anyone can read, only Admin can write
    match /services/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /gallery/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /categories/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /blog/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /mediaItems/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /settings/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Private Collections: Only authenticated Admin can read or write
    match /customers/{document} {
      allow read, write: if isAdmin();
    }
    
    match /invoices/{document} {
      allow read, write: if isAdmin();
    }
    
    match /quotations/{document} {
      allow read, write: if isAdmin();
    }

    // Enquiries: Public visitors can create (write) an enquiry, only Admin can read/manage
    match /enquiries/{document} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }
  }
}
```

3. **Publish** बटन पर क्लिक करके नियमों को सेव करें।

---

## Step 5: Firebase Cloud Storage बनाना (फोटो अपलोड के लिए)
1. बाएं साइडबार में **Build > Storage** पर जाएं।
2. **"Get Started"** पर क्लिक करें।
3. **Start in Test Mode** चुनकर **Next** करें और फिर **Done** करें।

---

## Step 6: Firebase Storage Security Rules लागू करना
1. Storage में ऊपर **Rules** टैब पर जाएं।
2. नीचे दिए गए **Security Rules** को कॉपी करके पेस्ट करें:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper function: Check if user is authenticated admin
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'admin@dewangan.com';
    }

    // Anyone can read uploaded images, only authenticated Admin can upload or delete
    match /{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

3. **Publish** बटन दबाकर नियमों को सहेजें।

---

## Step 7: Web App जोड़ना और Config हासिल करना
1. Firebase Console के होमपेज (Project Overview) पर जाएं।
2. स्क्रीन के बीच में वेब आइकॉन ( **`</>`** ) पर क्लिक करें।
3. अपने ऐप का नाम दें (जैसे: `Dewangan Portfolio App`) और **Register App** पर क्लिक करें।
4. आपको स्क्रीन पर एक JavaScript कॉन्फ़िगरेशन कोड दिखाई देगा। उसमें से केवल `const firebaseConfig = { ... };` वाले भाग को कॉपी करें।
   
   उदाहरण के लिए:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

---

## Step 8: Admin Panel को Cloud Database से जोड़ना
1. अपने कंप्यूटर पर **`admin.html`** को किसी भी ब्राउज़र में खोलें।
2. पहली बार खोलने पर **Cloud Sync Onboarding** विज़ार्ड स्क्रीन दिखाई देगी।
3. Step 7 में कॉपी किए गए `firebaseConfig` ऑब्जेक्ट को वहां दिए गए टेक्स्टबॉक्स में पेस्ट करें।
4. **"Connect Cloud Database"** पर क्लिक करें।
5. पेज रीलोड होगा और आपका एडमिन पैनल सुरक्षित तरीके से आपके Firebase क्लाउड डेटाबेस से सिंक हो जाएगा!
6. अब आप क्रेडेंशियल्स दर्ज करके लॉगिन कर सकते हैं और पूरी वेबसाइट को सुरक्षित क्लाउड से मैनेज कर सकते हैं।

---
*बधाई हो! आपका Dewangan Photo & Videography पोर्टल अब पूरी तरह क्लाउड के साथ जुड़ चुका है।*
