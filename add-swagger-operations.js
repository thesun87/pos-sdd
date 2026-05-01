import fs from 'fs';
import path from 'path';

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.controller.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let modified = false;

      // Add ApiOperation before @Get/@Post/@Put/@Patch/@Delete if not present
      const methodRegex = /@(Post|Get|Put|Patch|Delete)\('([^']*)'\)/g;
      
      content = content.replace(methodRegex, (match, method, route, offset, wholeString) => {
        // Check if there's already an @ApiOperation just before this
        const beforeStr = wholeString.substring(Math.max(0, offset - 100), offset);
        if (beforeStr.includes('@ApiOperation')) {
          return match;
        }

        modified = true;
        let summary = `${method} ${route || 'resource'}`;
        // Basic mapping for summary
        if (route === '') summary = method === 'Get' ? 'List/Get resource' : method === 'Post' ? 'Create resource' : 'Update resource';
        
        return `@ApiOperation({ summary: '${summary}' })\n  ${match}`;
      });

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Updated Operations in ${fullPath}`);
      }
    }
  }
}

const targetDir = path.resolve('apps/api/src/modules');
processDirectory(targetDir);
