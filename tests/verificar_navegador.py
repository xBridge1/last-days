"""Regressões no Edge headless real; usa apenas a biblioteca padrão do Python."""
import html
import http.server
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import threading

ROOT = Path(__file__).resolve().parents[1]
EDGE = Path(os.environ.get('PROGRAMFILES(X86)', 'C:/Program Files (x86)')) / 'Microsoft/Edge/Application/msedge.exe'

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args): pass
    def do_GET(self):
        if self.path != '/regressoes.html': return super().do_GET()
        jogo=(ROOT/'deepseek_html_20260912_271fcb.html').read_text(encoding='utf-8')
        suites=[(ROOT/'tests'/nome).read_text(encoding='utf-8') for nome in ['regressoes.js','comunidade.js']]
        script='[].concat('+','.join(suites)+')'
        extra='<pre id="resultadosTeste"></pre><script>try{document.getElementById("resultadosTeste").textContent=JSON.stringify('+script+');}catch(e){document.getElementById("resultadosTeste").textContent=JSON.stringify([{ok:false,nome:"Execução",erro:e.stack}]);}</script>'
        data=jogo.replace('</body>',extra+'</body>').encode('utf-8')
        self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.end_headers();self.wfile.write(data)

def main():
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler)
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with tempfile.TemporaryDirectory(prefix='ultimos-dias-test-') as profile:
            result=subprocess.run([str(EDGE),'--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--dump-dom','--virtual-time-budget=3000','--user-data-dir='+profile,f'http://127.0.0.1:{server.server_port}/regressoes.html'],capture_output=True,timeout=45,creationflags=subprocess.CREATE_NO_WINDOW)
            output=result.stdout.decode('utf-8',errors='replace')
            match=re.search(r'<pre id="resultadosTeste">(.*?)</pre>',output,re.S)
            if not match:
                print('O navegador não retornou os resultados.',result.returncode,result.stderr.decode('utf-8',errors='replace')[-5000:])
                raise SystemExit(1)
            results=json.loads(html.unescape(match.group(1)))
            for r in results:
                print(('PASS' if r['ok'] else 'FAIL')+' '+r['nome'])
                if not r['ok']: print(r['erro'],r.get('stack',''))
            print(f"{sum(r['ok'] for r in results)}/{len(results)} verificações passaram.")
            raise SystemExit(0 if all(r['ok'] for r in results) else 1)
    finally: server.shutdown()

if __name__=='__main__':main()
