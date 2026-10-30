import argparse
import hashlib
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen

URL = 'https://github.com/LucyYuih/lucyyuih.com/releases/download/TheChildPort/data.win'
SIZE = 780218748
SHA256 = '26acaabeef6bedce43e6d6cace4a70251f8d096bc9876e487ac25be608ebb36d'
CHUNK_SIZE = 48 * 1048576


def build(stream, destination, expected_size, expected_sha, chunk_size):
    root = Path(destination) / 'data-chunks'
    root.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256()
    parts = []
    total = 0
    buffer = bytearray()
    index = 0
    header = b''
    for stale in root.glob('data.win.part*'):
        stale.unlink()
    while True:
        chunk = stream.read(1024 * 1024)
        if not chunk:
            break
        if not header:
            header = chunk[:4]
            if header != b'FORM':
                raise RuntimeError('O asset remoto não começa com FORM')
        digest.update(chunk)
        total += len(chunk)
        if total > expected_size:
            raise RuntimeError('data.win excedeu o tamanho esperado')
        buffer.extend(chunk)
        while len(buffer) >= chunk_size:
            piece = buffer[:chunk_size]
            del buffer[:chunk_size]
            file = f'data.win.part{index:03d}'
            (root / file).write_bytes(piece)
            parts.append({'file': f'data-chunks/{file}', 'size': len(piece)})
            index += 1
        if total and total % (64*1048576) < len(chunk):
            print(f'{total / 1048576:.1f} MiB baixados', flush=True)
    if buffer:
        file = f'data.win.part{index:03d}'
        (root / file).write_bytes(buffer)
        parts.append({'file': f'data-chunks/{file}', 'size': len(buffer)})
    if total != expected_size:
        raise RuntimeError(f'Tamanho divergente: {total} != {expected_size}')
    sha = digest.hexdigest()
    if sha != expected_sha:
        raise RuntimeError(f'SHA-256 divergente: {sha} != {expected_sha}')
    manifest = {'format':'thechild-chunks-v1','size':total,'sha256':sha,'parts':parts}
    (root / 'manifest.json').write_text(json.dumps(manifest,separators=(',',':')),encoding='utf-8')
    print(f'Pronto: {len(parts)} partes, {total} bytes, SHA256 {sha}',flush=True)
    return manifest


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--output', default='_site')
    p.add_argument('--source-file', default=None)
    p.add_argument('--expected-size',type=int,default=SIZE)
    p.add_argument('--expected-sha',default=SHA256)
    p.add_argument('--chunk-size',type=int,default=CHUNK_SIZE)
    args = p.parse_args()
    if args.source_file:
        with open(args.source_file,'rb') as stream:
            build(stream,args.output,args.expected_size,args.expected_sha,args.chunk_size)
    else:
        req = Request(URL,headers={'User-Agent':'TheChild-GitHub-Pages-Builder/1.0','Accept':'application/octet-stream'})
        with urlopen(req,timeout=120) as stream:
            build(stream,args.output,args.expected_size,args.expected_sha,args.chunk_size)


if __name__=='__main__':
    main()
