# GitHub Actions Netlify Staging Deployment - Validation Criteria

## Validation Tests (Infrastructure as Code)

### Test 1: Workflow File Exists and Has Valid YAML Syntax
```bash
Test: GitHub Actions workflow file exists
  - File: .github/workflows/deploy-staging.yml
  - Must be valid YAML
  - Must be readable by GitHub Actions parser

Validation: yq eval '.name' .github/workflows/deploy-staging.yml
Expected: "Deploy Frontend to Netlify Staging"
```

### Test 2: Workflow Triggers on Main Branch Push
```bash
Test: Workflow triggers correctly
  - Triggers on: push to main branch
  - Triggers on: paths include src/**, package.json, vite.config.ts

Validation: yq eval '.on.push.branches' .github/workflows/deploy-staging.yml
Expected: ["main"]
```

### Test 3: Build Command Configured
```bash
Test: Build step is present
  - Step runs: npm ci (install dependencies)
  - Step runs: npm run build (build frontend)

Validation: grep -q "npm run build" .github/workflows/deploy-staging.yml
Expected: Found
```

### Test 4: Netlify Deploy Action Configured
```bash
Test: Netlify deployment is configured
  - Uses: nwtgck/actions-netlify@v2.0
  - Publishes from: ./dist directory
  - Sets production-deploy: false (staging only)
  - Includes deploy message with commit info

Validation: grep -q "nwtgck/actions-netlify" .github/workflows/deploy-staging.yml
Expected: Found
```

### Test 5: Staging Alias Configured
```bash
Test: Staging alias is set
  - Alias: staging
  - URL will be: https://staging--proagentic1.netlify.app

Validation: grep -q "alias: staging" .github/workflows/deploy-staging.yml
Expected: Found
```

### Test 6: GitHub Secrets Are Configured
```bash
Test: Required secrets exist in GitHub
  - Secret: NETLIFY_AUTH_TOKEN (Netlify personal access token)
  - Secret: NETLIFY_SITE_ID (Netlify site ID)

Validation: gh secret list
Expected: Both secrets present
```

### Test 7: Netlify Site ID Matches Project
```bash
Test: Netlify site ID is correct
  - Project: proagentic1
  - Site ID: a429bfae-f686-4fa6-ac88-0d9dbc2c800a

Validation: netlify status | grep "Project Id"
Expected: a429bfae-f686-4fa6-ac88-0d9dbc2c800a
```

### Test 8: Workflow Will Pass on Next Commit
```bash
Test: Workflow syntax is valid (GitHub will accept it)
  - No YAML syntax errors
  - All action references are valid
  - All required inputs provided

Validation: GitHub Actions can parse the file without errors
Expected: No parse errors reported by GitHub
```

## Success Criteria

✅ All 8 validation tests pass
✅ Workflow file is committed to main
✅ Next push to main triggers automatic staging deployment
✅ Staging deployment URL is accessible: https://staging--proagentic1.netlify.app
