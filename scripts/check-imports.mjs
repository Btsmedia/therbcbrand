// Pre-build guard: catches a hook/helper used in a file that forgot to import it,
// which otherwise compiles fine and only crashes in the browser (e.g. "useRef is not defined").
// Runs before `next build`; exits non-zero with a clear message so a broken deploy never ships.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['app', 'components', 'lib'];
// name -> the module it must be imported from
const NEED = {
  useState: 'react', useEffect: 'react', useRef: 'react', useMemo: 'react', useCallback: 'react',
  useContext: 'react', useReducer: 'react', useLayoutEffect: 'react', useId: 'react', useTransition: 'react',
  useRouter: 'next/navigation', usePathname: 'next/navigation', useSearchParams: 'next/navigation', useParams: 'next/navigation',
};

function walk(dir) {
  let out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (/\.(js|jsx)$/.test(e)) out.push(p);
  }
  return out;
}

const problems = [];
for (const root of ROOTS) {
  let files = [];
  try { files = walk(root); } catch { continue; }
  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    // collect what each name is imported from
    const importedFrom = {};
    for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g)) {
      const mod = m[2];
      for (const raw of m[1].split(',')) {
        const name = raw.trim().split(/\s+as\s+/)[0].trim();
        if (name) importedFrom[name] = mod;
      }
    }
    for (const [name, mod] of Object.entries(NEED)) {
      // used as a call `name(` but not imported from the right module
      if (new RegExp(`\\b${name}\\s*\\(`).test(src) && importedFrom[name] !== mod) {
        problems.push(`${file}: uses ${name}() but doesn't import it from '${mod}'`);
      }
    }
  }
}

if (problems.length) {
  console.error('\n✖ Import check failed:\n' + problems.map((p) => '  - ' + p).join('\n') + '\n');
  process.exit(1);
}
console.log('✓ Import check passed');
