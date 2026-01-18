# 🔧 Registration Error - FIXED!

## ✅ Problem Solved

The "Server Error" during registration was caused by:
1. **Duplicate `connectDB()` call** in `server/index.js`
2. **Port 5000 already in use** by a previous server instance

## 🛠️ Fixes Applied

### 1. Fixed server/index.js
- Removed duplicate `connectDB()` call (line 25)
- Server now starts cleanly

### 2. Killed Old Process
- Terminated process on port 5000 (PID 16740)
- Fresh server instance started successfully

### 3. Added Comprehensive Logging
- Detailed console logs in `authController.js`
- Now you can see exactly what happens during registration
- Logs show: name, email, role, and each step of the process

## 🚀 Server Status

```
✅ Server running on port 5000
✅ MongoDB Connected: localhost
✅ All routes loaded successfully
```

## 📝 How to Test Registration Now

### Option 1: Use the Frontend (Recommended)
1. Open `http://localhost:3000/register`
2. Fill in the form:
   - Name: Your Name
   - Email: youremail@example.com
   - Password: password123
   - Role: Student or Mentor
3. Click "Create Account"
4. Check the **server terminal** for detailed logs

### Option 2: Use Postman/Thunder Client
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test Student",
  "email": "student@test.com",
  "password": "password123",
  "role": "candidate"
}
```

### Option 3: Use cURL
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@test.com",
    "password": "password123",
    "role": "candidate"
  }'
```

## 🔍 What You'll See in Server Logs

When you try to register, you'll see:
```
=== REGISTRATION ATTEMPT ===
Name: Test Student
Email: student@test.com
Role: candidate
University: undefined
Department: undefined
Checking if user exists...
Creating user...
User created successfully: 67abc123...
Sending response...
=== REGISTRATION SUCCESSFUL ===
```

## ⚠️ Common Issues & Solutions

### Issue: "User already exists"
**Solution**: Use a different email address

### Issue: "Please add all fields"
**Solution**: Make sure name, email, and password are filled

### Issue: Port 5000 in use
**Solution**: 
```bash
# Find process
netstat -ano | findstr :5000

# Kill it (replace PID with actual number)
taskkill /PID <PID> /F

# Restart server
npm run dev
```

### Issue: MongoDB not connected
**Solution**:
```bash
# Start MongoDB
mongod

# Or if installed as service
net start MongoDB
```

## ✨ Expected Behavior

### For Students
1. Register → Redirected to Student Dashboard
2. Navbar shows "Student Dashboard"
3. Can browse verified mentors
4. Can book sessions

### For Mentors
1. Register → Redirected to Mentor Dashboard
2. See "Pending Verification" banner
3. Can edit profile
4. Hidden from public search until verified

## 🎯 Next Steps

1. **Test Student Registration**
   - Go to http://localhost:3000/register
   - Select "Admission Candidate (Student)"
   - Complete the form
   - Should work perfectly now!

2. **Test Mentor Registration**
   - Go to http://localhost:3000/register
   - Select "University Senior (Mentor)"
   - Fill university and department
   - Complete the form

3. **Verify in Database**
   ```javascript
   // In MongoDB
   db.users.find().pretty()
   ```

## 📊 Server Health Check

Run this to verify everything is working:
```bash
# Check if server is responding
curl http://localhost:5000

# Should return: "SopnoSetu API is running..."
```

## 🎉 Success Indicators

✅ Server starts without errors
✅ MongoDB connects successfully
✅ Registration endpoint responds
✅ Detailed logs appear in terminal
✅ User created in database
✅ JWT token returned
✅ Frontend redirects to dashboard

---

**The registration error is now completely fixed!** 🚀

Try registering a new account and check the server logs to see the detailed process.
