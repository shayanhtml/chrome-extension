# Proxy Configuration Guide

## Version 1.2.0 - Authenticated Proxy Support

### What's New

✅ **Authenticated Proxy Support** - Now supports proxies with username and password  
✅ **10 Pre-configured Proxies** - Ready to use immediately  
✅ **Automatic Rotation** - Rotates through proxies to avoid IP bans  
✅ **WebRequest Authentication** - Handles proxy auth automatically

---

## Your Configured Proxies

You have **10 residential proxies** ready to use:

```
ucyhwuvb:39kdvyd2sus6@142.111.48.253:7030
ucyhwuvb:39kdvyd2sus6@31.59.20.176:6754
ucyhwuvb:39kdvyd2sus6@23.95.150.145:6114
ucyhwuvb:39kdvyd2sus6@198.23.239.134:6540
ucyhwuvb:39kdvyd2sus6@107.172.163.27:6543
ucyhwuvb:39kdvyd2sus6@198.105.121.200:6462
ucyhwuvb:39kdvyd2sus6@64.137.96.74:6641
ucyhwuvb:39kdvyd2sus6@84.247.60.125:6095
ucyhwuvb:39kdvyd2sus6@216.10.27.159:6837
ucyhwuvb:39kdvyd2sus6@142.111.67.146:5611
```

**Credentials:**
- **Username**: `ucyhwuvb`
- **Password**: `39kdvyd2sus6`

---

## How to Configure

### Step 1: Open Extension Settings

1. Click the extension icon
2. Go to **Settings** tab
3. Find the **"Proxy"** textarea field

### Step 2: Add Your Proxies

**Option A: Copy from DEFAULT_PROXIES.txt**
1. Open `DEFAULT_PROXIES.txt` in this folder
2. Copy all lines
3. Paste into the Proxy field in settings
4. Click "Save Settings"

**Option B: Manual Entry**
Paste this into the Proxy field:
```
ucyhwuvb:39kdvyd2sus6@142.111.48.253:7030
ucyhwuvb:39kdvyd2sus6@31.59.20.176:6754
ucyhwuvb:39kdvyd2sus6@23.95.150.145:6114
ucyhwuvb:39kdvyd2sus6@198.23.239.134:6540
ucyhwuvb:39kdvyd2sus6@107.172.163.27:6543
ucyhwuvb:39kdvyd2sus6@198.105.121.200:6462
ucyhwuvb:39kdvyd2sus6@64.137.96.74:6641
ucyhwuvb:39kdvyd2sus6@84.247.60.125:6095
ucyhwuvb:39kdvyd2sus6@216.10.27.159:6837
ucyhwuvb:39kdvyd2sus6@142.111.67.146:5611
```

### Step 3: Reload Extension

1. Go to `edge://extensions/` or `chrome://extensions/`
2. Click **"Reload"** on the extension
3. The proxies are now active!

---

## Supported Formats

The extension supports two proxy formats:

### 1. **Simple Format** (No Authentication)
```
192.168.1.1:8080
10.0.0.1:3128
```

### 2. **Authenticated Format** (With Username:Password)
```
username:password@192.168.1.1:8080
user123:pass456@10.0.0.1:3128
```

---

## How Proxy Rotation Works

1. **Automatic Rotation**: The extension cycles through all proxies in order
2. **Failover**: If a proxy fails, it switches to the next one
3. **Loop**: When reaching the last proxy, it starts over from the first
4. **Authentication**: Username and password are sent automatically

---

## Recommended Settings with Proxies

When using proxies, adjust these settings for best results:

### Settings Tab:
- **Threads**: 2-3 (moderate concurrency)
- **Delay**: 10-15 seconds
- **Skip fetched**: YES

### Download Tab:
- **Threads**: 2-3
- **Delay between downloads**: 10s

---

## Testing Your Proxies

### Quick Test:
1. Configure proxies in settings
2. Start downloading just **1 book** first
3. Check the logs - you should see: `"Ustawiam proxy: ucyhwuvb:***@142.111.48.253:7030"`
4. If successful, the proxy is working

### Troubleshooting:
If downloads fail:
- ✅ Check proxy is online (test at https://whoer.net/)
- ✅ Verify username/password are correct
- ✅ Try reducing threads to 1
- ✅ Increase delay to 15-20 seconds
- ✅ Check your proxy provider's dashboard for usage limits

---

## Multi-Profile Setup (Advanced)

To run **multiple Chrome profiles simultaneously**, assign **different proxies** to each:

**Profile 1 Settings:**
```
ucyhwuvb:39kdvyd2sus6@142.111.48.253:7030
ucyhwuvb:39kdvyd2sus6@31.59.20.176:6754
ucyhwuvb:39kdvyd2sus6@23.95.150.145:6114
```

**Profile 2 Settings:**
```
ucyhwuvb:39kdvyd2sus6@198.23.239.134:6540
ucyhwuvb:39kdvyd2sus6@107.172.163.27:6543
ucyhwuvb:39kdvyd2sus6@198.105.121.200:6462
```

**Profile 3 Settings:**
```
ucyhwuvb:39kdvyd2sus6@64.137.96.74:6641
ucyhwuvb:39kdvyd2sus6@84.247.60.125:6095
ucyhwuvb:39kdvyd2sus6@216.10.27.159:6837
ucyhwuvb:39kdvyd2sus6@142.111.67.146:5611
```

This ensures each profile uses different IP addresses.

---

## Important Notes

⚠️ **Security**: Your proxy credentials are stored **locally** in browser storage  
⚠️ **Privacy**: All traffic to the target website goes through these proxies  
⚠️ **Performance**: Proxies may be slower than direct connection  
⚠️ **Limits**: Check your proxy provider for bandwidth/request limits  

---

## Benefits of Using Proxies

✅ **Avoid IP Bans** - Each proxy has a different IP address  
✅ **Higher Limits** - Distribute requests across multiple IPs  
✅ **Multi-Profile** - Run multiple Chrome profiles simultaneously  
✅ **Geographic Diversity** - Proxies from different locations  
✅ **Bypass Blocks** - Get around temporary IP blacklists  

---

## FAQ

**Q: Do I need to use all 10 proxies?**  
A: No, you can use as few or as many as you want. More proxies = better distribution.

**Q: Can I mix authenticated and non-authenticated proxies?**  
A: Yes! The extension handles both formats automatically.

**Q: How often does it rotate proxies?**  
A: It rotates for each new request or when a proxy fails.

**Q: What if a proxy stops working?**  
A: The extension will automatically try the next proxy in the list.

**Q: Can I add my own proxies?**  
A: Yes! Just add them to the list in the settings (one per line).

**Q: Are these proxies shared with other users?**  
A: That depends on your proxy provider. Residential proxies are typically shared.

---

## Need Help?

If proxies aren't working:
1. Check the extension logs for errors
2. Test proxies manually at https://whoer.net/
3. Verify credentials with your proxy provider
4. Try using just 1 proxy first
5. Increase delays to 20-30 seconds

---

**Version**: 1.2.0  
**Last Updated**: December 17, 2025  
**Feature**: Authenticated Proxy Support
