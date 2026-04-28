/**
 * Manual Test Checklist for Power BI Lite
 * 
 * Since Playwright browser installation can be heavy, here's a manual test script
 * you can follow to verify all features work.
 * 
 * PRE-REQUISITES:
 * 1. Supabase Storage bucket "datasets" created (private)
 * 2. SQL migration applied
 * 3. Dev server running: npm run dev
 * 
 * TEST FLOW:
 * 
 * === 1. LANDING PAGE ===
 * - Open http://localhost:3000
 * - Verify hero section with "Data insights, no complexity"
 * - Click "Start for free" → should go to /signup
 * 
 * === 2. SIGN UP ===
 * - Fill name: "Test User"
 * - Fill email: "test@example.com" (use unique email)
 * - Fill password: "password123"
 * - Click "Create account"
 * - Should redirect to /dashboard
 * 
 * === 3. UPLOAD DATASET ===
 * - Click "Upload dataset"
 * - Drag & drop a CSV file (or click browse)
 * - Verify preview table shows first 50 rows
 * - Click "Confirm upload"
 * - Should see success toast and redirect to /dashboard
 * 
 * === 4. VIEW DATASET & CLEAN ===
 * - Click on the dataset card (title)
 * - Verify column list with null counts
 * - Try renaming a column: click edit icon, change name, blur
 * - Verify rename success toast
 * - Click "Clean Nulls" button
 * - Verify toast showing rows kept
 * - Click "Back" to return to dashboard
 * 
 * === 5. CHART BUILDER ===
 * - Click "Create Chart" in navbar
 * - Select dataset from dropdown
 * - Chart type grid should show: Bar, Line, Pie, Scatter, KPI, Table
 * - X axis: select categorical column
 * - Y axis: select numeric column
 * - Change aggregation: SUM / AVG / COUNT / MIN / MAX
 * - Verify live preview updates
 * - Add a filter (optional)
 * - Click "Save to Dashboard"
 * - Should redirect to dashboard editor
 * 
 * === 6. DASHBOARD EDITOR ===
 * - Verify widget card appears
 * - Click title to edit inline
 * - Change title, click outside
 * - Verify rename toast
 * - Click "Share" toggle → should turn green "Public" badge
 * - Copy the public URL shown
 * 
 * === 7. PUBLIC VIEW ===
 * - Open public URL in incognito/private window
 * - Should see dashboard without login
 * - Chart should render correctly
 * 
 * === 8. SIGN OUT & SIGN IN ===
 * - Click user avatar → "Sign out"
 * - Go to /login
 * - Sign in with same credentials
 * - Should return to /dashboard with data intact
 * 
 * EXPECTED RESULTS:
 * - All steps complete without errors
 * - Toasts appear for every action
 * - Charts render with correct data
 * - Public link works
 * 
 * AUTOMATED TESTS:
 * Run `npx playwright test` to execute the automated Playwright suite (if browsers installed).
 */

console.log('Test this manually at http://localhost:3000')
