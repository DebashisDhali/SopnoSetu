## 🔍 DEBUGGING REGISTRATION - STEP BY STEP

### Current Status
✅ Backend server running on port 5000
✅ Frontend running on port 3000  
✅ MongoDB connected
✅ Next.js proxy configured correctly

### What to Do Now

1. **Open Browser Console** (F12)
   - Go to http://localhost:3000/register
   - Open Developer Tools (F12)
   - Go to "Console" tab
   - Go to "Network" tab

2. **Try to Register**
   - Fill in the form with your details
   - Click "Create Account"
   - Watch BOTH:
     - Browser console for errors
     - Server terminal for logs

3. **Check Server Logs**
   When you click register, you should see in the server terminal:
   ```
   === REGISTRATION ATTEMPT ===
   Name: Avinondon Dhali
   Email: avinondon30@gmail.com
   Role: candidate
   ...
   ```

4. **Check Network Tab**
   - Look for the request to `/api/auth/register`
   - Check the status code (should be 201 for success, 500 for error)
   - Click on it to see the response

### Possible Issues & Solutions

#### Issue 1: Request Not Reaching Server
**Symptom**: No logs appear in server terminal
**Solution**: 
- Check if frontend is running on port 3000
- Check if backend is running on port 5000
- Verify Next.js proxy in next.config.ts

#### Issue 2: MongoDB Error
**Symptom**: Logs show "Creating user..." but then error
**Solution**:
```bash
# Check MongoDB is running
mongod --version

# Start MongoDB if not running
mongod
```

#### Issue 3: Duplicate Email
**Symptom**: "User already exists" error
**Solution**: Use a different email or clear the database:
```javascript
// In MongoDB
db.users.deleteOne({ email: "avinondon30@gmail.com" })
```

#### Issue 4: Password Hashing Error
**Symptom**: Error during user creation
**Solution**: Already fixed in User model

### Quick Test Commands

#### Test 1: Check if server responds
```bash
curl http://localhost:5000
# Should return: "SopnoSetu API is running..."
```

#### Test 2: Test registration directly
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"role\":\"candidate\"}"
```

#### Test 3: Check MongoDB
```bash
# Connect to MongoDB
mongosh

# Use database
use sopnosetu

# Check users
db.users.find().pretty()
```

### What I Need From You

Please do this:
1. Try to register again
2. Copy the EXACT error from:
   - Browser console (F12 → Console tab)
   - Server terminal (where you ran `npm run dev`)
3. Share both errors with me

### Expected Server Logs

When registration works, you should see:
```
=== REGISTRATION ATTEMPT ===
Name: Avinondon Dhali
Email: avinondon30@gmail.com
Role: candidate
University: undefined
Department: undefined
Checking if user exists...
Creating user...
User created successfully: 67abc123def456...
Sending response...
=== REGISTRATION SUCCESSFUL ===
```

### If You See an Error

The logs will show exactly where it fails:
- "ERROR: Missing required fields" → Form data not sent
- "ERROR: User already exists" → Email already registered
- "Creating user..." then error → Database issue
- No logs at all → Request not reaching server

---

**Please try registering now and share the server terminal output!** 🔍
