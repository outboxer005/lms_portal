# Registration Email Validation - Testing Guide

## Quick Start

### What Was Fixed
Users were getting "This email is already registered" error for **ALL** registrations. This has been fixed by:
- Adding proper null-checking in the service layer
- Creating a better database query for email validation
- Implementing case-insensitive email comparison

### How to Test

#### Step 1: Start the Backend
```powershell
cd C:\Freelancing\Infosys-proj\outlms\outlms
java -jar target/outlms-0.0.1-SNAPSHOT.jar
```
Wait for: `Started Application in X seconds`

#### Step 2: Start the Frontend
```powershell
cd C:\Freelancing\Infosys-proj\frontend
npm run dev
```
Application should be at: `http://localhost:3000`

#### Step 3: Test Registration
Navigate to: `http://localhost:3000/register`

---

## Test Cases

### ✅ TEST 1: Basic Registration (Should Succeed)
1. Click Register > Select "STUDENT" role
2. **Step 1: Personal Details**
   - First Name: `John`
   - Last Name: `Smith`
   - Email: `john.smith.001@gmail.com` ← **Use a unique email**
   - Phone: `9876543210`
   - Student ID: `STU123456`
   - Gender: Select from dropdown
   - Marital Status: Select from dropdown

3. **Step 2: Address**
   - Street: `123 Main Street`
   - City: `Mumbai`
   - State: `Maharashtra`
   - Pincode: `400001`

4. **Step 3: Education**
   - Institution Name: `University Name`
   - Degree: `B.Tech`
   - Passing Year: `2026`
   - Grade: `A`

5. **Step 4: Document Upload**
   - Upload an ID proof (PDF/JPG/PNG, max 10MB)

6. Click **Submit**

**Expected Result**: 
- ✅ Success message: "Registration Successful!"
- ✅ Registration ID shown (e.g., STU2026001)
- ✅ Email confirmation sent

---

### ✅ TEST 2: Duplicate Email (Should Fail)
1. Navigate to Register page again
2. Try to register with the **same email** from TEST 1: `john.smith.001@gmail.com`
3. Fill all fields again
4. Click Submit

**Expected Result**:
- ❌ Error message: "This email is already registered. Please use a different email or contact admin if you believe this is an error."
- ✅ Registration does NOT proceed

---

### ✅ TEST 3: Case Insensitive Check (Should Fail)
1. Navigate to Register page
2. Try to register with **uppercase version** of previous email: `JOHN.SMITH.001@GMAIL.COM`
3. Fill all fields
4. Click Submit

**Expected Result**:
- ❌ Error message about duplicate email
- ✅ System recognizes it as the same email despite different case
- ✅ Registration fails as expected

---

### ✅ TEST 4: Staff Registration (Should Succeed)
1. Navigate to Register page
2. Select **STAFF** role
3. Fill details:
   - Email: `staff.member.001@gmail.com` ← Unique email
   - Phone: `9876543210`
   - (Address and document same as student)

4. Submit

**Expected Result**:
- ✅ Success message: "Application Received"
- ✅ Staff registration submitted for approval
- ✅ Confirmation email sent to provided email

---

### ✅ TEST 5: Multiple New Registrations (Stress Test)
Register 5 different users with different emails:
1. `user1.test@gmail.com` → ✅ Should succeed
2. `user2.test@gmail.com` → ✅ Should succeed
3. `user3.test@gmail.com` → ✅ Should succeed
4. `user4.test@gmail.com` → ✅ Should succeed
5. `user5.test@gmail.com` → ✅ Should succeed

Try `user1.test@gmail.com` again → ❌ Should fail with duplicate error

**Expected Result**: All new registrations succeed, duplicate fails

---

## Browser Console Checks

Open **Developer Console** (F12) and check:

### Console Tab
- ❌ No red errors about API calls
- ✅ POST to `/api/student/register` returns `201 Created` on success
- ✅ POST to `/api/student/register` returns `400 Bad Request` on duplicate email

### Network Tab
- Click **Submit** button
- Look for `register` request
- ✅ Success: 
  ```json
  {
    "registrationId": "STU2026001",
    "message": "Registration successful!...",
    "status": "PENDING"
  }
  ```
- ❌ Error (duplicate):
  ```json
  {
    "message": "This email is already registered...",
    "timestamp": "2026-03-16T..."
  }
  ```

---

## Troubleshooting

### Issue: Getting "This email is already registered" for NEW email
❌ **This should not happen anymore**

**Solution**:
1. Clear browser cache (Ctrl+Shift+Del)
2. Restart backend server
3. Check backend logs for errors
4. Try a completely different email

### Issue: Email seems to have spaces or typos
✅ Frontend should have validation

**Check**: Email field shows validation error before submission

### Issue: Getting timeout on Submit
⚠️ Backend might not be running

**Solution**:
1. Check if backend is running: `java -jar target/outlms-0.0.1-SNAPSHOT.jar`
2. Check if MySQL is running
3. Check backend logs for SQL errors

---

## Success Indicators

All tests passed when you see:

| Test | Indicator | Status |
|------|-----------|--------|
| New Registration | Gets unique registration ID | ✅ |
| Duplicate Email | Shows error message | ✅ |
| Case Insensitive | Rejects uppercase variant | ✅ |
| Staff Role | Shows "Application Received" | ✅ |
| Empty Email | Frontend validation | ✅ |
| Multiple Users | All different emails work | ✅ |

---

## Reporting Issues

If you encounter any problems:

1. **Check the error message**: Is it the same "email already registered" error?
2. **Capture the email used**: What exact email did you use?
3. **Check backend logs**: Run backend with visible logs
4. **Clear database**: If needed, can reset test data (contact admin)

---

## Backend Logs to Watch

When registering, you should see in backend console:
```
[StudentRegistrationService] Registering student with email: john@gmail.com
[StudentRegistrationService] Email validation check passed: john@gmail.com
[StudentRegistrationService] Saving registration to database...
[EmailService] Sending registration confirmation email...
[StudentRegistrationController] Registration successful! ID: STU2026001
```

Or on duplicate:
```
[StudentRegistrationService] Email validation check FAILED: john@gmail.com already registered
[StudentRegistrationController] Throwing RuntimeException...
```

---

**Test Status**: Ready for validation  
**Fix Date**: March 16, 2026  
**Build**: outlms-0.0.1-SNAPSHOT.jar
