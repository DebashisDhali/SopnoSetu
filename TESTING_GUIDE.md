# SopnoSetu - Testing Guide

## 🧪 How to Test the Platform

### Prerequisites
- MongoDB running on `localhost:27017`
- Backend server running on `http://localhost:5000`
- Frontend running on `http://localhost:3000`

## Test Scenarios

### 1. Student Registration & Login
```
1. Go to http://localhost:3000/register
2. Select "Admission Candidate (Student)"
3. Fill in:
   - Name: Test Student
   - Email: student@test.com
   - Password: password123
4. Click "Create Account"
5. Should redirect to Student Dashboard
6. Navbar should show "Student Dashboard" button
```

### 2. Mentor Registration & Verification
```
1. Go to http://localhost:3000/register
2. Select "University Senior (Mentor)"
3. Fill in:
   - Name: Test Mentor
   - Email: mentor@test.com
   - Password: password123
   - University: Dhaka University
   - Department: CSE
4. Click "Create Account"
5. Should redirect to Mentor Dashboard
6. Should see "Pending Verification" banner
7. Navbar should show "Mentor Dashboard" button
```

### 3. Admin Verification Flow
```
1. Create an admin user manually in MongoDB:
   db.users.insertOne({
     name: "Admin User",
     email: "admin@sopnosetu.com",
     password: "$2a$10$...", // hashed password
     role: "admin",
     verified: true,
     isMentorVerified: false
   })

2. Login as admin at http://localhost:3000/login
3. Go to Dashboard (Admin Dashboard)
4. See list of mentor applications
5. Click "Review Details" on pending mentor
6. Modal opens showing:
   - Personal Info
   - Academic Info
   - Verification Document area
7. Click "Approve & Verify"
8. Status changes to "Verified"
9. Modal closes
```

### 4. Mentor Profile Editing
```
1. Login as verified mentor
2. Go to Mentor Dashboard
3. Click "Edit Profile"
4. Update:
   - Bio
   - Hourly Rate
   - Expertise (comma-separated)
   - University Email
5. Add Availability:
   - Select Day (e.g., Saturday)
   - Start Time: 10:00
   - End Time: 12:00
   - Click + button
6. Click "Save All Changes"
7. Profile should update
```

### 5. Student Mentor Search
```
1. Login as student
2. Click "Find Mentors" in navbar
3. Should see only VERIFIED mentors
4. Unverified mentors should NOT appear
5. Click on a mentor card
6. Should see mentor details
7. Can book a session
```

### 6. Navbar State Testing
```
1. Open app in browser
2. Navbar shows "Login" and "Get Started"
3. Login as student
4. Navbar instantly shows "Student Dashboard" and "Logout"
5. Logout
6. Navbar instantly shows "Login" and "Get Started"
7. Login as mentor
8. Navbar shows "Mentor Dashboard"
9. Login as admin
10. Navbar shows "Admin Dashboard"
```

### 7. Session Booking (Student)
```
1. Login as student
2. Go to "Find Mentors"
3. Click on a verified mentor
4. Click "Book Session"
5. Fill in:
   - Date & Time
   - Duration
   - Notes
6. Submit booking
7. Should see in "Upcoming Sessions" on dashboard
```

### 8. Session Management (Mentor)
```
1. Login as mentor
2. Go to Mentor Dashboard
3. See "Session Requests" section
4. Pending sessions show with:
   - Student name
   - Time
   - Notes
   - Amount
5. Click "Accept" or "Reject"
6. Status updates
7. Accepted sessions move to "Upcoming Sessions"
```

## 🐛 Known Issues & Solutions

### Issue: "Registration failed"
**Solution**: 
- Check MongoDB is running
- Check server console for errors
- Verify `.env` file has correct `MONGO_URI`
- Try different email (might already exist)

### Issue: "Module not found: dialog"
**Solution**: 
- File should exist at `client/components/ui/dialog.tsx`
- If not, run: `npx shadcn-ui@latest add dialog`
- Or manually create the file (already done)

### Issue: Navbar doesn't update after login
**Solution**: 
- Check browser console for errors
- Verify `auth-change` event is dispatched
- Clear localStorage and try again

### Issue: Mentor still shows after verification
**Solution**: 
- Refresh the page
- Check `isMentorVerified` field in database
- Verify filter in `getMentors` controller

## 📊 Database Queries for Testing

### Check User Roles
```javascript
db.users.find({}, { name: 1, email: 1, role: 1, isMentorVerified: 1 })
```

### Verify a Mentor Manually
```javascript
db.users.updateOne(
  { email: "mentor@test.com" },
  { $set: { isMentorVerified: true } }
)
```

### Create Admin User
```javascript
// First, hash password using bcrypt
// Then insert:
db.users.insertOne({
  name: "Admin",
  email: "admin@sopnosetu.com",
  password: "$2a$10$YourHashedPasswordHere",
  role: "admin",
  verified: true,
  isMentorVerified: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Check Mentor Profiles
```javascript
db.mentorprofiles.find().populate('user')
```

### Check Sessions
```javascript
db.sessions.find().populate('mentor').populate('candidate')
```

## ✅ Expected Behaviors

### Student Dashboard
- Shows "Student Dashboard" title
- "Find a Mentor" button
- Upcoming sessions list
- Statistics cards

### Mentor Dashboard (Unverified)
- Shows "Mentor Dashboard" title
- Yellow "Pending Verification" banner
- Edit Profile button
- Session requests (empty initially)

### Mentor Dashboard (Verified)
- Shows "Mentor Dashboard" title
- NO verification banner
- Edit Profile button
- Session requests
- Upcoming sessions
- Earnings stats

### Admin Dashboard
- Shows "Admin Dashboard" title
- "Mentor Applications" table
- Each row has "Review Details" button
- Modal shows complete profile
- "Approve & Verify" button
- Status indicators (Verified/Pending)

## 🔍 Debugging Tips

1. **Check Server Logs**: Look at terminal running `npm run dev` in server folder
2. **Check Browser Console**: F12 → Console tab
3. **Check Network Tab**: F12 → Network tab to see API calls
4. **Check MongoDB**: Use MongoDB Compass or CLI
5. **Check localStorage**: F12 → Application → Local Storage

## 🚀 Quick Start Commands

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev

# Terminal 3 - MongoDB (if not running as service)
mongod
```

## 📝 Test Accounts

After running the app, create these test accounts:

1. **Student**: student@test.com / password123
2. **Mentor**: mentor@test.com / password123  
3. **Admin**: admin@sopnosetu.com / admin123 (create manually in DB)

## ✨ Success Criteria

- ✅ Students can register and login
- ✅ Mentors can register and see pending banner
- ✅ Admins can verify mentors
- ✅ Verified mentors appear in search
- ✅ Unverified mentors are hidden
- ✅ Navbar updates instantly on auth changes
- ✅ Role-specific dashboards show correct content
- ✅ Profile editing works for mentors
- ✅ Session booking works
- ✅ No console errors
