# Cloudinary Setup Guide

## Current Status ✅

Your app is **currently working** and will use **Firebase Storage** for image uploads since Cloudinary is not configured. The upload progress indicator works with both services.

## Why Use Cloudinary? (Optional)

Cloudinary offers some advantages over Firebase Storage:

- Automatic image optimization and transformations
- Built-in CDN for faster delivery
- More generous free tier (25GB storage, 25GB bandwidth/month)
- Advanced image manipulation features

## How to Set Up Cloudinary (Optional)

### Step 1: Create a Cloudinary Account

1. Go to https://cloudinary.com
2. Sign up for a free account
3. Verify your email

### Step 2: Get Your Cloud Name

1. Log in to your Cloudinary dashboard
2. You'll see your **Cloud name** at the top of the dashboard
3. Copy this value

### Step 3: Create an Upload Preset

1. In Cloudinary dashboard, go to **Settings** (gear icon)
2. Click on the **Upload** tab
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Configure the preset:
   - **Signing Mode**: Select **Unsigned** (important!)
   - **Preset name**: Choose a name (e.g., `agri-connect-products`)
   - **Folder**: Optional, you can set a default folder
6. Click **Save**
7. Copy the **preset name**

### Step 4: Update Your .env File

1. Open `agri-connect/project/.env`
2. Uncomment and fill in these lines:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name_here
   ```
3. Replace with your actual values from steps 2 and 3

### Step 5: Restart Your Dev Server

```bash
# Stop your current dev server (Ctrl+C)
# Then restart it
npm run dev
```

## Testing

After setup, try uploading an image in the "Add Product" page. You should see:

- Real-time upload progress bar
- Upload speed (KB/s or MB/s)
- Time remaining estimate
- Uploaded amount vs total size

## Troubleshooting

### Images still uploading to Firebase Storage?

- Make sure you restarted the dev server after updating .env
- Check browser console for any Cloudinary errors
- Verify your Cloud Name and Upload Preset are correct

### Upload fails with Cloudinary?

- The app will automatically fall back to Firebase Storage
- Check that your upload preset is set to "Unsigned"
- Verify your Cloudinary account is active

### Want to stick with Firebase Storage?

- No problem! Just leave the Cloudinary variables commented out
- Firebase Storage works great and the upload progress indicator works the same

## Current Configuration

✅ **Firebase Storage**: Configured and working
❌ **Cloudinary**: Not configured (optional)

Your app will use Firebase Storage by default, which is perfectly fine for most use cases!
