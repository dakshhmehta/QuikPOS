# GitHub Actions Deployment for QuikPOS PWA

## 🚀 Automated Deployment Setup

This repository is configured to automatically deploy QuikPOS PWA to GitHub Pages whenever you push to the `main` branch.

## 📋 Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository: https://github.com/dakshhmehta/QuikPOS
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: GitHub Actions (not "Deploy from a branch")
4. Click **Save**

That's it! The workflow will handle everything else automatically.

### 2. Trigger Deployment

**Automatic (Recommended):**
```bash
git add -A
git commit -m "Deploy QuikPOS PWA"
git push origin main
```

The GitHub Action will automatically:
1. ✅ Install dependencies
2. ✅ Build the PWA (Expo export)
3. ✅ Add .nojekyll file
4. ✅ Verify PWA assets (manifest, icons)
5. ✅ Deploy to GitHub Pages

**Manual Trigger:**
1. Go to: https://github.com/dakshhmehta/QuikPOS/actions
2. Click "Deploy QuikPOS PWA to GitHub Pages"
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow"

## 📊 Workflow Details

### Build Job
- **Runs on**: Ubuntu Latest
- **Node.js**: Version 18
- **Package Manager**: Yarn (with cache)
- **Build Command**: `npx expo export -p web --clear`
- **Output**: `frontend/dist/`

### Deploy Job
- **Environment**: github-pages
- **Needs**: build job to complete
- **Action**: Deploys artifact to GitHub Pages

### Build Time
- First build: ~3-5 minutes
- Subsequent builds: ~1-2 minutes (with cache)

## 🔍 Monitor Deployments

### View Workflow Runs
https://github.com/dakshhmehta/QuikPOS/actions

### Check Deployment Status
Each push to `main` will show:
- ✅ Green check: Deployed successfully
- 🟡 Yellow dot: In progress
- ❌ Red X: Failed (check logs)

### Deployment URL
After successful deployment:
```
https://dakshhmehta.github.io/QuikPOS
```

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
```bash
# Fix: Install missing dependencies locally
cd frontend
yarn add <missing-package>
git add package.json yarn.lock
git commit -m "Add missing dependency"
git push
```

**Error: "Expo export failed"**
- Check `frontend/app.json` is valid JSON
- Ensure all imports in code are correct
- Review build logs in GitHub Actions tab

### Deployment Succeeds but Shows 404

**Solution:**
1. Verify GitHub Pages source is set to "GitHub Actions"
2. Not "Deploy from a branch"
3. Check: Settings → Pages → Source

### Icons Don't Show

The workflow automatically verifies icons. If they're missing:
```bash
# Icons should be in /app/frontend/public/
ls -la /app/frontend/public/*.png

# Rebuild if needed
cd /app/frontend
npx expo export -p web
```

## 📝 Workflow File Location

`.github/workflows/deploy.yml`

## 🔄 Update Workflow

To modify the deployment process:

1. Edit `.github/workflows/deploy.yml`
2. Commit and push changes
3. Next push will use updated workflow

## 🎯 What Gets Deployed

**PWA Assets:**
- manifest.json
- .nojekyll
- icon-192.png
- icon-512.png
- apple-touch-icon.png
- favicon.ico

**App Files:**
- index.html
- All route HTML files
- JavaScript bundles
- CSS and assets
- Font files

## ⚡ Performance

**Build Output:**
- Bundle size: ~2.51 MB
- Routes: 9 pre-rendered pages
- Icons: 6 sizes
- Fonts: 19 icon fonts

**Lighthouse Scores (Expected):**
- Performance: 90+
- PWA: 100
- Accessibility: 90+
- Best Practices: 90+

## 🔐 Security

**Permissions Used:**
- `contents: read` - Read repository code
- `pages: write` - Write to GitHub Pages
- `id-token: write` - OIDC token for deployment

**No Secrets Required:**
- Uses GITHUB_TOKEN automatically
- No manual token configuration needed

## 📱 Post-Deployment Testing

After successful deployment:

**Desktop:**
```
1. Visit https://dakshhmehta.github.io/QuikPOS
2. Open DevTools → Application → Manifest
3. Verify PWA installable
4. Test offline mode
```

**Mobile:**
```
1. Open URL in browser
2. Test "Add to Home Screen"
3. Verify app icon appears
4. Test offline functionality
```

## 🎉 Success Indicators

Deployment successful when you see:
- ✅ Green checkmark in Actions tab
- ✅ URL accessible: https://dakshhmehta.github.io/QuikPOS
- ✅ Install prompt appears in browser
- ✅ PWA works offline
- ✅ All routes accessible

## 📞 Support

**Check Logs:**
```
GitHub Actions → Latest workflow run → View logs
```

**Common Issues:**
- Build timeout: Increase timeout or reduce bundle size
- Deploy fails: Check Pages settings
- 404 errors: Verify .nojekyll file exists

---

## 🚀 Quick Reference

**Deploy Command:**
```bash
git push origin main
```

**Live URL:**
```
https://dakshhmehta.github.io/QuikPOS
```

**Actions Dashboard:**
```
https://github.com/dakshhmehta/QuikPOS/actions
```

**GitHub Pages Settings:**
```
https://github.com/dakshhmehta/QuikPOS/settings/pages
```

---

**Automated with GitHub Actions** ⚡
