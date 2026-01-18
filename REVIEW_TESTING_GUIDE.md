# Quick Testing Guide - Review System

## 🚀 Getting Started

### 1. Restart the Server (Important!)
The review system has been added, so you need to restart the backend server to load the new routes.

```bash
# In the server terminal (Ctrl+C to stop, then):
cd server
npm run dev
```

The frontend should auto-reload, but if not:
```bash
# In the client terminal:
cd client
npm run dev
```

---

## 🧪 Testing the Review System

### Step 1: Create Test Accounts
You should already have these from the seeder:
- **Student**: `karim@gmail.com` / `123456`
- **Mentor**: `arafat@du.ac.bd` / `123456`

### Step 2: Book a Session
1. Login as **Student** (`karim@gmail.com`)
2. Go to "Find a Mentor"
3. Click on a mentor
4. Select a time slot
5. Click "Book Session"
6. Fill in payment details (use any test transaction ID)
7. Confirm booking

### Step 3: Accept the Session (As Mentor)
1. Logout and login as **Mentor** (`arafat@du.ac.bd`)
2. Go to Mentor Dashboard
3. Find the pending session
4. Click "Accept"

### Step 4: Complete the Session (Manual DB Update)
Since we don't have auto-completion, you need to manually update the session status in MongoDB:

**Option A: Using MongoDB Compass**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Open database: `sopnosetu`
4. Open collection: `sessions`
5. Find your session
6. Edit the document
7. Change `status` from `"accepted"` to `"completed"`
8. Save

**Option B: Using MongoDB Shell**
```bash
mongosh
use sopnosetu
db.sessions.updateOne(
  { _id: ObjectId("YOUR_SESSION_ID") },
  { $set: { status: "completed" } }
)
```

### Step 5: Submit a Review
1. Login as **Student** again
2. Go to Dashboard
3. Find the completed session
4. Click the "Rate" button (⭐ icon)
5. Select star rating (1-5)
6. Write a comment
7. Click "Submit Review"
8. You should see a success message!

### Step 6: Verify Review Display
1. Go to "Find a Mentor"
2. Click on the mentor you reviewed
3. Scroll down to the "Student Reviews" section
4. You should see your review with:
   - Your name
   - Star rating
   - Comment
   - Date posted

### Step 7: Check Rating Update
1. On the mentor profile, check the rating at the top
2. It should show your rating (e.g., "5.0 (1 review)")
3. The mentor's card in the mentor list should also show the updated rating

---

## 🔍 Testing API Endpoints Directly

### Using cURL or Postman

**1. Get Mentor Reviews (Public)**
```bash
curl http://localhost:5000/api/reviews/mentor/MENTOR_USER_ID
```

**2. Create Review (Requires Auth)**
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "mentorId": "MENTOR_USER_ID",
    "sessionId": "SESSION_ID",
    "rating": 5,
    "comment": "Great mentor! Very helpful."
  }'
```

**3. Get My Reviews (Requires Auth)**
```bash
curl http://localhost:5000/api/reviews/my-reviews \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**4. Update Review (Requires Auth)**
```bash
curl -X PUT http://localhost:5000/api/reviews/REVIEW_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "rating": 4,
    "comment": "Updated comment"
  }'
```

**5. Delete Review (Requires Auth)**
```bash
curl -X DELETE http://localhost:5000/api/reviews/REVIEW_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Expected Behavior

### When Creating a Review
- ✅ Success toast appears
- ✅ Modal closes
- ✅ Review appears on mentor profile immediately
- ✅ Mentor rating updates automatically
- ✅ Review count increments

### Validation Checks
- ❌ Cannot review if not logged in
- ❌ Cannot review if not a student
- ❌ Cannot review if session not completed
- ❌ Cannot review same session twice
- ❌ Cannot submit without rating
- ❌ Cannot submit without comment
- ❌ Cannot edit someone else's review

### Rating Calculation
- If mentor has 1 review with 5 stars → Rating: 5.0
- If mentor has 2 reviews (5 stars, 3 stars) → Rating: 4.0
- Rating updates automatically when review is added/edited/deleted

---

## 🐛 Troubleshooting

### "Review route not found" Error
**Solution**: Restart the backend server
```bash
cd server
# Ctrl+C to stop
npm run dev
```

### "Cannot read property 'role' of undefined"
**Solution**: Make sure you're logged in and have a valid token

### Review doesn't appear on mentor profile
**Solution**: 
1. Check browser console for errors
2. Verify the review was created (check MongoDB)
3. Refresh the mentor profile page

### Rating not updating
**Solution**: The rating calculation happens automatically. Check:
1. MongoDB - verify `rating` and `reviewsCount` in `mentorprofiles` collection
2. Refresh the page to see updated values

### "Session not completed" error
**Solution**: Make sure you manually updated the session status to "completed" in MongoDB

---

## 📊 Database Verification

### Check Reviews Collection
```bash
mongosh
use sopnosetu
db.reviews.find().pretty()
```

### Check Mentor Rating
```bash
db.mentorprofiles.find(
  { user: ObjectId("MENTOR_USER_ID") },
  { rating: 1, reviewsCount: 1 }
).pretty()
```

### Check Sessions
```bash
db.sessions.find().pretty()
```

---

## 🎯 Success Criteria

You've successfully tested the review system if:

1. ✅ You can submit a review for a completed session
2. ✅ The review appears on the mentor's profile
3. ✅ The mentor's rating updates automatically
4. ✅ The review count increments
5. ✅ Star ratings display correctly
6. ✅ You cannot submit duplicate reviews
7. ✅ You cannot review incomplete sessions

---

## 📝 Notes

- The review system is fully integrated with the existing session flow
- Reviews are tied to specific sessions to prevent spam
- Mentor ratings are calculated as the average of all reviews
- All review operations are protected by JWT authentication
- The UI provides real-time feedback with toast notifications

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the browser console for errors
2. Check the server terminal for backend errors
3. Verify MongoDB is running
4. Ensure all dependencies are installed
5. Review the documentation in `REVIEW_SYSTEM_COMPLETE.md`

---

**Happy Testing!** 🎉

The review system is production-ready and waiting for your feedback!
