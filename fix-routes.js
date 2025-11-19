import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all route files that need to be updated
function findRouteFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findRouteFiles(fullPath, files);
    } else if (item === 'route.ts' && fullPath.includes('[')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Update a route file to use async params
function updateRouteFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern to match route function signatures that need updating
  const pattern = /export async function (GET|POST|PUT|DELETE|PATCH)\(req: Request, \{ params \}: \{ params: \{[^}]*\} \}\)/g;

  content = content.replace(pattern, (match, method) => {
    modified = true;
    // Convert params type to Promise
    const paramsMatch = match.match(/params: \{([^}]*)\}/);
    if (paramsMatch) {
      const paramsType = paramsMatch[1];
      return `export async function ${method}(req: Request, { params }: { params: Promise<{${paramsType}}> }) {
  const resolvedParams = await params;`;
    }
    return match;
  });

  // Update params usage to resolvedParams
  if (modified) {
    // Find all parameter names in the file
    const paramNames = [];
    const paramPattern = /resolvedParams\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let paramMatch;
    while ((paramMatch = paramPattern.exec(content)) !== null) {
      if (!paramNames.includes(paramMatch[1])) {
        paramNames.push(paramMatch[1]);
      }
    }

    // Replace params.paramName with resolvedParams.paramName
    paramNames.forEach(paramName => {
      const regex = new RegExp(`\\bparams\\.${paramName}\\b`, 'g');
      content = content.replace(regex, `resolvedParams.${paramName}`);
    });

    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

// Main execution
const routeFiles = findRouteFiles('./app/api');
console.log(`Found ${routeFiles.length} route files`);

routeFiles.forEach(updateRouteFile);

console.log('Route parameter updates complete!');
