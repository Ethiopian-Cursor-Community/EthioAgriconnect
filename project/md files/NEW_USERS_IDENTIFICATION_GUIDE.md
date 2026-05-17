# 🆕 How to Identify New Users - Quick Guide

## ✅ New Feature Added!

The User Management page now has **two ways** to identify new users who joined in the last 7 days.

---

## 🎯 Method 1: Visual "NEW" Badge (Automatic)

### What You'll See:
Every user who joined in the last 7 days now has a **blue "NEW" badge** next to their name in the table.

**Visual Indicator:**
```
[User Icon] John Doe [NEW]
                      ↑ Blue badge, animated pulse
```

### Features:
- ✅ **Automatic** - Shows on all users < 7 days old
- ✅ **Animated** - Pulses to draw attention
- ✅ **Color-coded** - Blue background, blue text
- ✅ **Always visible** - No need to click anything

---

## 🎯 Method 2: "New Users This Week" Filter Button

### Where to Find It:
Below the role filter buttons, you'll see a new **"Quick Filter"** row with:
- **🆕 New Users This Week (X)** button - Shows count in parentheses
- **Clear Filters** button - Resets to show all users

### How to Use:

#### Step 1: Click the Button
1. Go to User Management page
2. Look for the blue button: **"🆕 New Users This Week (4)"**
3. Click it

#### Step 2: View Filtered Results
- Table instantly shows **only** users who joined in last 7 days
- Toast notification confirms: "Showing 4 new users (joined in last 7 days)"
- All other users are hidden

#### Step 3: Clear Filter (When Done)
- Click **"Clear Filters"** button
- Returns to showing all users
- Toast confirms: "Showing all users"

---

## 📊 What Counts as "New"?

**Definition:** Users who created their account **less than 7 days ago**

**Calculation:**
```
Account Age = Today - Created Date
If Account Age < 7 days → NEW user
```

**Examples:**
- Joined today → NEW ✅
- Joined 3 days ago → NEW ✅
- Joined 6 days ago → NEW ✅
- Joined 7 days ago → Not new ❌
- Joined 2 weeks ago → Not new ❌

---

## 🧪 Testing the Feature

### Test 1: Check for NEW Badges
1. Go to User Management page
2. Scroll through the user table
3. Look for blue "NEW" badges next to names
4. Count how many you see

**Expected:** Should match the count in AI recommendations (e.g., "4 new users")

### Test 2: Use the Filter Button
1. Click **"🆕 New Users This Week (4)"** button
2. Verify only users with NEW badges are shown
3. Check the count matches
4. Click **"Clear Filters"** to see all users again

### Test 3: Verify with Join Dates
1. Look at the "Joined" column for filtered users
2. All dates should be within last 7 days
3. Compare to today's date

---

## 💡 Use Cases

### Use Case 1: Send Welcome Messages
**Scenario:** AI recommends sending welcome messages to 4 new users

**Steps:**
1. Click "🆕 New Users This Week (4)" button
2. See list of 4 new users
3. Note their names and emails
4. Send personalized welcome emails
5. Click "Clear Filters" when done

### Use Case 2: Onboarding Follow-up
**Scenario:** Check if new users need help

**Steps:**
1. Filter to new users
2. Check their activity scores
3. If low scores, reach out with support
4. Offer onboarding assistance

### Use Case 3: Weekly New User Report
**Scenario:** Weekly admin meeting

**Steps:**
1. Click "New Users This Week" button
2. Take screenshot or note count
3. Review user types (farmers vs consumers)
4. Report growth metrics to team

---

## 🎨 Visual Guide

### Before Enhancement:
```
User Table:
- John Doe        | consumer | Active | Nov 27, 2025
- Jane Smith      | farmer   | Active | Nov 25, 2025
- Bob Johnson     | consumer | Active | Nov 10, 2025
```
❌ No way to identify new users quickly

### After Enhancement:
```
User Table:
- John Doe [NEW]  | consumer | Active | Nov 27, 2025  ← Blue badge!
- Jane Smith [NEW]| farmer   | Active | Nov 25, 2025  ← Blue badge!
- Bob Johnson     | consumer | Active | Nov 10, 2025

Filter Buttons:
[🆕 New Users This Week (2)] [Clear Filters]
         ↑ Click to filter
```
✅ Easy to identify and filter new users!

---

## ✅ Benefits

### Before:
- ❌ Had to manually check join dates
- ❌ No visual indicators
- ❌ Time-consuming to find new users
- ❌ Easy to miss new signups

### After:
- ✅ **Instant visual identification** (NEW badges)
- ✅ **One-click filtering** (button)
- ✅ **Accurate count** (matches AI recommendation)
- ✅ **Time saved** (seconds vs minutes)

---

## 🎯 Integration with AI Recommendations

### How It Works Together:

1. **AI Recommendation Says:**
   > "4 new users this week - send welcome messages"

2. **You Can Now:**
   - See NEW badges on those 4 users
   - Click filter button to isolate them
   - Take action immediately

3. **Complete Workflow:**
   ```
   AI Detects → Recommends Action → You Filter → You Act
   ```

---

## 🐛 Troubleshooting

### No NEW Badges Showing
**Reason:** No users joined in last 7 days
**Check:** Look at "Joined" dates - all should be > 7 days ago

### Filter Button Shows (0)
**Reason:** No new users this week
**Normal:** If no recent signups
**Note:** Button still works, just shows empty list

### Badge Appears on Wrong Users
**Unlikely:** Check system date/time
**Verify:** Compare badge users with "Joined" column dates

---

## 🎉 Summary

You now have **two powerful ways** to identify new users:

1. **Visual Badges** - See at a glance who's new
2. **Filter Button** - Isolate new users with one click

This makes it **easy to act on AI recommendations** like:
- Sending welcome messages
- Providing onboarding support
- Tracking growth metrics
- Following up with new signups

**No more guessing or manual date checking!** 🚀

---

*New Users Identification Guide Version: 1.0*  
*Last Updated: November 28, 2025*  
*Feature Status: ✅ IMPLEMENTED*
