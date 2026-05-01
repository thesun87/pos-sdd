import fs from 'fs';
import path from 'path';

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.spec.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // If it uses (done) and .subscribe(() => { ... done(); }), let's convert to async and firstValueFrom
      if (content.includes('(done)') && content.includes('.subscribe')) {
        if (!content.includes('firstValueFrom')) {
          // add import { firstValueFrom } from 'rxjs';
          content = "import { firstValueFrom } from 'rxjs';\n" + content;
        }

        // replace it('...', (done) => { ... })
        content = content.replace(/it\('([^']+)',\s*\(done\)\s*=>\s*\{/g, "it('$1', async () => {");
        
        // replace .subscribe((result) => { expect(result).toEqual(...); done(); })
        // and .subscribe(() => { expect(...); done(); })
        
        content = content.replace(/\.subscribe\(\(result\)\s*=>\s*\{([\s\S]*?)done\(\);\s*\}\);/g, (match, body) => {
          return `;\n    const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));${body}`;
        });
        
        content = content.replace(/\.subscribe\(\(\)\s*=>\s*\{([\s\S]*?)done\(\);\s*\}\);/g, (match, body) => {
          return `;\n    await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));${body}`;
        });
        
        // Clean up interceptor.intercept(...);;
        content = content.replace(/interceptor\.intercept\([^)]+\);\s*;\s*const result = await/g, "const result = await");
        content = content.replace(/interceptor\.intercept\([^)]+\);\s*;\s*await/g, "await");
        
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

const targetDir = path.resolve('apps/api/src');
processDirectory(targetDir);
