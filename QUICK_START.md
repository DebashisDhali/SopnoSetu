# 🚀 SopnoSetu - Quick Start Guide

## ⚡ Get Started in 3 Steps

### Step 1: Start the Backend
```bash
cd server
npm run dev
```
✅ Server should start on `http://localhost:5000`
✅ MongoDB should connect successfully

### Step 2: Start the Frontend
```bash
cd client
npm run dev
```
✅ App should start on `http://localhost:3000`

### Step 3: Test the Platform
1. Open `http://localhost:3000`
2. Click "Get Started"
3. Register as a Student or Mentor
4. Explore the dashboard!

---

## 🎯 Key Features to Test

### ✨ Navbar Magic
- Login → Navbar instantly shows "Student Dashboard" or "Mentor Dashboard"
- Logout → Navbar instantly shows "Login" and "Get Started"
- No page refresh needed!

### 🎓 Mentor Verification
1. Register as Mentor
2. See "Pending Verification" banner
3. Login as Admin (create manually in DB)
4. Click "Review Details" on mentor
5. Click "Approve & Verify"
6. Mentor now appears in search!

### 📝 Profile Editing
1. Login as Mentor
2. Click "Edit Profile"
3. Add bio, rate, expertise
4. Add availability slots
5. Save changes

---

## 📚 Documentation Files

- **IMPLEMENTATION_SUMMARY.md** - Complete feature list
- **TESTING_GUIDE.md** - Detailed testing instructions
- **STATUS_REPORT.md** - Project status and metrics
- **README.md** - Project overview

---

## 🐛 Quick Troubleshooting

### Server won't start?
```bash
# Check if MongoDB is running
mongod --version

# Check if port 5000 is free
netstat -ano | findstr :5000
```

### Frontend won't start?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Can't login?
- Check browser console (F12)
- Verify MongoDB is running
- Check server logs for errors

---

## 🎨 Default Credentials

Create these in MongoDB for testing:

**Admin**
```javascript
db.users.insertOne({
  name: "Admin",
  email: "admin@sopnosetu.com",
  password: "$2a$10$YourHashedPassword",
  role: "admin"
})
```

**Test Accounts**
- Student: student@test.com / password123
- Mentor: mentor@test.com / password123

---

## 📞 Need Help?

Check the documentation files:
1. **TESTING_GUIDE.md** for step-by-step testing
2. **IMPLEMENTATION_SUMMARY.md** for technical details
3. **STATUS_REPORT.md** for current status

---

## ✅ Success Checklist

- [ ] MongoDB running
- [ ] Backend server running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] Can access http://localhost:3000
- [ ] Can register a student
- [ ] Can register a mentor
- [ ] Navbar updates after login
- [ ] Can see role-specific dashboard

---

**Happy Testing! 🎉**
