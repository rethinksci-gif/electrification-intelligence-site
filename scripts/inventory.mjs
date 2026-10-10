import fs from 'node:fs'
import path from 'node:path'
const root=path.resolve(import.meta.dirname,'..')
function walk(dir) {
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  if(e.isSymbolicLink()) throw new Error(`Symlink forbidden: ${e.name}`)
  const p=path.join(dir,e.name)
  return e.isDirectory()?walk(p):[path.relative(path.join(root,'content'),p)]
 })
}
fs.writeFileSync(path.join(root,'publication-manifest.json'),JSON.stringify({pages:walk(path.join(root,'content')).sort()},null,2)+'\n')
console.log('Inventory refreshed. Run npm run build to validate all publication files.')
