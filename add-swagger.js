import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Add import if missing and there's a property to decorate
  const hasProperty = /^\s+@Is|^\s+[a-zA-Z0-9_]+[?!]?:\s+/m.test(content);
  if (!hasProperty) return;

  if (!content.includes('@nestjs/swagger')) {
    content = "import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';\n" + content;
    modified = true;
  }

  // Regex to match class properties
  const propertyRegex = /^(?:  | |\t)+(?:@[a-zA-Z0-9_]+(?:\([^)]*\))?\s*)*(?:public |private |protected |readonly )?([a-zA-Z0-9_]+)([?!]?):\s*([^;]+);/gm;

  content = content.replace(propertyRegex, (match, propName, optional, type) => {
    if (match.includes('@ApiProperty')) return match; // Already decorated

    const isOptional = optional === '?' || match.includes('@IsOptional');
    const decorator = isOptional ? '@ApiPropertyOptional()' : '@ApiProperty()';

    // Insert before the first decorator or the property itself
    const lines = match.split('\n');
    let insertIndex = 0;
    while (lines[insertIndex] && !lines[insertIndex].trim()) insertIndex++;

    const indent = match.match(/^[ \t]+/)?.[0] || '  ';
    lines.splice(insertIndex, 0, `${indent}${decorator}`);

    modified = true;
    return lines.join('\n');
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.ts') && fullPath.includes('dto')) {
      processFile(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.controller.ts')) {
      // Just add basic controller tags if not present
      let content = fs.readFileSync(fullPath, 'utf-8');
      if (!content.includes('@ApiTags')) {
        const controllerMatch = content.match(/@Controller\('([^']+)'\)/);
        if (controllerMatch) {
          const tag = controllerMatch[1];
          const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
          content = content.replace(/@Controller/, `@ApiTags('${capitalizedTag}')\n@Controller`);
          
          if (!content.includes('@nestjs/swagger')) {
            content = "import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';\n" + content;
          } else {
            content = content.replace(/import {([^}]+)} from '@nestjs\/swagger'/, (match, imports) => {
              const newImports = new Set(imports.split(',').map(i => i.trim()));
              newImports.add('ApiTags');
              newImports.add('ApiOperation');
              newImports.add('ApiResponse');
              return `import { ${Array.from(newImports).join(', ')} } from '@nestjs/swagger'`;
            });
          }
          fs.writeFileSync(fullPath, content, 'utf-8');
          console.log(`Updated Controller ${fullPath}`);
        }
      }
    }
  }
}

const targetDir = path.resolve('apps/api/src/modules');
processDirectory(targetDir);
