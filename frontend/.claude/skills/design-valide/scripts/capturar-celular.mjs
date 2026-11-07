// Captura em largura de celular por emulação do Chrome, sem iframe, com a página
// inteira, e lista os erros do console. Diz também se o documento ficou mais
// largo que a tela (rolagem horizontal) e se algo ainda estava carregando.
//
// uso: node capturar-celular.mjs <pasta> <largura> <nome>=<url> [<nome>=<url> ...]
// ex.: node capturar-celular.mjs /tmp/aud 360 estoque.png=http://localhost:3000/estoque
//
// Substitui o iframe do capturar.sh para 360: em 08/10 o iframe travou o estoque
// no carregamento, e o Recharts não desenha dentro dele.
import { spawn } from "node:child_process"
import { writeFileSync } from "node:fs"
const [out, width, ...pages] = process.argv.slice(2)
const port = 9335
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, "--window-size=800,1000",
   "--blink-settings=preferredColorScheme=1", `--user-data-dir=${out}/profile-m`, "about:blank"], { stdio: "ignore" })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let targets
for (let i = 0; i < 40; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break } catch { await sleep(250) } }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener("open", r))
let id = 0; const pending = new Map(); const errors = []
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
  if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description?.split("\n")[0])
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errors.push(m.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 200)) })
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
await send("Page.enable"); await send("Runtime.enable")
await send("Emulation.setDeviceMetricsOverride", { width: Number(width), height: 900, deviceScaleFactor: 1, mobile: true })
for (const p of pages) {
  const i = p.indexOf("="); const name = p.slice(0, i); const url = p.slice(i + 1)
  await send("Page.navigate", { url }); await sleep(5000)
  const h = (await send("Runtime.evaluate", { expression: "JSON.stringify({h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, busy: !!document.querySelector('[aria-busy=true]')})", returnByValue: true })).result.result.value
  const { h: height, w: sw, busy } = JSON.parse(h)
  await send("Emulation.setDeviceMetricsOverride", { width: Number(width), height: Math.min(height, 3000), deviceScaleFactor: 1, mobile: true }); await sleep(600)
  const r = await send("Page.captureScreenshot", { format: "png" })
  writeFileSync(`${out}/${name}`, Buffer.from(r.result.data, "base64"))
  await send("Emulation.setDeviceMetricsOverride", { width: Number(width), height: 900, deviceScaleFactor: 1, mobile: true })
  console.log(name, `altura ${height}, largura do documento ${sw} (viewport ${width}), carregando: ${busy}`)
}
console.log("erros:", errors.length ? errors : "nenhum")
ws.close(); chrome.kill()
