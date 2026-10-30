const EXPECTED_SIZE = 780218748;
const EXPECTED_SHA = '26acaabeef6bedce43e6d6cace4a70251f8d096bc9876e487ac25be608ebb36d';
const CACHE_NAME = `thechild-${EXPECTED_SHA.slice(0, 20)}.win`;
const MANIFEST_URL = new URL('./data-chunks/manifest.json', import.meta.url);
let lastTitle = 0;

function setProgress(bytes, total) {
  const now = performance.now();
  if (now - lastTitle > 350 || bytes === total) {
    document.title = `The Child — ${Math.floor(100 * bytes / total)}%`;
    lastTitle = now;
  }
}

async function localCopy() {
  if (!navigator.storage?.getDirectory) return null;
  try {
    const root = await navigator.storage.getDirectory();
    const file = await (await root.getFileHandle(CACHE_NAME)).getFile();
    if (file.size === EXPECTED_SIZE) return file;
    await root.removeEntry(CACHE_NAME);
  } catch {}
  return null;
}

async function storageWriter() {
  try {
    if (!navigator.storage?.getDirectory) return null;
    const estimate = await navigator.storage.estimate?.();
    if (estimate?.quota && estimate.quota - (estimate.usage || 0) < EXPECTED_SIZE + 32 * 1048576) return null;
    const root = await navigator.storage.getDirectory();
    return await (await root.getFileHandle(CACHE_NAME, {create:true})).createWritable();
  } catch { return null; }
}

async function forgetCopy() {
  try { await (await navigator.storage.getDirectory()).removeEntry(CACHE_NAME); } catch {}
}

async function getManifest() {
  const response = await fetch(MANIFEST_URL, {cache:'no-store'});
  if (!response.ok) throw Error(`Manifesto do jogo não publicado (HTTP ${response.status}). Execute o workflow de publicação do GitHub Pages.`);
  const data = await response.json();
  if (data.format !== 'thechild-chunks-v1' || data.size !== EXPECTED_SIZE || data.sha256 !== EXPECTED_SHA ||
      !Array.isArray(data.parts) || data.parts.length < 1 || data.parts.length > 128) {
    throw Error('Manifesto do data.win incompatível com a versão do jogo.');
  }
  let sum = 0;
  for (const part of data.parts) {
    if (!/^data-chunks\/data\.win\.part\d{3}$/.test(part.file) ||
        !Number.isSafeInteger(part.size) || part.size < 1 || part.size > 64 * 1048576) {
      throw Error('Parte inválida no manifesto.');
    }
    sum += part.size;
  }
  if (sum !== EXPECTED_SIZE || new Set(data.parts.map(x=>x.file)).size !== data.parts.length) {
    throw Error('Manifesto incompleto ou duplicado.');
  }
  return data;
}

function verifyHeader(bytes) {
  if (bytes.length < 4 || String.fromCharCode(...bytes.subarray(0, 4)) !== 'FORM') {
    throw Error('O data.win publicado não parece ser um arquivo GameMaker válido.');
  }
}

async function copyFile(FS, stream, source) {
  let bytes = 0;
  const reader = source.stream().getReader();
  try {
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;
      if (bytes + value.length > EXPECTED_SIZE) throw Error('Cache maior que o esperado.');
      if (bytes === 0) {
        if (value.length < 4) {
          const first = new Uint8Array(await source.slice(0,4).arrayBuffer());
          verifyHeader(first);
        } else verifyHeader(value);
      }
      FS.write(stream,value,0,value.length,bytes);
      bytes += value.length;
      setProgress(bytes,EXPECTED_SIZE);
    }
    if (bytes !== EXPECTED_SIZE) throw Error('Cache incompleto.');
  } finally { reader.releaseLock(); }
}

async function copyNetwork(FS, stream, manifest) {
  let writer = await storageWriter();
  let total = 0;
  try {
    for (const part of manifest.parts) {
      const start = total;
      let success = false;
      for (let attempt = 0; attempt < 3 && !success; attempt++) {
        let received = 0;
        try {
          const url = new URL(part.file, import.meta.url);
          const response = await fetch(url, {cache:'no-store', credentials:'same-origin'});
          if (!response.ok || !response.body) throw Error(`HTTP ${response.status} em ${part.file}`);
          const transferLength = response.headers.get('Content-Length');
          const encoding = response.headers.get('Content-Encoding') || 'identity';
          const reader = response.body.getReader();
          let signature = new Uint8Array(4);
          let signatureBytes = 0;
          try {
            if (writer) await writer.seek(start);
            for (;;) {
              const {done,value} = await reader.read();
              if (done) break;
              if (received + value.length > part.size) throw Error(`Parte maior que o esperado: ${part.file} (${received + value.length}/${part.size} bytes; Content-Length=${transferLength || 'ausente'}; encoding=${encoding})`);
              if (start === 0 && signatureBytes < 4) {
                const n = Math.min(4 - signatureBytes, value.length);
                signature.set(value.subarray(0,n), signatureBytes);
                signatureBytes += n;
                if (signatureBytes === 4) verifyHeader(signature);
              }
              FS.write(stream,value,0,value.length,start+received);
              received += value.length;
              if (writer) {
                try { await writer.write(value); }
                catch (err) {
                  console.warn('Cache do jogo indisponível:',err);
                  try { await writer.abort(); } catch {}
                  writer = null;
                  await forgetCopy();
                }
              }
              setProgress(start + received,EXPECTED_SIZE);
            }
          } finally { reader.releaseLock(); }
          if (received !== part.size) throw Error(`Parte incompleta: ${part.file} (${received}/${part.size} bytes; Content-Length=${transferLength || 'ausente'}; encoding=${encoding})`);
          success = true;
        } catch(err) {
          console.warn(`Falha em ${part.file}, tentativa ${attempt+1}/3:`,err);
          if (attempt === 2) throw err;
          await new Promise(resolve=>setTimeout(resolve,(attempt+1)*700));
        }
      }
      total = start + part.size;
    }
    if (total !== EXPECTED_SIZE) throw Error('data.win incompleto.');
    if (writer) await writer.close();
    writer = null;
  } catch (err) {
    if (writer) { try { await writer.abort(); } catch {} }
    await forgetCopy();
    throw err;
  }
}

export async function prepareDataWin(runner) {
  const FS = runner.FS;
  const saved = await localCopy();
  const manifest = saved ? null : await getManifest();
  const stream = FS.open('/game/data.win', 'w');
  try {
    FS.ftruncate(stream.fd,EXPECTED_SIZE);
    if (saved) {
      try { await copyFile(FS,stream,saved); }
      catch (err) {
        console.warn('Cache inválido; usando versão publicada:',err);
        await forgetCopy();
        await copyNetwork(FS,stream,await getManifest());
      }
    } else await copyNetwork(FS,stream,manifest);
    document.title = 'The Child';
  } catch (err) {
    try { FS.unlink('/game/data.win'); } catch {}
    throw err;
  } finally { FS.close(stream); }
}
