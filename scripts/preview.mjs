import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
const root=path.resolve(import.meta.dirname,'../public')
const base='/electrification-intelligence-site/'
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.xml':'application/xml'}
http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)
 if(pathname==='/'){res.writeHead(302,{Location:base});return res.end()}
 if(!pathname.startsWith(base)){res.writeHead(404);return res.end('Not found')}
 let p=path.resolve(root,pathname.slice(base.length))
 if(p!==root&&!p.startsWith(root+'/')){res.writeHead(403);return res.end()}
 if(fs.existsSync(p)&&fs.statSync(p).isDirectory()) p=path.join(p,'index.html')
 if(!fs.existsSync(p)&&fs.existsSync(p+'.html')) p+='.html'
 if(!fs.existsSync(p)){res.writeHead(404);return res.end('Not found')}
 res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'})
 fs.createReadStream(p).pipe(res)
}).listen(8080,'127.0.0.1',()=>console.log('Preview: http://localhost:8080'+base))
